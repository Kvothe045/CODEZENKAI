'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Trophy, Medal, TrendingUp, Users, Crown, Award, ExternalLink } from 'lucide-react';

interface GlobalRanking {
  rank: number;
  user_id: string;
  name: string;
  codeforces_username: string;
  total_contests: number;
  total_problems_solved: number;
  best_rank: number;
  average_rank: number;
  win_rate: number;
  recent_contests: number;
  rating_points: number;
}

export default function RankingsPage() {
  const [user, setUser] = useState<any>(null);
  const [rankings, setRankings] = useState<GlobalRanking[]>([]);
  const [userRanking, setUserRanking] = useState<GlobalRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'active'>('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchRankings();
  }, [timeFilter]);

  async function fetchRankings() {
    try {
      const response = await fetch(`/api/rankings?filter=${timeFilter}`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data.rankings || []);
        setUserRanking(data.userRanking || null);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <Trophy className="h-6 w-6 text-vscode-comment" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    if (rank <= 10) return 'bg-vscode-blue text-white';
    if (rank <= 50) return 'bg-vscode-green text-white';
    return 'bg-vscode-line text-vscode-text';
  };

  const getRatingColor = (points: number) => {
    if (points >= 2000) return 'text-red-500';
    if (points >= 1600) return 'text-orange-500';
    if (points >= 1200) return 'text-purple-500';
    if (points >= 800) return 'text-blue-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-vscode-text">Loading rankings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vscode-text mb-4 flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-vscode-blue" />
            Global Rankings
          </h1>
          <p className="text-vscode-comment">
            Compete and climb the leaderboard across all CodeZenKai contests
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-vscode-sidebar rounded-lg p-1">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'recent', label: 'Recent (30 days)' },
              { key: 'active', label: 'Active Users' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeFilter === key
                    ? 'bg-vscode-blue text-white'
                    : 'text-vscode-comment hover:text-vscode-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User's Ranking Card (if logged in) */}
        {user && userRanking && (
          <div className="mb-8 bg-gradient-to-r from-vscode-blue/10 to-vscode-green/10 border border-vscode-blue rounded-lg p-6">
            <h2 className="text-xl font-semibold text-vscode-blue mb-4">Your Global Ranking</h2>
            <div className="grid md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-vscode-text">#{userRanking.rank}</div>
                <div className="text-vscode-comment">Global Rank</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRatingColor(userRanking.rating_points)}`}>
                  {userRanking.rating_points}
                </div>
                <div className="text-vscode-comment">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vscode-text">{userRanking.total_contests}</div>
                <div className="text-vscode-comment">Contests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vscode-text">{userRanking.total_problems_solved}</div>
                <div className="text-vscode-comment">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vscode-yellow">
                  #{userRanking.best_rank}
                </div>
                <div className="text-vscode-comment">Best Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vscode-text">{userRanking.win_rate}%</div>
                <div className="text-vscode-comment">Win Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="mb-8 bg-vscode-sidebar border border-vscode-line rounded-lg p-8">
            <h2 className="text-2xl font-bold text-vscode-text mb-6 text-center">🏆 Hall of Fame 🏆</h2>
            <div className="flex justify-center items-end space-x-8">
              {/* Second Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-black w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
                  2
                </div>
                <div className="text-lg font-semibold text-vscode-text">{rankings[1]?.name}</div>
                <div className="text-vscode-comment">@{rankings[1]?.codeforces_username}</div>
                <div className={`text-xl font-bold mt-2 ${getRatingColor(rankings[1]?.rating_points)}`}>
                  {rankings[1]?.rating_points} pts
                </div>
              </div>

              {/* First Place */}
              <div className="text-center transform scale-110">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold mb-4 mx-auto shadow-lg">
                  1
                </div>
                <div className="text-xl font-bold text-vscode-text">{rankings[0]?.name}</div>
                <div className="text-vscode-comment">@{rankings[0]?.codeforces_username}</div>
                <div className={`text-2xl font-bold mt-2 ${getRatingColor(rankings[0]?.rating_points)}`}>
                  {rankings[0]?.rating_points} pts
                </div>
                <div className="mt-2">
                  <Crown className="h-6 w-6 text-yellow-500 mx-auto" />
                </div>
              </div>

              {/* Third Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
                  3
                </div>
                <div className="text-lg font-semibold text-vscode-text">{rankings[2]?.name}</div>
                <div className="text-vscode-comment">@{rankings[2]?.codeforces_username}</div>
                <div className={`text-xl font-bold mt-2 ${getRatingColor(rankings[2]?.rating_points)}`}>
                  {rankings[2]?.rating_points} pts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
          <h2 className="text-xl font-semibold text-vscode-text mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-vscode-blue" />
            Complete Rankings
          </h2>

          {rankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-vscode-comment mx-auto mb-4" />
              <h3 className="text-xl text-vscode-text mb-2">No rankings available</h3>
              <p className="text-vscode-comment">
                Rankings will appear after contests are completed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vscode-line">
                    <th className="text-left py-4 px-4 text-vscode-text">Rank</th>
                    <th className="text-left py-4 px-4 text-vscode-text">Participant</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Rating</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Contests</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Problems</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Best Rank</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Avg Rank</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Win Rate</th>
                    <th className="text-center py-4 px-4 text-vscode-text">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map(ranking => (
                    <tr 
                      key={ranking.user_id} 
                      className={`border-b border-vscode-line hover:bg-vscode-editor transition-colors ${
                        user && ranking.user_id === user.id ? 'bg-vscode-blue/10 border-vscode-blue' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {getRankIcon(ranking.rank)}
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRankBadgeColor(ranking.rank)}`}>
                            #{ranking.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-vscode-text font-semibold">{ranking.name}</div>
                          <div className="flex items-center space-x-1 text-vscode-comment text-sm">
                            <span>@{ranking.codeforces_username}</span>
                            <a
                              href={`https://codeforces.com/profile/${ranking.codeforces_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-vscode-blue hover:text-blue-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`text-lg font-bold ${getRatingColor(ranking.rating_points)}`}>
                          {ranking.rating_points}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-text">
                        {ranking.total_contests}
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-green font-semibold">
                        {ranking.total_problems_solved}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-vscode-yellow font-semibold">
                          #{ranking.best_rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-vscode-text">
                        #{Math.round(ranking.average_rank)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`font-semibold ${
                          ranking.win_rate >= 50 ? 'text-vscode-green' : 
                          ranking.win_rate >= 25 ? 'text-vscode-yellow' : 'text-vscode-comment'
                        }`}>
                          {ranking.win_rate}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className={`h-4 w-4 ${
                            ranking.recent_contests >= 3 ? 'text-vscode-green' : 'text-vscode-comment'
                          }`} />
                          <span className="text-vscode-text text-sm">
                            {ranking.recent_contests}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Footer */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-vscode-blue">{rankings.length}</div>
            <div className="text-vscode-comment">Total Participants</div>
          </div>
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-vscode-green">
              {rankings.reduce((sum, r) => sum + r.total_contests, 0)}
            </div>
            <div className="text-vscode-comment">Total Participations</div>
          </div>
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-vscode-yellow">
              {rankings.reduce((sum, r) => sum + r.total_problems_solved, 0)}
            </div>
            <div className="text-vscode-comment">Problems Solved</div>
          </div>
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-vscode-text">
              {rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + r.win_rate, 0) / rankings.length) : 0}%
            </div>
            <div className="text-vscode-comment">Avg Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
