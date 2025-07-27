'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Users } from 'lucide-react';
import { Contest } from '@/lib/database';

interface Props {
  contest: Contest;
}

export default function ContestHeader({ contest }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [status, setStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.start_time);
      const end = new Date(contest.end_time);

      if (now < start) {
        setStatus('upcoming');
        const diff = start.getTime() - now.getTime();
        setTimeLeft(formatTime(diff));
      } else if (now >= start && now <= end) {
        setStatus('live');
        const diff = end.getTime() - now.getTime();
        setTimeLeft(formatTime(diff));
      } else {
        setStatus('ended');
        setTimeLeft('Contest Ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'live': return 'text-vscode-green';
      case 'upcoming': return 'text-vscode-yellow';
      case 'ended': return 'text-vscode-red';
    }
  };

  return (
    <div className="bg-vscode-sidebar border-b border-vscode-line px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Trophy className="h-6 w-6 text-vscode-blue" />
          <h1 className="text-xl font-bold text-vscode-text">{contest.title}</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className={`h-5 w-5 ${getStatusColor()}`} />
            <span className={`font-mono text-lg font-bold ${getStatusColor()}`}>
              {timeLeft}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-vscode-comment">
            <Users className="h-4 w-4" />
            <span>{contest.problems.length} Problems</span>
          </div>
        </div>
      </div>
    </div>
  );
}
