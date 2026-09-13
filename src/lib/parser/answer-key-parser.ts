/**
 * Map of question number -> correct answer (e.g. 1 -> 'C', 2 -> 'A')
 */
export type AnswerKeyMap = Record<number, string>;

/**
 * Extracts answer key mappings from arbitrary answer sheet text.
 */
export function parseAnswerKeyText(text: string): AnswerKeyMap {
  const map: AnswerKeyMap = {};
  if (!text || !text.trim()) return map;

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // Pattern 1: Explicit question + answer per line or comma/space separated
  // e.g.: "1. C", "1: A", "1 - D", "Q1: C", "(1) B", "1 = A", "1. (C)", "1 -> D", "1. A, B", "1. A/B"
  const itemPattern = /(?:(?:Q|Question|Ques)\s*[\.:#\-]?\s*(\d+)|(?:\(?(\d+)\)[\.\:\-]?)|(\d+)[\.\:\-\=]\s*)\s*[\(\[]?([A-Ha-h](?:\s*[\/,\,]\s*[A-Ha-h])*)[\)\]]?/gi;

  let match;
  while ((match = itemPattern.exec(normalized)) !== null) {
    const qNumStr = match[1] || match[2] || match[3];
    const ans = match[4];
    if (qNumStr && ans) {
      const qNum = parseInt(qNumStr, 10);
      if (!isNaN(qNum) && qNum > 0 && qNum < 10000) {
        map[qNum] = ans.toUpperCase().replace(/\s+/g, '');
      }
    }
  }

  // If pattern 1 found matches, return them
  if (Object.keys(map).length > 0) {
    return map;
  }

  // Pattern 2: Tabular whitespace-separated items: e.g. "1 A   2 B   3 C   4 D" or "1	A	2	B"
  const tablePattern = /\b(\d+)\s+([A-Ha-h])\b/g;
  while ((match = tablePattern.exec(normalized)) !== null) {
    const qNum = parseInt(match[1], 10);
    const ans = match[2].toUpperCase();
    if (!isNaN(qNum) && qNum > 0 && qNum < 10000) {
      map[qNum] = ans;
    }
  }

  if (Object.keys(map).length > 0) {
    return map;
  }

  // Pattern 3: Line by line simple format:
  // line has just number and letter, e.g.:
  // "1 C"
  // "2 A"
  for (const line of lines) {
    const trimmed = line.trim();
    const simpleMatch = trimmed.match(/^(\d+)\s*[\.\:\-\s]+\s*([A-Ha-h](?:\s*[\/,\,]\s*[A-Ha-h])*)$/i);
    if (simpleMatch) {
      const qNum = parseInt(simpleMatch[1], 10);
      map[qNum] = simpleMatch[2].toUpperCase().replace(/\s+/g, '');
    }
  }

  return map;
}

/**
 * Merges parsed questions with parsed answer keys.
 */
export function mergeQuestionsWithAnswerKey(
  questions: Array<{ question_number: number; correct_answer?: string; warnings?: string[] }>,
  answerKeyMap: AnswerKeyMap
): void {
  for (const q of questions) {
    if (answerKeyMap[q.question_number]) {
      q.correct_answer = answerKeyMap[q.question_number];
    }
  }
}
