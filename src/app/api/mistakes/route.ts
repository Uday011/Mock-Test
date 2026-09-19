import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    const safeUserId = userId || '';

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'all' | 'unresolved' | 'repeated' | 'bookmarked' | 'resolved'
    const subjectId = searchParams.get('subject_id');
    const search = searchParams.get('q');

    let query = `
      SELECT mr.*, sn.title as topic_title, s.name as subject_name, s.code as subject_code
      FROM mistake_records mr
      LEFT JOIN syllabus_nodes sn ON sn.id = mr.topic_id
      LEFT JOIN subjects s ON s.id = mr.subject_id
      WHERE mr.user_id = ?
    `;
    const params: any[] = [safeUserId];

    if (category && category !== 'all') {
      query += ' AND mr.error_category = ?';
      params.push(category);
    }

    if (status) {
      if (status === 'unresolved') {
        query += ' AND mr.is_resolved = 0';
      } else if (status === 'resolved') {
        query += ' AND mr.is_resolved = 1';
      } else if (status === 'repeated') {
        query += ' AND mr.attempt_count > 1';
      } else if (status === 'bookmarked') {
        query += ' AND mr.is_bookmarked = 1';
      }
    }

    if (subjectId && subjectId !== 'all') {
      query += ' AND mr.subject_id = ?';
      params.push(subjectId);
    }

    if (search && search.trim()) {
      query += ' AND (mr.question_text LIKE ? OR mr.user_notes LIKE ? OR sn.title LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY mr.created_at DESC';

    const mistakesStmt = db.prepare(query);
    const mistakes = mistakesStmt.all(...params) as any[];

    // Summary counts for all 8 categories and statuses
    const countStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN error_category = 'conceptual_gap' THEN 1 ELSE 0 END) as concept_count,
        SUM(CASE WHEN error_category = 'calculation_error' THEN 1 ELSE 0 END) as calc_count,
        SUM(CASE WHEN error_category = 'misread_question' THEN 1 ELSE 0 END) as misread_count,
        SUM(CASE WHEN error_category = 'formula_recall' THEN 1 ELSE 0 END) as formula_count,
        SUM(CASE WHEN error_category = 'time_rush' THEN 1 ELSE 0 END) as rush_count,
        SUM(CASE WHEN error_category = 'guessing_error' THEN 1 ELSE 0 END) as guess_count,
        SUM(CASE WHEN error_category = 'carelessness' THEN 1 ELSE 0 END) as careless_count,
        SUM(CASE WHEN error_category = 'knowledge_gap' THEN 1 ELSE 0 END) as knowledge_count,
        SUM(CASE WHEN is_resolved = 1 THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN is_resolved = 0 THEN 1 ELSE 0 END) as unresolved_count,
        SUM(CASE WHEN attempt_count > 1 THEN 1 ELSE 0 END) as repeated_count,
        SUM(CASE WHEN is_bookmarked = 1 THEN 1 ELSE 0 END) as bookmarked_count
      FROM mistake_records
      WHERE user_id = ?
    `);
    const counts = countStmt.get(safeUserId) as any;

    return NextResponse.json({
      success: true,
      mistakes,
      counts: counts || {
        total: 0,
        concept_count: 0,
        calc_count: 0,
        misread_count: 0,
        formula_count: 0,
        rush_count: 0,
        guess_count: 0,
        careless_count: 0,
        knowledge_count: 0,
        resolved_count: 0,
        unresolved_count: 0,
        repeated_count: 0,
        bookmarked_count: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching mistakes:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve mistake records', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { id, is_resolved, is_bookmarked, user_notes, error_category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Mistake ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof is_resolved === 'number' || typeof is_resolved === 'boolean') {
      const resolvedVal = is_resolved ? 1 : 0;
      updates.push('is_resolved = ?');
      values.push(resolvedVal);
      if (resolvedVal === 1) {
        updates.push('resolved_at = ?');
        values.push(new Date().toISOString());
      } else {
        updates.push('resolved_at = NULL');
      }
    }

    if (typeof is_bookmarked === 'number' || typeof is_bookmarked === 'boolean') {
      updates.push('is_bookmarked = ?');
      values.push(is_bookmarked ? 1 : 0);
    }

    if (typeof user_notes === 'string') {
      updates.push('user_notes = ?');
      values.push(user_notes);
    }

    if (typeof error_category === 'string') {
      updates.push('error_category = ?');
      values.push(error_category);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates specified' }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE mistake_records SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating mistake record:', error);
    return NextResponse.json(
      { error: 'Failed to update mistake record', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }
    const safeUserId = userId || 'usr-student-demo';

    const body = await req.json();
    const {
      question_id,
      test_id = 'practice_session',
      exam_id = 'exam-cat-2026',
      subject_id = null,
      topic_id = null,
      question_text,
      options = [],
      selected_answer,
      correct_answer,
      explanation = '',
      error_category = 'conceptual_gap',
      user_notes = '',
    } = body;

    if (!question_id || !question_text || !selected_answer || !correct_answer) {
      return NextResponse.json(
        { error: 'Missing required mistake log parameters' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const existing = db
      .prepare('SELECT id, attempt_count FROM mistake_records WHERE user_id = ? AND question_id = ? LIMIT 1')
      .get(safeUserId, question_id) as any;

    if (existing) {
      db.prepare(`
        UPDATE mistake_records
        SET selected_answer = ?,
            attempt_count = attempt_count + 1,
            is_resolved = 0,
            last_attempted_at = ?,
            error_category = COALESCE(?, error_category)
        WHERE id = ?
      `).run(selected_answer, now, error_category, existing.id);

      return NextResponse.json({ success: true, id: existing.id, updated: true });
    } else {
      const newId = `mistake-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT INTO mistake_records (
          id, user_id, test_id, question_id, exam_id, subject_id, topic_id,
          question_text, options_json, selected_answer, correct_answer, explanation,
          error_category, user_notes, is_resolved, attempt_count, is_bookmarked,
          last_attempted_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, ?, ?)
      `).run(
        newId,
        safeUserId,
        test_id,
        question_id,
        exam_id,
        subject_id,
        topic_id,
        question_text,
        JSON.stringify(options),
        selected_answer,
        correct_answer,
        explanation,
        error_category,
        user_notes,
        now,
        now
      );

      return NextResponse.json({ success: true, id: newId, created: true });
    }
  } catch (error: any) {
    console.error('Error recording mistake:', error);
    return NextResponse.json(
      { error: 'Failed to record mistake', details: error.message },
      { status: 500 }
    );
  }
}

