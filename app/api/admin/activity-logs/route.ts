import { NextRequest, NextResponse } from 'next/server';

interface ActivityLog {
  id: string;
  user_id: string;
  name: string;
  codeforces_username: string;
  contest_id: string;
  event_type: string;
  timestamp: string;
  details: any;
}

export async function GET() {
  try {
    // Explicitly type the array as ActivityLog[]
    const activityLogs: ActivityLog[] = [];
    
    return NextResponse.json(activityLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
