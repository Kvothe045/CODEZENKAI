import { NextRequest, NextResponse } from 'next/server';
import { getContestById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contest = await getContestById(params.id);
    
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json(contest);
  } catch (error) {
    console.error('Error fetching contest:', error);
    return NextResponse.json({ error: 'Failed to fetch contest' }, { status: 500 });
  }
}
