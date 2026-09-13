import { Question, UserAnswer } from './types';

export interface EvaluationInput {
  questions: Question[];
  userResponses: {
    question_id: string;
    selected_answer: string | null;
    is_marked_for_review?: boolean;
  }[];
}

export interface EvaluationResult {
  total_questions: number;
  attempted_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  positive_marks: number;
  negative_marks: number;
  final_score: number;
  maximum_marks: number;
  percentage: number;
  accuracy: number;
  detailed_answers: {
    question_id: string;
    question_number: number;
    selected_answer: string | null;
    correct_answer: string;
    is_correct: boolean;
    marks_awarded: number;
    negative_marks_deducted: number;
    is_marked_for_review: boolean;
  }[];
}

/**
 * Normalizes answer string for matching, handling spaces, uppercase, and delimiter variations
 */
export function normalizeAnswer(ans: string | null | undefined): string {
  if (!ans) return '';
  return ans
    .toUpperCase()
    .replace(/[^A-Z0-9,]/g, '')
    .split(',')
    .filter(Boolean)
    .sort()
    .join(',');
}

/**
 * Checks if user's selected answer matches the correct answer.
 * Handles single answer ('A') and multiple correct choices ('A,B' or 'A/B').
 */
export function checkAnswerCorrectness(userAns: string | null | undefined, correctAns: string | null | undefined): boolean {
  if (!userAns || !correctAns) return false;
  
  const normUser = normalizeAnswer(userAns);
  const rawCorrect = (correctAns || '').toUpperCase().trim();

  // If correct answer specifies alternatives like "A/B" or "A OR B"
  if (rawCorrect.includes('/') || rawCorrect.includes('OR')) {
    const options = rawCorrect.split(/\/|\s+OR\s+/).map(o => normalizeAnswer(o));
    return options.includes(normUser);
  }

  const normCorrect = normalizeAnswer(rawCorrect);
  return normUser === normCorrect;
}

/**
 * Evaluates full exam submission server-side.
 */
export function evaluateExam({ questions, userResponses }: EvaluationInput): EvaluationResult {
  const responseMap = new Map<string, { selected_answer: string | null; is_marked_for_review?: boolean }>();
  for (const resp of userResponses) {
    responseMap.set(resp.question_id, resp);
  }

  let total_questions = questions.length;
  let attempted_questions = 0;
  let correct_answers = 0;
  let incorrect_answers = 0;
  let unanswered_questions = 0;
  let positive_marks = 0;
  let negative_marks = 0;
  let maximum_marks = 0;

  const detailed_answers: EvaluationResult['detailed_answers'] = [];

  for (const q of questions) {
    const resp = responseMap.get(q.id);
    const selected = resp?.selected_answer ? resp.selected_answer.trim().toUpperCase() : null;
    const is_marked = !!resp?.is_marked_for_review;

    const qCorrectMarks = Number(q.correct_marks) || 4;
    const qNegativeMarks = Number(q.negative_marks) || 0;
    const qUnansweredMarks = Number(q.unanswered_marks) || 0;

    maximum_marks += qCorrectMarks;

    let is_correct = false;
    let awarded = 0;
    let deducted = 0;

    if (!selected) {
      // Unanswered
      unanswered_questions++;
      awarded = qUnansweredMarks;
      // negative marks are NOT deducted for unanswered unless configured
      is_correct = false;
    } else {
      // Attempted
      attempted_questions++;
      is_correct = checkAnswerCorrectness(selected, q.correct_answer);

      if (is_correct) {
        correct_answers++;
        awarded = qCorrectMarks;
        positive_marks += qCorrectMarks;
      } else {
        incorrect_answers++;
        deducted = qNegativeMarks;
        negative_marks += qNegativeMarks;
      }
    }

    detailed_answers.push({
      question_id: q.id,
      question_number: q.question_number,
      selected_answer: selected,
      correct_answer: q.correct_answer,
      is_correct,
      marks_awarded: awarded,
      negative_marks_deducted: deducted,
      is_marked_for_review: is_marked,
    });
  }

  const rawFinalScore = positive_marks - negative_marks;
  // Round to 2 decimal places to prevent floating point inaccuracies like 5.999999999
  const final_score = Math.round(rawFinalScore * 100) / 100;
  const positive_marks_rounded = Math.round(positive_marks * 100) / 100;
  const negative_marks_rounded = Math.round(negative_marks * 100) / 100;
  const maximum_marks_rounded = Math.round(maximum_marks * 100) / 100;

  const percentage = maximum_marks > 0 
    ? Math.round((Math.max(0, final_score) / maximum_marks) * 10000) / 100 
    : 0;

  const accuracy = attempted_questions > 0 
    ? Math.round((correct_answers / attempted_questions) * 10000) / 100 
    : 0;

  return {
    total_questions,
    attempted_questions,
    correct_answers,
    incorrect_answers,
    unanswered_questions,
    positive_marks: positive_marks_rounded,
    negative_marks: negative_marks_rounded,
    final_score,
    maximum_marks: maximum_marks_rounded,
    percentage,
    accuracy,
    detailed_answers,
  };
}
