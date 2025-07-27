import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getActiveContests } from '@/lib/db';

export async function GET() {
  try {
    const [users, contests] = await Promise.all([
      getAllUsers(),
      getActiveContests()
    ]);
    
    const now = new Date();
    const activeContests = contests.filter(c => 
      new Date(c.start_time) <= now && new Date(c.end_time) >= now
    ).length;

    const stats = {
      totalUsers: users.length,
      totalContests: contests.length,
      activeContests,
      totalSubmissions: 0 // You can implement this later
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
