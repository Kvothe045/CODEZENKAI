// app/api/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, contestId, eventType, details } = await request.json();
    
    await logActivity(userId, contestId, eventType, details);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}
