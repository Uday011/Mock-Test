import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateRoleDemoUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateRoleDemoUser('educator');
    }

    const educatorId = user.id;
    let profile = db.prepare('SELECT * FROM educator_profiles WHERE user_id = ?').get(educatorId) as any;

    if (!profile) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO educator_profiles (
          user_id, headline, bio, institute_name, verification_status,
          specialization_subjects_json, total_students, average_rating,
          published_tests_count, followers_count, publication_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        educatorId,
        'Faculty & Academic Assessment Chair',
        'Academic educator committed to rigorous, standard-aligned test crafting and cognitive diagnostic analytics.',
        user.institute_name || 'Nalanda Academic Faculty',
        'verified',
        JSON.stringify(['Quantitative Aptitude', 'General Studies', 'Reasoning']),
        1250,
        4.9,
        0,
        42,
        'active',
        now
      );
      profile = db.prepare('SELECT * FROM educator_profiles WHERE user_id = ?').get(educatorId);
    }

    let specializations = [];
    try {
      specializations = JSON.parse(profile.specialization_subjects_json || '[]');
    } catch {
      specializations = ['Quantitative Aptitude', 'General Studies'];
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.user_id,
        user_id: profile.user_id,
        name: user.name,
        email: user.email,
        headline: profile.headline,
        bio: profile.bio,
        institute_name: profile.institute_name,
        verification_status: profile.verification_status,
        publication_status: profile.publication_status || 'active',
        profile_image_url: profile.profile_image_url,
        specializations,
        total_students: profile.total_students,
        average_rating: profile.average_rating,
        followers_count: profile.followers_count,
        created_at: profile.created_at,
      },
    });
  } catch (err: any) {
    console.error('Error fetching educator profile:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateRoleDemoUser('educator');
    }

    const educatorId = user.id;
    const body = await req.json();

    const {
      headline,
      bio,
      institute_name,
      specializations,
      publication_status,
      profile_image_url,
    } = body;

    const specializationsJson = Array.isArray(specializations)
      ? JSON.stringify(specializations)
      : undefined;

    // Check if profile exists
    const existing = db.prepare('SELECT user_id FROM educator_profiles WHERE user_id = ?').get(educatorId);

    if (existing) {
      db.prepare(`
        UPDATE educator_profiles
        SET 
          headline = COALESCE(?, headline),
          bio = COALESCE(?, bio),
          institute_name = COALESCE(?, institute_name),
          specialization_subjects_json = COALESCE(?, specialization_subjects_json),
          publication_status = COALESCE(?, publication_status),
          profile_image_url = COALESCE(?, profile_image_url)
        WHERE user_id = ?
      `).run(
        headline ?? null,
        bio ?? null,
        institute_name ?? null,
        specializationsJson ?? null,
        publication_status ?? null,
        profile_image_url ?? null,
        educatorId
      );
    } else {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO educator_profiles (
          user_id, headline, bio, institute_name, verification_status,
          specialization_subjects_json, publication_status, profile_image_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        educatorId,
        headline || 'Faculty & Academic Assessment Chair',
        bio || 'Academic educator committed to standard-aligned test crafting.',
        institute_name || 'Nalanda Academic Faculty',
        'verified',
        specializationsJson || JSON.stringify(['General Studies']),
        publication_status || 'active',
        profile_image_url || null,
        now
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Educator profile updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating educator profile:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update profile' }, { status: 500 });
  }
}
