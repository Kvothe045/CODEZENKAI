'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { User, Trophy, Clock, Target, TrendingUp, Calendar, Award, ExternalLink } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  uid?: string;
  codeforces_username: string;
  email: string;
  highest_ranking?: number;
  current_ranking?: number;
  created_at: string;
}

interface ContestHistory {
  contest_id: string;
  contest_title: string;
  rank: number;
  problems_solved: number;
  total_penalty: number;
  total_time: number;
  contest_date: string;
  participants_count: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contestHistory, setContestHistory] = useState<ContestHistory[]>([]);
  const [stats, setStats] = useState({
    totalContests: 0,
    averageRank: 0,
    totalProblemsSolved: 0,
    bestRank: null as number | null,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Load user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const userInfo = JSON.parse(userData);
        setUser(userInfo);

        // Fetch contest history
        const historyResponse = await fetch(`/api/users/${userInfo.id}/contest-history`);
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setContestHistory(history);
          calculateStats(history);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (history: ContestHistory[]) => {
    if (history.length === 0) {
      setStats({
        totalContests: 0,
        averageRank: 0,
        totalProblemsSolved: 0,
        bestRank: null,
        winRate: 0
      });
      return;
    }

    const totalContests = history.length;
    const totalProblemsSolved = history.reduce((sum, contest) => sum + contest.problems_solved, 0);
    const averageRank = Math.round(history.reduce((sum, contest) => sum + contest.rank, 0) / totalContests);
    const bestRank = Math.min(...history.map(contest => contest.rank));
    const topThreeFinishes = history.filter(contest => contest.rank <= 3).length;
    const winRate = Math.round((topThreeFinishes / totalContests) * 100);

    setStats({
      totalContests,
      averageRank,
      totalProblemsSolved,
      bestRank,
      winRate
    });
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-orange-600 text-white';
    if (rank <= 10) return 'bg-vscode-blue text-white';
    return 'bg-vscode-line text-vscode-text';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-vscode-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <User className="h-16 w-16 text-vscode-comment mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-vscode-text mb-4">Please log in to view your profile</h2>
            <Link href="/login" className="bg-vscode-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar user={user} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="bg-vscode-blue text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-vscode-text mb-2">{user.name}</h1>
              <div className="space-y-1 text-vscode-comment">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={`https://codeforces.com/profile/${user.codeforces_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-vscode-blue transition-colors"
                  >
                    @{user.codeforces_username}
                  </a>
                </div>
                {user.uid && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Student ID: {user.uid}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {user.current_ranking && (
              <div className="text-center">
                <div className="text-3xl font-bold text-vscode-yellow">#{user.current_ranking}</div>
                <div className="text-vscode-comment">Current Rank</div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
            <Trophy className="h-8 w-8 text-vscode-blue mx-auto mb-3" />
            <div className="text-2xl font-bold text-vscode-text">{stats.totalContests}</div>
            <div className="text-vscode-comment">Contests</div>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
            <Target className="h-8 w-8 text-vscode-green mx-auto mb-3" />
            <div className="text-2xl font-bold text-vscode-text">{stats.totalProblemsSolved}</div>
            <div className="text-vscode-comment">Problems Solved</div>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
            <Award className="h-8 w-8 text-vscode-yellow mx-auto mb-3" />
            <div className="text-2xl font-bold text-vscode-text">
              {stats.bestRank ? `#${stats.bestRank}` : 'N/A'}
            </div>
            <div className="text-vscode-comment">Best Rank</div>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-vscode-blue mx-auto mb-3" />
            <div className="text-2xl font-bold text-vscode-text">
              {stats.averageRank ? `#${stats.averageRank}` : 'N/A'}
            </div>
            <div className="text-vscode-comment">Avg Rank</div>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
            <Trophy className="h-8 w-8 text-vscode-green mx-auto mb-3" />
            <div className="text-2xl font-bold text-vscode-text">{stats.winRate}%</div>
            <div className="text-vscode-comment">Top 3 Rate</div>
          </div>
        </div>

        {/* Contest History */}
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
          <h2 className="text-2xl font-bold text-vscode-text mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-vscode-blue" />
            Contest History
          </h2>

          {contestHistory.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-vscode-comment mx-auto mb-4" />
              <h3 className="text-xl text-vscode-text mb-2">No contests participated yet</h3>
              <p className="text-vscode-comment mb-6">
                Start participating in contests to see your history here
              </p>
              <Link href="/contests" className="bg-vscode-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                Browse Contests
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vscode-line">
                    <th className="text-left py-3 px-4 text-vscode-text">Contest</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Rank</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Solved</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Penalty</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Time</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Participants</th>
                    <th className="text-center py-3 px-4 text-vscode-text">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contestHistory.map((contest) => (
                    <tr key={contest.contest_id} className="border-b border-vscode-line hover:bg-vscode-editor">
                      <td className="py-4 px-4">
                        <Link 
                          href={`/contest/${contest.contest_id}`}
                          className="text-vscode-blue hover:text-blue-400 transition-colors font-medium"
                        >
                          {contest.contest_title}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${getRankBadgeColor(contest.rank)}`}>
                          #{contest.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-green font-semibold">
                        {contest.problems_solved}
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-text">
                        {contest.total_penalty}
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-text">
                        {Math.floor(contest.total_time / 60)}m {contest.total_time % 60}s
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-comment">
                        {contest.participants_count}
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-comment">
                        {new Date(contest.contest_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
          <h2 className="text-xl font-bold text-vscode-text mb-4">Performance Trend</h2>
          {contestHistory.length >= 2 ? (
            <div className="text-vscode-comment">
              <p>
                Your ranking has{' '}
                {contestHistory[0].rank < contestHistory[1].rank ? (
                  <span className="text-vscode-green">improved</span>
                ) : contestHistory[0].rank > contestHistory[1].rank ? (
                  <span className="text-vscode-red">decreased</span>
                ) : (
                  <span className="text-vscode-yellow">remained stable</span>
                )}{' '}
                from your last contest.
              </p>
            </div>
          ) : (
            <div className="text-vscode-comment">
              Participate in more contests to see your performance trend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
