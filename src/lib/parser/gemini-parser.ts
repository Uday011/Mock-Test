import { ExtractedQuestion } from '../types';

export interface GeminiParseOptions {
  paperText?: string;
  paperBuffer?: Buffer;
  paperMimeType?: string;
  answerKeyText?: string;
  answerKeyBuffer?: Buffer;
  answerKeyMimeType?: string;
  apiKey?: string;
}

/**
 * High-accuracy MCQ exam paper extraction powered by Google Gemini 3.6 Flash.
 * Supports direct native PDF document parsing (multimodal binary) and plain text.
 * Accurately detects complete multi-line question lengths, background passages,
 * numbered sub-statements, Assertion-Reason questions, and clean answer options.
 */
export async function parseWithGeminiAI(
  optionsOrPaperText: GeminiParseOptions | string,
  legacyKeyText?: string,
  legacyApiKey?: string
): Promise<{ questions: ExtractedQuestion[]; error?: string; modelUsed?: string }> {
  // Normalize arguments for backwards compatibility
  let opts: GeminiParseOptions;
  if (typeof optionsOrPaperText === 'string') {
    opts = {
      paperText: optionsOrPaperText,
      answerKeyText: legacyKeyText,
      apiKey: legacyApiKey,
    };
  } else {
    opts = optionsOrPaperText;
  }

  const key = opts.apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      questions: [],
      error: 'No Gemini API key found. Falling back to high-precision heuristic parser.',
    };
  }

  try {
    const parts: any[] = [];

    // 1. If paper is a PDF or image and buffer is provided, attach as native multimodal inlineData
    if (opts.paperBuffer && opts.paperBuffer.length > 0) {
      const isPdf = opts.paperMimeType?.includes('pdf') || !opts.paperMimeType;
      const mime = isPdf ? 'application/pdf' : opts.paperMimeType || 'application/pdf';
      parts.push({
        inlineData: {
          mimeType: mime,
          data: opts.paperBuffer.toString('base64'),
        },
      });
    }

    // 2. If answer key is also a PDF buffer, attach it
    if (opts.answerKeyBuffer && opts.answerKeyBuffer.length > 0 && opts.answerKeyMimeType?.includes('pdf')) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: opts.answerKeyBuffer.toString('base64'),
        },
      });
    }

    // 3. Construct structured prompt with strict guidelines on question length and boundary detection
    const prompt = `You are an elite exam parser and OCR specialist. Analyze the provided exam question paper (document/text) and answer key, and convert all multiple-choice questions (MCQs) into a clean, highly structured JSON array.

CRITICAL RULES FOR ACCURATE EXTRACTION:
1. QUESTION LENGTH & COMPLETENESS:
   - A question can be very long. It may include multi-paragraph background passages, case studies, numbered statements (e.g., "1. ...", "2. ...", followed by "Which of the statements given above is/are correct?"), Assertion & Reason statements, data tables, or code snippets.
   - You MUST capture the FULL, UNTRUNCATED question prompt into "question_text".
   - NEVER truncate, summarize, or prematurely cut off a question.
   - Do NOT mistake numbered sub-statements (like 1., 2., 3. or (i), (ii)) as new questions.

2. OPTIONS EXTRACTION:
   - Extract all options cleanly into the "options" array.
   - Each option MUST have a clean uppercase label ("A", "B", "C", "D", etc.) and the exact text of the option in "text".
   - Do not duplicate option labels inside the option text.

3. ANSWER KEY RESOLUTION:
   - If an answer key is provided in the document or attached text, map each question's correct answer to "correct_answer" ("A", "B", "C", "D", etc.).
   - If an explanation, rationale, or solution is available in the document, extract it into "explanation".

4. OUTPUT FORMAT:
   Return ONLY a valid JSON array adhering strictly to this schema:
[
  {
    "question_number": 1,
    "question_text": "Full question prompt including any passage, statements or context...",
    "options": [
      { "label": "A", "text": "Option text" },
      { "label": "B", "text": "Option text" },
      { "label": "C", "text": "Option text" },
      { "label": "D", "text": "Option text" }
    ],
    "correct_answer": "A",
    "explanation": "Explanation text or null",
    "confidence": 1.0
  }
]

${opts.paperText ? `\n--- QUESTION PAPER TEXT ---\n${opts.paperText}\n` : ''}
${opts.answerKeyText ? `\n--- ANSWER KEY / SOLUTIONS TEXT ---\n${opts.answerKeyText}\n` : ''}
`;

    parts.push({ text: prompt });

    const modelName = 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        questions: [],
        error: `Gemini API error (${response.status}): ${errText.slice(0, 300)}`,
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return { questions: [], error: 'Empty response received from Gemini' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      // Fallback: strip markdown fences if present
      const cleanJson = candidateText.replace(/```json\s*|```\s*$/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    let rawQuestions: any[] = [];
    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      rawQuestions = parsed.questions;
    }

    if (rawQuestions.length === 0) {
      return { questions: [], error: 'Gemini did not detect any MCQ questions in document' };
    }

    // Normalize and sanitize questions
    const normalized: ExtractedQuestion[] = rawQuestions.map((q, idx) => {
      const qNum = typeof q.question_number === 'number' ? q.question_number : idx + 1;
      const opts = Array.isArray(q.options)
        ? q.options.map((o: any, oIdx: number) => {
            const label = (o.label || String.fromCharCode(65 + oIdx)).toUpperCase();
            const text = String(o.text || '').trim();
            return { label, text };
          })
        : [];

      return {
        question_number: qNum,
        question_text: String(q.question_text || '').trim(),
        options: opts,
        correct_answer: q.correct_answer ? String(q.correct_answer).toUpperCase().trim() : undefined,
        explanation: q.explanation ? String(q.explanation).trim() : undefined,
        confidence: typeof q.confidence === 'number' ? q.confidence : 0.98,
      };
    });

    return {
      questions: normalized,
      modelUsed: modelName,
    };
  } catch (err: any) {
    console.error('Gemini parse error:', err);
    return {
      questions: [],
      error: err?.message || 'Gemini extraction failed',
    };
  }
}
