import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('🚀 STARTING FULL-STACK END-TO-END HTTP INTEGRATION TESTS\n');

  // STEP 1: Test Demo Authentication
  console.log('1. Testing Demo Authentication (/api/auth/demo)...');
  const authRes = await fetch(`${BASE_URL}/api/auth/demo`, { method: 'POST' });
  assert.strictEqual(authRes.status, 200, 'Auth endpoint should return 200');
  const authData = await authRes.json();
  assert.ok(authData.success, 'Auth should be successful');
  assert.ok(authData.user?.id, 'User object should contain ID');
  const authCookie = authRes.headers.get('set-cookie');
  console.log(`✅ Demo User Authenticated: ${authData.user.name} (${authData.user.email})`);

  const headers = {
    'Content-Type': 'application/json',
    ...(authCookie ? { Cookie: authCookie } : {}),
  };

  // STEP 2: Test Upload & Parser Endpoint
  console.log('\n2. Testing Upload & Parsing API (/api/upload)...');
  const formData = new FormData();
  const samplePaper = `Question 1. Which planet in our solar system is known as the Red Planet?
A. Venus
B. Mars
C. Jupiter
D. Saturn

Question 2. What is the powerhouse of the cell?
A. Nucleus
B. Ribosome
C. Mitochondria
D. Endoplasmic Reticulum`;

  const sampleKey = `1. B
2. C`;

  formData.append('paperText', samplePaper);
  formData.append('keyText', sampleKey);

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: authCookie ? { Cookie: authCookie } : {},
  });
  assert.strictEqual(uploadRes.status, 200);
  const uploadData = await uploadRes.json();
  assert.strictEqual(uploadData.detectedQuestionCount, 2, 'Should detect 2 questions');
  assert.strictEqual(uploadData.detectedKeyCount, 2, 'Should detect 2 keys');
  assert.strictEqual(uploadData.questions[0].correct_answer, 'B');
  assert.strictEqual(uploadData.questions[1].correct_answer, 'C');
  console.log(`✅ Document parsed into ${uploadData.detectedQuestionCount} questions with 100% key matching.`);

  // STEP 3: Test Create Test Definition
  console.log('\n3. Testing Test Creation (/api/tests)...');
  const createRes = await fetch(`${BASE_URL}/api/tests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'E2E Astronomy & Biology Mock Exam',
      description: 'End-to-end integration test paper',
      subject: 'Natural Sciences',
      duration_seconds: 1200, // 20 mins
      default_correct_marks: 4,
      default_negative_marks: 1,
      questions: uploadData.questions,
    }),
  });
  assert.strictEqual(createRes.status, 200);
  const createData = await createRes.json();
  assert.ok(createData.testId, 'Should return created testId');
  const testId = createData.testId;
  console.log(`✅ Test definition saved in SQLite with ID: ${testId}`);

  // STEP 4: Start Exam Attempt & Verify Answer Security
  console.log('\n4. Testing Exam Start Session (/api/exam/start)...');
  const startRes = await fetch(`${BASE_URL}/api/exam/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ testId }),
  });
  assert.strictEqual(startRes.status, 200);
  const startData = await startRes.json();
  assert.ok(startData.attemptId, 'Should return attemptId');
  const attemptId = startData.attemptId;
  assert.strictEqual(startData.questions.length, 2);
  // Verify that correct_answer is NOT exposed in start payload
  assert.strictEqual(startData.questions[0].correct_answer, undefined, 'Correct answers must NOT leak to client during exam');
  console.log(`✅ Exam Attempt Started: ${attemptId}. Verified questions sanitized against answer leakage.`);

  // STEP 5: Real-time Auto-Save Answer
  console.log('\n5. Testing Live Answer Auto-Saving (/api/exam/[attemptId]/save)...');
  const saveRes = await fetch(`${BASE_URL}/api/exam/${attemptId}/save`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      question_id: startData.questions[0].id,
      question_number: 1,
      selected_answer: 'B', // Correct choice for Q1
      is_marked_for_review: true,
    }),
  });
  assert.strictEqual(saveRes.status, 200);
  const saveData = await saveRes.json();
  assert.ok(saveData.success);
  console.log('✅ Real-time answer and review mark saved successfully.');

  // STEP 6: Submit Test & Evaluate Server-Side
  console.log('\n6. Testing Exam Submission & Scoring Engine (/api/exam/[attemptId]/submit)...');
  // Candidate answers Q1 correctly ('B') and Q2 incorrectly ('A')
  const submitRes = await fetch(`${BASE_URL}/api/exam/${attemptId}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      answers: [
        { question_id: startData.questions[0].id, selected_answer: 'B', is_marked_for_review: false }, // Correct (+4)
        { question_id: startData.questions[1].id, selected_answer: 'A', is_marked_for_review: false }, // Incorrect (-1)
      ],
    }),
  });
  assert.strictEqual(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.ok(submitData.success);
  assert.strictEqual(submitData.result.total_questions, 2);
  assert.strictEqual(submitData.result.correct_answers, 1);
  assert.strictEqual(submitData.result.incorrect_answers, 1);
  assert.strictEqual(submitData.result.positive_marks, 4);
  assert.strictEqual(submitData.result.negative_marks, 1);
  assert.strictEqual(submitData.result.final_score, 3); // 4 - 1 = 3
  assert.strictEqual(submitData.result.maximum_marks, 8); // 4 + 4 = 8
  assert.strictEqual(submitData.result.percentage, 37.5); // 3 / 8 = 37.5%
  assert.strictEqual(submitData.result.accuracy, 50); // 1 out of 2 = 50%
  console.log(`✅ Exam Evaluated: Score ${submitData.result.final_score}/${submitData.result.maximum_marks} (${submitData.result.percentage}%), Accuracy ${submitData.result.accuracy}%.`);

  // STEP 7: Fetch Result & Solution Review
  console.log('\n7. Testing Results & Detailed Review (/api/exam/[attemptId]/result)...');
  const resultRes = await fetch(`${BASE_URL}/api/exam/${attemptId}/result`, { headers });
  assert.strictEqual(resultRes.status, 200);
  const resultData = await resultRes.json();
  assert.strictEqual(resultData.attempt.status, 'completed');
  assert.strictEqual(resultData.questions.length, 2);
  assert.strictEqual(resultData.questions[0].is_correct, true);
  assert.strictEqual(resultData.questions[1].is_correct, false);
  console.log('✅ Detailed question-by-question solutions verified with official keys and awarded marks.');

  // STEP 8: Retake Test & Verify Grouped Attempts
  console.log('\n8. Testing Retake & Grouped Attempts...');
  const retakeRes = await fetch(`${BASE_URL}/api/exam/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ testId }),
  });
  const retakeData = await retakeRes.json();
  const attempt2Id = retakeData.attemptId;

  // Submit attempt 2 with 100% correct answers
  await fetch(`${BASE_URL}/api/exam/${attempt2Id}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      answers: [
        { question_id: startData.questions[0].id, selected_answer: 'B' }, // Correct (+4)
        { question_id: startData.questions[1].id, selected_answer: 'C' }, // Correct (+4)
      ],
    }),
  });

  // Verify that test definition now groups BOTH attempts
  const testDetailRes = await fetch(`${BASE_URL}/api/tests/${testId}`, { headers });
  const testDetailData = await testDetailRes.json();
  assert.strictEqual(testDetailData.test.attempts.length, 2, 'Should have 2 attempts grouped under this test');
  console.log(`✅ Grouped Attempts Verified: Found ${testDetailData.test.attempts.length} attempts under test "${testDetailData.test.title}".`);

  // STEP 9: Test Renaming
  console.log('\n9. Testing Test Renaming (/api/tests/[id])...');
  const renameRes = await fetch(`${BASE_URL}/api/tests/${testId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ title: 'Master Astronomy & Biology Exam (Renamed)' }),
  });
  assert.strictEqual(renameRes.status, 200);
  const checkRename = await (await fetch(`${BASE_URL}/api/tests/${testId}`, { headers })).json();
  assert.strictEqual(checkRename.test.title, 'Master Astronomy & Biology Exam (Renamed)');
  assert.strictEqual(checkRename.test.attempts.length, 2, 'Attempts must remain preserved after renaming');
  console.log(`✅ Test Renaming Verified: Title updated to "${checkRename.test.title}" while preserving historical attempts.`);

  console.log('\n🎉 ALL 9 END-TO-END WORKFLOW INTEGRATION TESTS PASSED WITHOUT ISSUES!\n');
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err);
  process.exit(1);
});
