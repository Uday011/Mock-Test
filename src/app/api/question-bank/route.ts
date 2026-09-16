import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const subjectId = searchParams.get('subject_id') || searchParams.get('subject');
    const topicId = searchParams.get('topic_id') || searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const correctness = searchParams.get('correctness_status') || searchParams.get('correctness');

    let query = `
      SELECT qb.*, s.name as subject_name, s.code as subject_code, sn.title as topic_title
      FROM question_bank qb
      LEFT JOIN subjects s ON s.id = qb.subject_id
      LEFT JOIN syllabus_nodes sn ON sn.id = qb.topic_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND qb.status = ?';
      params.push(status);
    }

    if (subjectId && subjectId !== 'all') {
      query += ' AND (qb.subject_id = ? OR s.name = ?)';
      params.push(subjectId, subjectId);
    }

    if (topicId && topicId !== 'all') {
      query += ' AND (qb.topic_id = ? OR sn.title = ?)';
      params.push(topicId, topicId);
    }

    if (difficulty && difficulty !== 'all') {
      query += ' AND qb.difficulty = ?';
      params.push(difficulty.toLowerCase());
    }

    if (correctness && correctness !== 'all') {
      query += ' AND qb.correctness_status = ?';
      params.push(correctness);
    }

    if (search && search.trim()) {
      query += ' AND (qb.question_text LIKE ? OR qb.explanation LIKE ? OR qb.tags_json LIKE ? OR qb.source_reference LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY qb.created_at DESC';

    const questionsStmt = db.prepare(query);
    const questions = questionsStmt.all(...params) as any[];

    // Parse JSON fields
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options_json === 'string' ? JSON.parse(q.options_json || '[]') : q.options_json,
      tags: typeof q.tags_json === 'string' ? JSON.parse(q.tags_json || '[]') : q.tags_json,
      used_in_tests: typeof q.used_in_tests_json === 'string' ? JSON.parse(q.used_in_tests_json || '[]') : q.used_in_tests_json,
    }));

    // Aggregate summary counts
    const summaryStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count,
        SUM(CASE WHEN correctness_status = 'verified' THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN usage_count > 0 THEN 1 ELSE 0 END) as used_in_tests_count,
        AVG(usage_count) as avg_usage
      FROM question_bank
    `);
    const counts = summaryStmt.get() as any;

    return NextResponse.json({
      success: true,
      questions: parsedQuestions,
      counts: counts || { total: 0, active_count: 0, archived_count: 0, verified_count: 0, used_in_tests_count: 0 },
      summary: {
        total: counts?.total || 0,
        active: counts?.active_count || 0,
        verified: counts?.verified_count || 0,
        avgUsage: Math.round((counts?.avg_usage || 0) * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Error fetching question bank:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve question bank items', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoAdmin = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1").get() as any;
      if (demoAdmin) userId = demoAdmin.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      question_text,
      options = [],
      correct_answer,
      explanation = '',
      difficulty = 'medium',
      subject_id,
      topic_id,
      subtopic_id = null,
      exam_id = 'exam-ssc-cgl-2026',
      tags = [],
      source_reference = 'Test Studio Manual Authoring',
      marks = 2.0,
      negative_marks = 0.5,
      estimated_seconds = 60,
    } = body;

    if (!question_text || !question_text.trim()) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    if (!correct_answer) {
      return NextResponse.json({ error: 'Correct answer key is required' }, { status: 400 });
    }

    const newId = `qb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO question_bank (
        id, creator_id, topic_id, subject_id, exam_id, question_text, question_type,
        options_json, correct_answer, explanation, difficulty, source_reference, tags_json,
        usage_count, status, marks, negative_marks, estimated_seconds, subtopic_id,
        used_in_tests_json, correctness_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'single', ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, ?, ?, '[]', 'verified', ?)
    `).run(
      newId,
      userId,
      topic_id || null,
      subject_id || null,
      exam_id,
      question_text.trim(),
      JSON.stringify(options),
      correct_answer.trim().toUpperCase(),
      explanation.trim(),
      difficulty.toLowerCase(),
      source_reference,
      JSON.stringify(tags),
      Number(marks),
      Number(negative_marks),
      Number(estimated_seconds),
      subtopic_id,
      now
    );

    const created = db.prepare('SELECT * FROM question_bank WHERE id = ?').get(newId);

    return NextResponse.json({
      success: true,
      id: newId,
      question: created,
    });
  } catch (error: any) {
    console.error('Error inserting question into bank:', error);
    return NextResponse.json(
      { error: 'Failed to create question bank entry', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.question_text !== undefined) {
      fields.push('question_text = ?');
      values.push(updates.question_text.trim());
    }
    if (updates.options !== undefined) {
      fields.push('options_json = ?');
      values.push(JSON.stringify(updates.options));
    }
    if (updates.correct_answer !== undefined) {
      fields.push('correct_answer = ?');
      values.push(updates.correct_answer.trim().toUpperCase());
    }
    if (updates.explanation !== undefined) {
      fields.push('explanation = ?');
      values.push(updates.explanation.trim());
    }
    if (updates.difficulty !== undefined) {
      fields.push('difficulty = ?');
      values.push(updates.difficulty.toLowerCase());
    }
    if (updates.subject_id !== undefined) {
      fields.push('subject_id = ?');
      values.push(updates.subject_id);
    }
    if (updates.topic_id !== undefined) {
      fields.push('topic_id = ?');
      values.push(updates.topic_id);
    }
    if (updates.tags !== undefined) {
      fields.push('tags_json = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.marks !== undefined) {
      fields.push('marks = ?');
      values.push(Number(updates.marks));
    }
    if (updates.negative_marks !== undefined) {
      fields.push('negative_marks = ?');
      values.push(Number(updates.negative_marks));
    }
    if (updates.estimated_seconds !== undefined) {
      fields.push('estimated_seconds = ?');
      values.push(Number(updates.estimated_seconds));
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE question_bank SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating question bank item:', error);
    return NextResponse.json(
      { error: 'Failed to update question bank item', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Soft archive
    db.prepare("UPDATE question_bank SET status = 'archived' WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: 'Question archived' });
  } catch (error: any) {
    console.error('Error archiving question bank item:', error);
    return NextResponse.json(
      { error: 'Failed to archive item', details: error.message },
      { status: 500 }
    );
  }
}
