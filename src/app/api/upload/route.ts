import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/parser/extract-text';
import { parseQuestionPaperText } from '@/lib/parser/mcq-parser';
import { parseAnswerKeyText, mergeQuestionsWithAnswerKey } from '@/lib/parser/answer-key-parser';
import { lintParsedExam } from '@/lib/parser/linter';
import { parseWithGeminiAI, GeminiParseOptions } from '@/lib/parser/gemini-parser';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import { ExtractedQuestion } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateDemoUser();
    }

    const formData = await req.formData();
    const paperFile = formData.get('paperFile') as File | null;
    const keyFile = formData.get('keyFile') as File | null;
    const paperTextInput = formData.get('paperText') as string | null;
    const keyTextInput = formData.get('keyText') as string | null;
    const useGeminiForm = formData.get('useGemini');
    // Default useGemini to true if not explicitly set to 'false'
    const useGemini = useGeminiForm === null ? true : useGeminiForm === 'true';
    const geminiApiKey = formData.get('geminiApiKey') as string | null;

    let paperText = paperTextInput || '';
    let keyText = keyTextInput || '';
    let paperBuffer: Buffer | undefined = undefined;
    let keyBuffer: Buffer | undefined = undefined;

    // 1. Extract paper text and save buffer if file provided
    if (paperFile && paperFile.size > 0) {
      paperBuffer = Buffer.from(await paperFile.arrayBuffer());
      const res = await extractTextFromFile(paperBuffer, paperFile.name, paperFile.type);
      if (res.text) {
        paperText = res.text + (paperText ? '\n' + paperText : '');
      }
    }

    // 2. Extract key text and save buffer if file provided
    if (keyFile && keyFile.size > 0) {
      keyBuffer = Buffer.from(await keyFile.arrayBuffer());
      const res = await extractTextFromFile(keyBuffer, keyFile.name, keyFile.type);
      if (res.text) {
        keyText = res.text + (keyText ? '\n' + keyText : '');
      }
    }

    // Check if we have either a binary file or text
    const hasPaperContent = (paperBuffer && paperBuffer.length > 0) || Boolean(paperText.trim());
    if (!hasPaperContent) {
      return NextResponse.json(
        { error: 'No readable text or file could be found in the uploaded question paper.' },
        { status: 400 }
      );
    }

    let questions: ExtractedQuestion[] = [];
    let extractionMethod = 'heuristic';
    let aiError: string | undefined = undefined;

    const availableApiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    // 3. Primary: Try Gemini AI Extraction (Native PDF Multimodal + Text)
    if (useGemini && availableApiKey) {
      const geminiOpts: GeminiParseOptions = {
        paperText: paperText || undefined,
        paperBuffer,
        paperMimeType: paperFile?.type,
        answerKeyText: keyText || undefined,
        answerKeyBuffer: keyBuffer,
        answerKeyMimeType: keyFile?.type,
        apiKey: availableApiKey,
      };

      const aiResult = await parseWithGeminiAI(geminiOpts);
      if (aiResult.questions && aiResult.questions.length > 0) {
        questions = aiResult.questions;
        extractionMethod = 'gemini-ai';
      } else if (aiResult.error) {
        aiError = aiResult.error;
        console.warn('Gemini AI parsing fallback triggered:', aiResult.error);
      }
    }

    // 4. Fallback: High-Precision Enhanced Heuristic Parser
    if (questions.length === 0) {
      questions = parseQuestionPaperText(paperText);
      extractionMethod = 'heuristic';
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not detect any questions in the uploaded document. Please ensure the document contains multiple-choice questions with answer choices (A, B, C, D).',
        },
        { status: 400 }
      );
    }

    // 5. Parse answer key from separate answer key input if not already embedded
    const answerKeyMap = parseAnswerKeyText(keyText);
    if (Object.keys(answerKeyMap).length > 0) {
      mergeQuestionsWithAnswerKey(questions, answerKeyMap);
    }

    // 6. Lint and validate
    const linter = lintParsedExam(questions, answerKeyMap);

    return NextResponse.json({
      success: true,
      questions,
      answerKeyMap,
      linter,
      extractionMethod,
      aiEnhanced: extractionMethod === 'gemini-ai',
      aiError,
      paperTextLength: paperText.length,
      detectedQuestionCount: questions.length,
      detectedKeyCount: Object.keys(answerKeyMap).length,
    });
  } catch (err: any) {
    console.error('Upload & parse error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to parse uploaded documents' },
      { status: 500 }
    );
  }
}
