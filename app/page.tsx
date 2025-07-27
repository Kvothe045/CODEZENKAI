'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CurrentContest from '@/components/CurrentContest';
import UpcomingContests from '@/components/UpcomingContests';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export interface Contest {
  id: string;
  title: string;
  start_time: string; // ISO string date
  end_time: string;
  duration: number;
  problems: string[];
  is_active: boolean;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate user fetching (or from localStorage/session)
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  
    fetchContests();
  }, []);

  async function fetchContests() {
    try {
      const res = await fetch('/api/contests');
      if (res.ok) {
        const data = await res.json();
        setContests(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contests', error);
    } finally {
      setLoading(false);
    }
  }

  // Identify current contest and upcoming contests
  const now = new Date();
  const currentContest = contests.find(c =>
    new Date(c.start_time) <= now && new Date(c.end_time) >= now
  );
  const upcomingContests = contests
    .filter(c => new Date(c.start_time) > now)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64 text-vscode-text">
          Loading contests...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar user={user} />
      <Hero />
      {currentContest && <CurrentContest contest={currentContest} />}
      <Features />
      {upcomingContests.length > 0 && <UpcomingContests contests={upcomingContests} />}
      <Footer />
    </div>
  );
}
