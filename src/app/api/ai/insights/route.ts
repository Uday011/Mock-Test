import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { AIInsights } from '@/lib/types';

export async function POST(req: NextRequest) {
  const db = getDb();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const attemptStmt = db.prepare(`
      SELECT a.*, t.title as test_title, t.subject
      FROM test_attempts a
      JOIN tests t ON t.id = a.test_id
      WHERE a.id = ?
    `);
    const attempt = attemptStmt.get(attemptId) as any;

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // If insights already cached, return immediately
    if (attempt.ai_insights_json) {
      try {
        const cached = JSON.parse(attempt.ai_insights_json);
        return NextResponse.json({ success: true, insights: cached, cached: true });
      } catch (e) {}
    }

    // Retrieve user answers
    const answersStmt = db.prepare(`
      SELECT q.question_number, q.question_text, q.correct_answer, q.explanation,
             a.selected_answer, a.is_correct, a.marks_awarded, a.negative_marks_deducted
      FROM questions q
      LEFT JOIN user_answers a ON a.question_id = q.id AND a.attempt_id = ?
      WHERE q.test_id = ?
      ORDER BY q.question_number ASC
    `);
    const breakdown = answersStmt.all(attemptId, attempt.test_id) as any[];

    const questionAnalysisSummary = breakdown.map(b => ({
      q: `Q${b.question_number}: ${b.question_text.slice(0, 120)}`,
      userChoice: b.selected_answer || 'Unanswered',
      correctChoice: b.correct_answer,
      result: b.is_correct ? 'CORRECT' : b.selected_answer ? 'INCORRECT' : 'UNANSWERED',
      explanationSnippet: b.explanation?.slice(0, 100) || '',
    }));

    const prompt = `You are an expert competitive exam mentor and performance analyst.
Analyze the following student's mock exam performance and output an insightful, actionable assessment.

EXAM DETAILS:
- Title: "${attempt.test_title}" (${attempt.subject})
- Final Score: ${attempt.final_score} / ${attempt.maximum_marks} (${attempt.percentage}%)
- Total Questions: ${attempt.total_questions}
- Correct Answers: ${attempt.correct_answers} (+${attempt.positive_marks} marks)
- Incorrect Answers: ${attempt.incorrect_answers} (-${attempt.negative_marks} negative marks)
- Unanswered: ${attempt.unanswered_questions}
- Accuracy Rate: ${attempt.accuracy}%
- Time Taken: ${Math.round(attempt.time_taken_seconds / 60)} minutes

QUESTION BY QUESTION BREAKDOWN:
${JSON.stringify(questionAnalysisSummary.slice(0, 25), null, 2)}

Respond with a STRICT JSON OBJECT containing:
{
  "overall_feedback": "A 2-3 sentence encouraging, constructive overview of the candidate's performance.",
  "strengths": ["3 to 4 specific conceptual areas, question types, or skills where the candidate showed strong grasp"],
  "weak_areas": ["3 to 4 specific concepts or topics where mistakes occurred or negative marks were taken"],
  "time_management": "A constructive analysis of their pacing (average time per question) and recommendation for exam speed.",
  "recommended_topics": ["3 to 5 prioritized topic names to study or revise next"],
  "accuracy_assessment": "Advice on balancing question attempts versus guessing to minimize negative marking penalties."
}

Do NOT output markdown backticks or any conversational text outside the JSON object.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 500 });
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: 'No output received from Gemini AI' }, { status: 500 });
    }

    const insights: AIInsights = JSON.parse(rawText);

    // Cache insights in SQLite
    const updateStmt = db.prepare('UPDATE test_attempts SET ai_insights_json = ? WHERE id = ?');
    updateStmt.run(JSON.stringify(insights), attemptId);

    return NextResponse.json({ success: true, insights, cached: false });
  } catch (err: any) {
    console.error('AI insights generation failed:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate AI insights' }, { status: 500 });
  }
}
