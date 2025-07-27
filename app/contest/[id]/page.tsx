'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ContestHeader from '@/components/contest/ContestHeader';
import ProblemNavigator from '@/components/contest/ProblemNavigator';
import ProblemViewer from '@/components/contest/ProblemViewer';
import CodeEditor from '@/components/contest/CodeEditor';
import { Contest } from '@/lib/database';
import { Maximize2, Minimize2 } from 'lucide-react';

interface Problem {
  contestId: string;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  url: string;
  statement?: string;
  inputSpec?: string;
  outputSpec?: string;
  sampleTests?: Array<{
    input: string;
    output: string;
  }>;
  timeLimit?: string;
  memoryLimit?: string;
}

export default function ContestPage() {
  const params = useParams();
  const contestId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contests/${contestId}`);
      
      if (!response.ok) {
        throw new Error('Contest not found');
      }

      const contestData = await response.json();
      setContest(contestData);

      // Fetch problems
      await fetchProblems(contestData.problems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async (problemUrls: string[]) => {
    try {
      const problemPromises = problemUrls.map(async (url, index) => {
        try {
          const response = await fetch(`/api/codeforces/problem?url=${encodeURIComponent(url)}`);
          if (response.ok) {
            const problemData = await response.json();
            return { ...problemData, index: String.fromCharCode(65 + index) };
          }
          return {
            contestId: '0',
            index: String.fromCharCode(65 + index),
            name: `Problem ${String.fromCharCode(65 + index)}`,
            url,
            tags: [],
            statement: 'Problem could not be loaded. Please view on Codeforces.',
          };
        } catch {
          return {
            contestId: '0',
            index: String.fromCharCode(65 + index),
            name: `Problem ${String.fromCharCode(65 + index)}`,
            url,
            tags: [],
            statement: 'Problem could not be loaded. Please view on Codeforces.',
          };
        }
      });

      const problemsData = await Promise.all(problemPromises);
      setProblems(problemsData);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vscode-blue mx-auto mb-4"></div>
            <div className="text-vscode-text text-lg">Loading contest...</div>
            <div className="text-vscode-comment text-sm mt-2">Fetching problems from Codeforces</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-vscode-red text-6xl mb-4">⚠️</div>
            <div className="text-vscode-red text-xl mb-2">{error || 'Contest not found'}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-vscode-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-vscode-bg flex flex-col overflow-hidden">
      {/* Pinned Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar user={user} />
        <ContestHeader contest={contest} />
      </div>
      
      {/* Main Contest Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pinned Left Sidebar - Problem Navigator */}
        <div className="w-80 bg-vscode-sidebar border-r border-vscode-line flex-shrink-0 sticky top-0 h-full overflow-y-auto">
          <ProblemNavigator 
            problems={problems}
            selectedProblem={selectedProblem}
            onProblemSelectAction={setSelectedProblem}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pinned Problem Info Bar */}
          <div className="bg-vscode-sidebar border-b-2 border-vscode-line px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center space-x-6">
              {problems[selectedProblem] && (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-vscode-blue bg-vscode-blue/10 px-3 py-1 rounded">
                      {problems[selectedProblem].index}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-vscode-text">
                        {problems[selectedProblem].name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        {problems[selectedProblem].rating && (
                          <span className="text-vscode-green font-medium">
                            {problems[selectedProblem].rating}
                          </span>
                        )}
                        <span className="text-vscode-comment">
                          Contest {problems[selectedProblem].contestId}
                        </span>
                        <span className="text-vscode-comment">
                          {problems[selectedProblem].timeLimit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {problems[selectedProblem].tags && problems[selectedProblem].tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {problems[selectedProblem].tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-vscode-line text-vscode-comment px-2 py-1 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {problems[selectedProblem].tags.length > 3 && (
                        <span className="text-xs text-vscode-comment">
                          +{problems[selectedProblem].tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <a
                href={problems[selectedProblem]?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-vscode-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <span>Codeforces</span>
              </a>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-2 bg-vscode-green text-black px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-medium"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Problem Viewer - Only show when not in fullscreen */}
            {!isFullscreen && (
              <div className="w-2/5 border-r border-vscode-line overflow-y-auto bg-vscode-editor">
                <ProblemViewer 
                  problem={problems[selectedProblem]}
                  contestId={contestId}
                />
              </div>
            )}

            {/* Code Editor Area */}
            <div className={`${isFullscreen ? 'w-full' : 'w-3/5'} flex overflow-hidden`}>
              <CodeEditor 
                problemUrl={problems[selectedProblem]?.url}
                contestId={contestId}
                userId={user?.id}
                isFullscreen={isFullscreen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
