'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';
import ContestTabs from '@/components/admin/ContestTabs';
import CreateContestForm, { NewContestData } from '@/components/admin/CreateContestForm';

import {
  Users,
  Trophy,
  Play,
  CheckCircle,
  AlertTriangle,
  Eye,
  Activity,
  XCircle,
} from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  problems: string[];
  is_active: boolean;
  created_at: string;
}

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

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'contests' | 'create' | 'logs'>('overview');

  const [loading, setLoading] = useState(true);

  const [contests, setContests] = useState<Contest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContests: 0,
    activeContests: 0,
    totalSubmissions: 0,
  });

  // Fetch data function
  const fetchAdminData = async () => {
  setLoading(true);
  try {
    const [contestsRes, logsRes, statsRes] = await Promise.all([
      fetch('/api/admin/contests'),
      fetch('/api/admin/activity-logs'),
      fetch('/api/admin/stats'),
    ]);

    if (contestsRes.ok) setContests(await contestsRes.json());
    if (logsRes.ok) setActivityLogs(await logsRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
  } catch (e) {
    console.error('Error fetching admin data:', e);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    // TODO: Add admin authentication check here or in layout

    fetchAdminData();
  }, []);

  // Contest status helper
  // Update the getContestStatus function in your admin dashboard
const getContestStatus = (contest: Contest): 'live' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);

  // Debug logging
  console.log('Status check:', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString(),
    nowTime: now.getTime(),
    startTime: start.getTime(),
    endTime: end.getTime()
  });

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
};


  // Event icon helper
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'tab_switch':
        return <AlertTriangle className="h-4 w-4 text-vscode-red" />;
      case 'focus_lost':
        return <Eye className="h-4 w-4 text-vscode-yellow" />;
      case 'code_submission':
        return <CheckCircle className="h-4 w-4 text-vscode-green" />;
      default:
        return <Activity className="h-4 w-4 text-vscode-comment" />;
    }
  };

  // Handler for contest creation:
  const handleCreateContest = async (data: NewContestData) => {
    setLoading(true);
    try {
      // In actual app, send user id or check admin session properly
      const userId = 'system'; // Or get from admin session/user

      const response = await fetch('/api/admin/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, created_by: userId }),
      });

      if (response.ok) {
        setActiveTab('contests');
        fetchAdminData();
      } else {
        const resData = await response.json();
        alert('Error creating contest: ' + (resData.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create contest, network error.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-vscode-text">Loading admin dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ContestTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
              <Users className="h-8 w-8 text-vscode-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-vscode-text">{stats.totalUsers}</div>
              <div className="text-vscode-comment">Total Users</div>
            </div>
            <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
              <Trophy className="h-8 w-8 text-vscode-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-vscode-text">{stats.totalContests}</div>
              <div className="text-vscode-comment">Total Contests</div>
            </div>
            <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
              <Play className="h-8 w-8 text-vscode-yellow mx-auto mb-3" />
              <div className="text-2xl font-bold text-vscode-text">{stats.activeContests}</div>
              <div className="text-vscode-comment">Active Contests</div>
            </div>
            <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
              <CheckCircle className="h-8 w-8 text-vscode-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-vscode-text">{stats.totalSubmissions}</div>
              <div className="text-vscode-comment">Total Submissions</div>
            </div>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
            <h2 className="text-xl font-semibold text-vscode-text mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center space-x-3 text-sm">
                  {getEventIcon(log.event_type)}
                  <span className="text-vscode-text font-medium">{log.name}</span>
                  <span className="text-vscode-comment">@{log.codeforces_username}</span>
                  <span className="text-vscode-comment ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contests' && (
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold text-vscode-text mb-6">Contest Management</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-vscode-line">
                <th className="text-left py-3 px-4 text-vscode-text">Contest</th>
                <th className="text-center py-3 px-4 text-vscode-text">Status</th>
                <th className="text-center py-3 px-4 text-vscode-text">Start Time</th>
                <th className="text-center py-3 px-4 text-vscode-text">Duration</th>
                <th className="text-center py-3 px-4 text-vscode-text">Problems</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr key={contest.id} className="border-b border-vscode-line hover:bg-vscode-editor">
                  <td className="py-3 px-4 text-vscode-text font-medium">{contest.title}</td>
                  <td className="py-3 px-4 text-center text-vscode-text">{getContestStatus(contest)}</td>
                  <td className="py-3 px-4 text-center text-vscode-text">
                    {new Date(contest.start_time).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-vscode-text">{contest.duration} min</td>
                  <td className="py-3 px-4 text-center text-vscode-text">{contest.problems.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* {activeTab === 'create' && <CreateContestForm onCreate={handleCreateContest} loading={loading} />} */}

      {activeTab === 'create' && <CreateContestForm onCreateAction={handleCreateContest} loading={loading} />}

      {activeTab === 'logs' && (
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold text-vscode-text mb-6">Activity Logs</h2>
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="bg-vscode-editor border border-vscode-line rounded p-4 whitespace-pre-wrap break-words">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(log.event_type)}
                    <span className="text-vscode-text font-medium">{log.name}</span>
                    <span className="text-vscode-comment">@{log.codeforces_username}</span>
                  </div>
                  <span className="text-vscode-comment text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-sm text-vscode-comment">
                  Event: <span className="text-vscode-yellow">{log.event_type}</span>
                </div>
                {log.details && (
                  <pre className="mt-2 text-xs text-vscode-comment bg-vscode-bg rounded p-2">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
