import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createContest, getActiveContests } from '@/lib/db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const contests = await getActiveContests();
    return NextResponse.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, start_time, end_time, duration, problems, created_by } = body;

    if (!title || !start_time || !end_time || !duration || !problems) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only use created_by if it's a valid UUID, otherwise pass null
    let createdBy = null;
    if (created_by && created_by !== 'system') {
      // Validate UUID format (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(created_by)) {
        createdBy = created_by;
      }
    }

    const contest = await createContest({
      title,
      start_time,
      end_time,
      duration,
      problems: Array.isArray(problems) ? problems : [],
      created_by: createdBy, // This will be null if no valid UUID
      is_active: true
    });

    if (!contest) {
      return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
    }

    return NextResponse.json(contest, { status: 201 });

  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
