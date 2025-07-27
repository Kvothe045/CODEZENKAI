import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    const users = await getAllUsers();
    
    // Mock ranking calculation - implement proper ranking logic
    const rankings = users.map((user, index) => ({
      rank: index + 1,
      user_id: user.id,
      name: user.name,
      codeforces_username: user.codeforces_username,
      total_contests: Math.floor(Math.random() * 20),
      total_problems_solved: Math.floor(Math.random() * 100),
      best_rank: Math.floor(Math.random() * 50) + 1,
      average_rank: Math.floor(Math.random() * 30) + 1,
      win_rate: Math.floor(Math.random() * 100),
      recent_contests: Math.floor(Math.random() * 5),
      rating_points: Math.floor(Math.random() * 2000) + 500
    }));

    return NextResponse.json({ rankings, userRanking: null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}
