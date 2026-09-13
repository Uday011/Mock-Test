import { ExtractedQuestion } from '../types';
import { AnswerKeyMap } from './answer-key-parser';

export interface LintResult {
  hasIssues: boolean;
  warnings: string[];
  errors: string[];
  missingAnswerQuestions: number[];
  missingOptionQuestions: number[];
  duplicateQuestions: number[];
  missingSequenceQuestions: number[];
  overallConfidence: number; // 0 to 100
}

export function lintParsedExam(
  questions: ExtractedQuestion[],
  answerKeyMap: AnswerKeyMap
): LintResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const missingAnswerQuestions: number[] = [];
  const missingOptionQuestions: number[] = [];
  const duplicateQuestions: number[] = [];
  const missingSequenceQuestions: number[] = [];

  if (questions.length === 0) {
    return {
      hasIssues: true,
      warnings: ['No questions could be extracted from the uploaded document.'],
      errors: ['No questions found.'],
      missingAnswerQuestions,
      missingOptionQuestions,
      duplicateQuestions,
      missingSequenceQuestions,
      overallConfidence: 0,
    };
  }

  // 1. Check duplicate question numbers
  const seenNumbers = new Set<number>();
  for (const q of questions) {
    if (seenNumbers.has(q.question_number)) {
      duplicateQuestions.push(q.question_number);
    }
    seenNumbers.add(q.question_number);
  }
  if (duplicateQuestions.length > 0) {
    errors.push(`Duplicate question number(s) detected: ${duplicateQuestions.join(', ')}.`);
  }

  // 2. Check for missing numbers in sequential range
  const sortedNums = Array.from(seenNumbers).sort((a, b) => a - b);
  const minNum = sortedNums[0];
  const maxNum = sortedNums[sortedNums.length - 1];
  for (let n = minNum; n <= maxNum; n++) {
    if (!seenNumbers.has(n)) {
      missingSequenceQuestions.push(n);
    }
  }
  if (missingSequenceQuestions.length > 0) {
    warnings.push(`Possible missing question(s) in sequence: #${missingSequenceQuestions.join(', #')}.`);
  }

  // 3. Check questions without valid options
  for (const q of questions) {
    if (!q.options || q.options.length < 2) {
      missingOptionQuestions.push(q.question_number);
    }
  }
  if (missingOptionQuestions.length > 0) {
    errors.push(`Question(s) with fewer than 2 options: #${missingOptionQuestions.join(', #')}.`);
  }

  // 4. Check matching between questions and answer key
  const totalQuestions = questions.length;
  const keyQuestions = Object.keys(answerKeyMap).map(Number);
  const totalKeys = keyQuestions.length;

  for (const q of questions) {
    if (!q.correct_answer && !answerKeyMap[q.question_number]) {
      missingAnswerQuestions.push(q.question_number);
    }
  }

  if (missingAnswerQuestions.length > 0) {
    warnings.push(
      `No correct answer key found for ${missingAnswerQuestions.length} question(s) (e.g. #${missingAnswerQuestions.slice(0, 5).join(', #')}${missingAnswerQuestions.length > 5 ? '...' : ''}). You can select them manually in the review screen.`
    );
  }

  if (totalKeys > 0 && totalKeys !== totalQuestions) {
    warnings.push(
      `Answer key count (${totalKeys}) does not match question count (${totalQuestions}). Please verify in the review screen.`
    );
  }

  // Calculate overall confidence
  let confidenceScore = 100;
  if (errors.length > 0) {
    confidenceScore -= errors.length * 20;
  }
  if (missingAnswerQuestions.length > 0) {
    const missingRatio = missingAnswerQuestions.length / totalQuestions;
    confidenceScore -= Math.round(missingRatio * 30);
  }
  if (missingOptionQuestions.length > 0) {
    confidenceScore -= missingOptionQuestions.length * 15;
  }
  if (missingSequenceQuestions.length > 0) {
    confidenceScore -= 10;
  }

  const overallConfidence = Math.max(10, Math.min(100, confidenceScore));

  return {
    hasIssues: errors.length > 0 || warnings.length > 0,
    warnings,
    errors,
    missingAnswerQuestions,
    missingOptionQuestions,
    duplicateQuestions,
    missingSequenceQuestions,
    overallConfidence,
  };
}
