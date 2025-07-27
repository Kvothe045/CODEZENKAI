'use client';

import React from 'react';
import { Activity, Trophy, Plus, Eye } from 'lucide-react';

interface ContestTabsProps {
  activeTab: 'overview' | 'contests' | 'create' | 'logs';
  onChange: (tab: ContestTabsProps['activeTab']) => void;
}

const tabs: {
  key: ContestTabsProps['activeTab'];
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'contests', label: 'Contests', icon: Trophy },
  { key: 'create', label: 'Create Contest', icon: Plus },
  { key: 'logs', label: 'Activity Logs', icon: Eye },
];

export default function ContestTabs({ activeTab, onChange }: ContestTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex space-x-1 bg-vscode-sidebar rounded-lg p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${
              activeTab === key ? 'bg-vscode-blue text-white' : 'text-vscode-comment hover:text-vscode-text'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
