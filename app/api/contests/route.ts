// app/api/contests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createContest, getActiveContests } from '@/lib/db';

export async function GET() {
  try {
    const contests = await getActiveContests();
    return NextResponse.json(contests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contestData = await request.json();
    const contest = await createContest(contestData);
    
    if (!contest) {
      return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
    }
    
    return NextResponse.json(contest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
