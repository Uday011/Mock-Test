import { ExtractedQuestion, QuestionOption } from '../types';

/**
 * Enhanced heuristic MCQ parser designed to accurately detect full question lengths,
 * multi-paragraph passages, numbered sub-statements (e.g. 1. ..., 2. ...), Assertion-Reason
 * questions, and cleanly separated options.
 */
export function parseQuestionPaperText(text: string): ExtractedQuestion[] {
  if (!text || !text.trim()) return [];

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');

  // 1. Clean out common PDF artifacts (headers, footers, page numbering)
  const lines = rawLines.filter((l) => {
    const trimmed = l.trim();
    if (!trimmed) return true; // keep blank lines for paragraph flow
    if (/^Page\s+\d+\s+of\s+\d+/i.test(trimmed)) return false;
    if (/^[-—_]{3,}\s*Page\s+\d+\s*[-—_]{3,}/i.test(trimmed)) return false;
    if (/^(?:CONFIDENTIAL|DO NOT COPY|ALL RIGHTS RESERVED)$/i.test(trimmed)) return false;
    return true;
  });

  const explicitQRegex = /^\s*(?:(?:Q|Question|Ques)\s*[\.:#\-]?\s*(\d+)[\.\:\-]?)\s*(.*)$/i;
  const numberedQRegex = /^\s*(\d+)[\.\:\)]\s+(.*)$/;
  const answerRegex = /^\s*(?:Answer|Ans|Correct\s*Answer|Key)[\:\-\s]+([A-Ha-h])/i;
  const explanationRegex = /^\s*(?:Explanation|Solution|Sol|Rationale|Note)[\:\-]\s*(.*)$/i;
  const singleOptionPrefixRegex = /^\s*(?:(?:\(([A-Ha-h])\))|(?:([A-Ha-h])[\.\)\]]))\s+(.*)$/;

  interface TempQuestion {
    qNum: number;
    questionLines: string[];
    options: QuestionOption[];
    correctAnswer?: string;
    explanation?: string;
  }

  const questions: TempQuestion[] = [];
  let currentQ: TempQuestion | null = null;
  let inOptions = false;
  let inExplanation = false;
  let currentOpt: { label: string; textLines: string[] } | null = null;

  const flushOption = () => {
    if (currentQ && currentOpt) {
      currentQ.options.push({
        label: currentOpt.label,
        text: currentOpt.textLines.join(' ').trim(),
      });
      currentOpt = null;
    }
  };

  const flushQuestion = () => {
    flushOption();
    if (currentQ) {
      questions.push(currentQ);
      currentQ = null;
      inOptions = false;
      inExplanation = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // If we are currently collecting question lines, an empty line marks a paragraph break
      if (currentQ && !inOptions && !inExplanation && currentQ.questionLines.length > 0) {
        const lastLine = currentQ.questionLines[currentQ.questionLines.length - 1];
        if (lastLine !== '') {
          currentQ.questionLines.push('');
        }
      }
      continue;
    }

    // 1. Check for New Question Header
    const expQMatch = trimmed.match(explicitQRegex);
    const numQMatch = trimmed.match(numberedQRegex);

    let isNewQuestion = false;
    let detectedQNum = 0;
    let remainingText = '';

    if (expQMatch) {
      detectedQNum = parseInt(expQMatch[1], 10);
      remainingText = expQMatch[2];
      isNewQuestion = true;
    } else if (numQMatch) {
      const num = parseInt(numQMatch[1], 10);
      if (!currentQ && num === 1) {
        detectedQNum = 1;
        remainingText = numQMatch[2];
        isNewQuestion = true;
      } else if (currentQ) {
        // Only treat numbered lines like "2. " as a new question IF the previous question
        // has already completed its options, answer, or explanation!
        // This preserves sub-statements like "1. Photosynthesis occurs..." or "2. Respiration occurs..."
        const prevQComplete =
          currentQ.options.length >= 2 || inExplanation || Boolean(currentQ.correctAnswer);
        if (prevQComplete) {
          detectedQNum = num;
          remainingText = numQMatch[2];
          isNewQuestion = true;
        }
      }
    }

    if (isNewQuestion && detectedQNum > 0) {
      flushQuestion();
      currentQ = {
        qNum: detectedQNum,
        questionLines: remainingText ? [remainingText] : [],
        options: [],
      };
      inOptions = false;
      inExplanation = false;
      continue;
    }

    // If no question is active yet, initialize Question 1 with this line
    if (!currentQ) {
      currentQ = {
        qNum: 1,
        questionLines: [trimmed],
        options: [],
      };
      continue;
    }

    // 2. Check for Explanation
    const expMatch = trimmed.match(explanationRegex);
    if (expMatch) {
      flushOption();
      inExplanation = true;
      inOptions = false;
      currentQ.explanation = expMatch[1] || '';
      continue;
    }

    if (inExplanation) {
      currentQ.explanation = (currentQ.explanation ? currentQ.explanation + ' ' : '') + trimmed;
      continue;
    }

    // 3. Check for Answer line (e.g. "Answer: B", "Ans: A")
    const ansMatch = trimmed.match(answerRegex);
    if (ansMatch) {
      flushOption();
      currentQ.correctAnswer = ansMatch[1].toUpperCase();
      continue;
    }

    // 4. Check for Horizontal Multiple Options in a single line
    // e.g. "(A) 1 only    (B) 2 only    (C) Both    (D) None"
    const horizontalOptionMatches = [
      ...trimmed.matchAll(
        /(?:^|\s{2,}|\t)(?:[\(\[]([A-Ha-h])[\)\]]|([A-Ha-h])[\.\:\)])\s+([^\(\[\t]+?(?=(?:\s{2,}|\t)[\(\[]?[A-Ha-h][\)\]\.\:\)]|$))/g
      ),
    ];

    if (horizontalOptionMatches.length >= 2) {
      inOptions = true;
      flushOption();
      for (const m of horizontalOptionMatches) {
        const l = (m[1] || m[2]).toUpperCase();
        const t = (m[3] || '').trim();
        if (l && t) {
          currentQ.options.push({ label: l, text: t });
        }
      }
      continue;
    }

    // 5. Check Single Option line (e.g. "A. Option text" or "(A) Option text")
    // Ensure it's not "Assertion (A):" or "Statement (A):"
    const isAssertion = /^(?:Assertion|Reason|Statement|Condition)\s*[\(\[]?[A-Za-z0-9]+[\)\]]?[\:\-]/i.test(
      trimmed
    );
    const optMatch = !isAssertion ? trimmed.match(singleOptionPrefixRegex) : null;

    if (optMatch) {
      const optLabel = (optMatch[1] || optMatch[2]).toUpperCase();
      const optText = optMatch[3];

      // Option sequencing:
      // Option A must come first, or follow previous options
      const canStartOptions =
        optLabel === 'A' || inOptions || currentOpt !== null || currentQ.options.length > 0;

      if (canStartOptions) {
        inOptions = true;
        flushOption();
        currentOpt = {
          label: optLabel,
          textLines: optText ? [optText] : [],
        };
        continue;
      }
    }

    // 6. Accumulate content
    if (inOptions && currentOpt) {
      // Continuation line for current option
      currentOpt.textLines.push(trimmed);
    } else if (!inOptions) {
      // Pre-options: this is question text!
      // Preserves full multi-paragraph passages, statements 1, 2, 3, Assertion & Reason!
      currentQ.questionLines.push(trimmed);
    }
  }

  flushQuestion();

  // 7. Format output and compute confidence
  return questions.map((q) => {
    // Join lines while preserving paragraph spacing
    const promptText = q.questionLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || `Question ${q.qNum}`;

    let confidence = 1.0;
    const warnings: string[] = [];

    if (q.options.length < 2) {
      confidence -= 0.4;
      warnings.push('Fewer than 2 options detected. Verify option markers.');
    }
    if (promptText.length < 5) {
      confidence -= 0.3;
      warnings.push('Question text appears very short.');
    }

    return {
      question_number: q.qNum,
      question_text: promptText,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation ? q.explanation.trim() : undefined,
      confidence: Math.max(0.1, Math.round(confidence * 100) / 100),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  });
}
