// app/contests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Trophy, Clock, Users, Calendar, Play, Eye } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  problems: string[];
  is_active: boolean;
}

export default function ContestsPage() {
  const [user, setUser] = useState(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchContests();
    // Load user from localStorage or session
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests');
      if (response.ok) {
        const data = await response.json();
        setContests(data);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'live';
    return 'past';
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    return getContestStatus(contest) === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-vscode-green';
      case 'upcoming': return 'text-vscode-yellow';
      case 'past': return 'text-vscode-comment';
      default: return 'text-vscode-text';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Play className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'past': return <Eye className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-vscode-text">Loading contests...</div>
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
            Contests
          </h1>
          <p className="text-vscode-comment">
            Participate in coding contests and compete with your peers
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-vscode-sidebar rounded-lg p-1">
            {[
              { key: 'all', label: 'All Contests' },
              { key: 'live', label: 'Live' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === key
                    ? 'bg-vscode-blue text-white'
                    : 'text-vscode-comment hover:text-vscode-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-vscode-comment mx-auto mb-4" />
            <h3 className="text-xl text-vscode-text mb-2">No contests found</h3>
            <p className="text-vscode-comment">
              {filter === 'all' ? 'No contests available yet.' : `No ${filter} contests.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => {
              const status = getContestStatus(contest);
              return (
                <div key={contest.id} className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 hover:border-vscode-blue transition-colors">
                  {/* Contest Status Badge */}
                  <div className={`flex items-center space-x-2 mb-3 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="text-sm font-semibold uppercase">{status}</span>
                  </div>

                  {/* Contest Title */}
                  <h3 className="text-xl font-semibold text-vscode-text mb-3">
                    {contest.title}
                  </h3>

                  {/* Contest Details */}
                  <div className="space-y-2 mb-4 text-sm text-vscode-comment">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(contest.start_time).toLocaleDateString()} at{' '}
                        {new Date(contest.start_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{contest.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span>{contest.problems.length} problems</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/contest/${contest.id}`}
                    className={`block w-full text-center py-2 px-4 rounded transition-colors ${
                      status === 'live'
                        ? 'bg-vscode-green text-black hover:bg-green-400'
                        : status === 'upcoming'
                        ? 'bg-vscode-yellow text-black hover:bg-yellow-400'
                        : 'bg-vscode-editor border border-vscode-line text-vscode-text hover:bg-vscode-line'
                    }`}
                  >
                    {status === 'live' ? 'Join Contest' : status === 'upcoming' ? 'View Details' : 'View Results'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
          <h2 className="text-xl font-semibold text-vscode-text mb-4">Contest Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-vscode-blue">{contests.length}</div>
              <div className="text-vscode-comment">Total Contests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vscode-green">
                {contests.filter(c => getContestStatus(c) === 'live').length}
              </div>
              <div className="text-vscode-comment">Live Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vscode-yellow">
                {contests.filter(c => getContestStatus(c) === 'upcoming').length}
              </div>
              <div className="text-vscode-comment">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vscode-comment">
                {contests.filter(c => getContestStatus(c) === 'past').length}
              </div>
              <div className="text-vscode-comment">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
