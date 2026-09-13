import assert from 'node:assert';
import { parseQuestionPaperText } from '../src/lib/parser/mcq-parser.ts';
import { parseAnswerKeyText, mergeQuestionsWithAnswerKey } from '../src/lib/parser/answer-key-parser.ts';
import { lintParsedExam } from '../src/lib/parser/linter.ts';
import { evaluateExam, checkAnswerCorrectness } from '../src/lib/scoring.ts';

console.log('🧪 RUNNING COMPREHENSIVE MCQ PLATFORM UNIT TESTS\n');

// TEST 1: Question Parser with Standard Multi-line Options
console.log('Test 1: Standard multi-line question parsing...');
const sample1 = `
Question 1. What is the capital of France?
A. Berlin
B. Madrid
C. Paris
D. Rome
Explanation: Paris is the capital and largest city of France.

Question 2: Which gas do plants primarily absorb during photosynthesis?
(A) Oxygen
(B) Carbon Dioxide
(C) Nitrogen
(D) Hydrogen
Solution: Plants absorb CO2 from the atmosphere.
`;

const q1 = parseQuestionPaperText(sample1);
assert.strictEqual(q1.length, 2, 'Should extract 2 questions');
assert.strictEqual(q1[0].question_number, 1);
assert.strictEqual(q1[0].options.length, 4);
assert.strictEqual(q1[0].options[2].label, 'C');
assert.strictEqual(q1[0].options[2].text, 'Paris');
assert.ok(q1[0].explanation?.includes('Paris is the capital'));
assert.strictEqual(q1[1].options[1].label, 'B');
assert.strictEqual(q1[1].options[1].text, 'Carbon Dioxide');
console.log('✅ Test 1 Passed: Standard multi-line question parsing works.');

// TEST 2: Single-Line / Inline Options Parsing
console.log('\nTest 2: Single-line/inline options parsing...');
const sample2 = `
1. What is the value of 2 + 2? (A) 3  (B) 4  (C) 5  (D) 6
2. Choose the correct chemical formula of water: A. CO2  B. H2O  C. NaCl  D. CH4
`;
const q2 = parseQuestionPaperText(sample2);
assert.strictEqual(q2.length, 2, 'Should extract 2 inline questions');
assert.strictEqual(q2[0].options.length, 4, 'Should extract 4 options for Q1');
assert.strictEqual(q2[0].options[1].label, 'B');
assert.strictEqual(q2[0].options[1].text, '4');
assert.strictEqual(q2[1].options.length, 4, 'Should extract 4 options for Q2');
assert.strictEqual(q2[1].options[1].text, 'H2O');
console.log('✅ Test 2 Passed: Inline options parsing works.');

// TEST 3: Diverse Answer Key Formats
console.log('\nTest 3: Answer key parsing across varied formats...');
// Format A: Standard lines
const key1 = `
1. C
2. A
3. D
`;
const map1 = parseAnswerKeyText(key1);
assert.strictEqual(map1[1], 'C');
assert.strictEqual(map1[2], 'A');
assert.strictEqual(map1[3], 'D');

// Format B: Dense table / inline string
const key2 = `1:C, 2:A, 3:D, 4:B`;
const map2 = parseAnswerKeyText(key2);
assert.strictEqual(map2[1], 'C');
assert.strictEqual(map2[4], 'B');

// Format C: Tabular space separated
const key3 = `1 A   2 B   3 C`;
const map3 = parseAnswerKeyText(key3);
assert.strictEqual(map3[1], 'A');
assert.strictEqual(map3[2], 'B');
assert.strictEqual(map3[3], 'C');
console.log('✅ Test 3 Passed: Varied answer key parsing works.');

// TEST 4: Merge & Linter Engine
console.log('\nTest 4: Merging questions with answer key and linting...');
const questionsToLint = [
  { question_number: 1, question_text: 'Q1', options: [{ label: 'A', text: '1' }, { label: 'B', text: '2' }], confidence: 1 },
  { question_number: 3, question_text: 'Q3', options: [{ label: 'A', text: '1' }], confidence: 0.5 }, // missing option & sequence gap (2 missing)
];
const keyMap = { 1: 'A' };
mergeQuestionsWithAnswerKey(questionsToLint, keyMap);
assert.strictEqual(questionsToLint[0].correct_answer, 'A');

const lintResult = lintParsedExam(questionsToLint, keyMap);
assert.ok(lintResult.hasIssues, 'Should detect issues');
assert.ok(lintResult.missingOptionQuestions.includes(3), 'Should detect Q3 has fewer than 2 options');
assert.ok(lintResult.missingSequenceQuestions.includes(2), 'Should detect question #2 missing in sequence');
assert.ok(lintResult.missingAnswerQuestions.includes(3), 'Should detect Q3 missing correct answer');
console.log('✅ Test 4 Passed: Linter successfully identified sequence gap, missing answer, and invalid options.');

// TEST 5: Scoring Engine with Decimals and Negatives
console.log('\nTest 5: Server-side scoring engine calculations...');
const examQuestions = [
  { id: 'q1', question_number: 1, correct_answer: 'A', correct_marks: 4, negative_marks: 1, unanswered_marks: 0 },
  { id: 'q2', question_number: 2, correct_answer: 'B', correct_marks: 4, negative_marks: 1, unanswered_marks: 0 },
  { id: 'q3', question_number: 3, correct_answer: 'C', correct_marks: 2.5, negative_marks: 0.66, unanswered_marks: 0 },
  { id: 'q4', question_number: 4, correct_answer: 'D', correct_marks: 4, negative_marks: 1, unanswered_marks: 0 },
];

const userResponses = [
  { question_id: 'q1', selected_answer: 'A' }, // Correct (+4)
  { question_id: 'q2', selected_answer: 'C' }, // Incorrect (-1)
  { question_id: 'q3', selected_answer: 'B' }, // Incorrect (-0.66)
  { question_id: 'q4', selected_answer: null }, // Unanswered (0)
];

const evalResult = evaluateExam({ questions: examQuestions, userResponses });
assert.strictEqual(evalResult.total_questions, 4);
assert.strictEqual(evalResult.attempted_questions, 3);
assert.strictEqual(evalResult.correct_answers, 1);
assert.strictEqual(evalResult.incorrect_answers, 2);
assert.strictEqual(evalResult.unanswered_questions, 1);
assert.strictEqual(evalResult.positive_marks, 4);
assert.strictEqual(evalResult.negative_marks, 1.66);
assert.strictEqual(evalResult.final_score, 2.34); // 4 - 1.66 = 2.34
assert.strictEqual(evalResult.maximum_marks, 14.5); // 4 + 4 + 2.5 + 4
console.log(`✅ Test 5 Passed: Scoring calculated exact score: ${evalResult.final_score} / ${evalResult.maximum_marks} (Accuracy: ${evalResult.accuracy}%).`);

console.log('\n🎉 ALL 5 UNIT TESTS PASSED SUCCESSFULLY!\n');
