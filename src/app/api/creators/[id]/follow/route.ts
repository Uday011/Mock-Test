import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;
  const db = getDb();

  let viewer = await getCurrentUser();
  if (!viewer) viewer = getOrCreateDemoUser();

  try {
    const followCheck = db.prepare(
      'SELECT id FROM creator_follows WHERE follower_id = ? AND creator_id = ?'
    ).get(viewer.id, creatorId);

    const profile = db.prepare('SELECT followers_count FROM educator_profiles WHERE user_id = ?').get(creatorId) as any;
    const followers_count = profile ? profile.followers_count : 0;

    return NextResponse.json({
      success: true,
      following: Boolean(followCheck),
      followers_count,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to check follow status' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;
  const db = getDb();

  let viewer = await getCurrentUser();
  if (!viewer) viewer = getOrCreateDemoUser();

  try {
    // Cannot follow yourself
    if (viewer.id === creatorId) {
      return NextResponse.json({ error: 'You cannot follow your own educator profile.' }, { status: 400 });
    }

    const creatorUser = db.prepare('SELECT id, name FROM users WHERE id = ?').get(creatorId) as any;
    if (!creatorUser) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Ensure educator profile exists
    db.prepare(`
      INSERT OR IGNORE INTO educator_profiles (
        user_id, headline, bio, institute_name, verification_status,
        specialization_subjects_json, total_students, average_rating, published_tests_count, followers_count, created_at
      ) VALUES (?, 'Academic Faculty & Educator', 'Creator on Nalanda platform.', 'Nalanda Academic Faculty', 'verified', '[]', 0, 4.9, 0, 0, ?)
    `).run(creatorId, new Date().toISOString());

    const existingFollow = db.prepare(
      'SELECT id FROM creator_follows WHERE follower_id = ? AND creator_id = ?'
    ).get(viewer.id, creatorId);

    let isFollowing = false;

    if (existingFollow) {
      db.prepare('DELETE FROM creator_follows WHERE follower_id = ? AND creator_id = ?').run(viewer.id, creatorId);
      db.prepare(`
        UPDATE educator_profiles 
        SET followers_count = MAX(0, followers_count - 1)
        WHERE user_id = ?
      `).run(creatorId);
      isFollowing = false;
    } else {
      const followId = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare('INSERT INTO creator_follows (id, follower_id, creator_id, created_at) VALUES (?, ?, ?, ?)').run(
        followId,
        viewer.id,
        creatorId,
        now
      );
      db.prepare(`
        UPDATE educator_profiles 
        SET followers_count = followers_count + 1
        WHERE user_id = ?
      `).run(creatorId);
      isFollowing = true;
    }

    const updatedProfile = db.prepare('SELECT followers_count FROM educator_profiles WHERE user_id = ?').get(creatorId) as any;
    const followers_count = updatedProfile?.followers_count ?? 0;

    return NextResponse.json({
      success: true,
      following: isFollowing,
      followers_count,
      message: isFollowing ? `You are now following ${creatorUser.name}` : `Unfollowed ${creatorUser.name}`,
    });
  } catch (err: any) {
    console.error('Error toggling creator follow:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update follow status' }, { status: 500 });
  }
}
