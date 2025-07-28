'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ContestHeader from '@/components/contest/ContestHeader';
import ProblemNavigator from '@/components/contest/ProblemNavigator';
import ProblemViewer from '@/components/contest/ProblemViewer';
import CodeEditor from '@/components/contest/CodeEditor';
import { Contest } from '@/lib/database';
import { Maximize2, Minimize2, EyeOff, Eye, Layout, Code2, Monitor } from 'lucide-react';

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

type LayoutMode = 'split' | 'code-focus' | 'fullscreen';

export default function ContestPage() {
  const params = useParams();
  const contestId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [showProblemViewer, setShowProblemViewer] = useState(true);

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

  const toggleLayoutMode = () => {
    if (layoutMode === 'split') {
      setLayoutMode('code-focus');
    } else if (layoutMode === 'code-focus') {
      setLayoutMode('fullscreen');
    } else {
      setLayoutMode('split');
    }
  };

  const toggleProblemViewer = () => {
    setShowProblemViewer(!showProblemViewer);
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

  const getLayoutConfig = () => {
    switch (layoutMode) {
      case 'split':
        return {
          showSidebar: true,
          showProblemInfo: true,
          sidebarWidth: 'w-80',
          problemViewerWidth: showProblemViewer ? 'w-2/5' : 'w-0',
          editorWidth: showProblemViewer ? 'w-3/5' : 'w-full',
          containerHeight: 'h-screen',
          contentHeight: 'calc(100vh - 140px)', // Navbar (64px) + Contest Header (76px)
        };
      case 'code-focus':
        return {
          showSidebar: true,
          showProblemInfo: true,
          sidebarWidth: 'w-80',
          problemViewerWidth: showProblemViewer ? 'w-1/4' : 'w-0',
          editorWidth: showProblemViewer ? 'w-3/4' : 'w-full',
          containerHeight: 'h-screen',
          contentHeight: 'calc(100vh - 140px)',
        };
      case 'fullscreen':
        return {
          showSidebar: false,
          showProblemInfo: false,
          sidebarWidth: 'w-0',
          problemViewerWidth: 'w-0',
          editorWidth: 'w-full',
          containerHeight: 'h-screen',
          contentHeight: 'calc(100vh - 64px)', // Only Navbar
        };
    }
  };

  const layout = getLayoutConfig();

  return (
    <div className={`${layout.containerHeight} bg-vscode-bg flex flex-col overflow-hidden relative`}>
      {/* Fixed Navbar Layer - Z-Index 100 */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-vscode-bg border-b border-vscode-line">
        <Navbar user={user} />
        {layout.showProblemInfo && (
          <div className="border-t border-vscode-line">
            <ContestHeader contest={contest} />
          </div>
        )}
      </div>
      
      {/* Main Content Layer - Z-Index 10 */}
      <div 
        className="flex overflow-hidden relative z-10"
        style={{ 
          height: layout.contentHeight,
          marginTop: layout.showProblemInfo ? '140px' : '64px'
        }}
      >
        {/* Left Sidebar - Fixed Width with Smooth Transitions */}
        <div 
          className={`${layout.sidebarWidth} bg-vscode-sidebar border-r border-vscode-line flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden relative z-20`}
          style={{ 
            transform: layout.showSidebar ? 'translateX(0)' : 'translateX(-100%)',
            opacity: layout.showSidebar ? 1 : 0
          }}
        >
          <div className="w-80 h-full overflow-y-auto">
            <ProblemNavigator 
              problems={problems}
              selectedProblem={selectedProblem}
              onProblemSelectAction={setSelectedProblem}
            />
          </div>
        </div>

        {/* Main Content Area - Flexible Width */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Enhanced Problem Info Bar with Better Spacing */}
          {layout.showProblemInfo && (
            <div className="bg-vscode-sidebar border-b-2 border-vscode-line px-6 py-4 flex items-center justify-between flex-shrink-0 relative z-30 min-h-[80px]">
              <div className="flex items-center space-x-6 flex-1 min-w-0">
                {problems[selectedProblem] && (
                  <>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="text-2xl font-bold text-vscode-blue bg-vscode-blue/10 px-3 py-1 rounded flex-shrink-0">
                        {problems[selectedProblem].index}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-vscode-text truncate">
                          {problems[selectedProblem].name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          {problems[selectedProblem].rating && (
                            <span className="text-vscode-green font-medium flex-shrink-0">
                              {problems[selectedProblem].rating}
                            </span>
                          )}
                          <span className="text-vscode-comment flex-shrink-0">
                            Contest {problems[selectedProblem].contestId}
                          </span>
                          <span className="text-vscode-comment flex-shrink-0">
                            {problems[selectedProblem].timeLimit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {problems[selectedProblem].tags && problems[selectedProblem].tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                        {problems[selectedProblem].tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-vscode-line text-vscode-comment px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                          >
                            {tag}
                          </span>
                        ))}
                        {problems[selectedProblem].tags.length > 3 && (
                          <span className="text-xs text-vscode-comment flex-shrink-0">
                            +{problems[selectedProblem].tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0 ml-6">
                {/* Layout Control Buttons with Better Spacing */}
                <div className="flex items-center space-x-1 bg-vscode-bg rounded-lg p-1 border border-vscode-line">
                  {layoutMode !== 'fullscreen' && (
                    <button
                      onClick={toggleProblemViewer}
                      className={`flex items-center space-x-1 px-3 py-2 rounded text-sm transition-all duration-200 ${
                        showProblemViewer 
                          ? 'bg-vscode-blue text-white shadow-sm' 
                          : 'text-vscode-comment hover:text-vscode-text hover:bg-vscode-line/50'
                      }`}
                      title={showProblemViewer ? 'Hide Problem Statement' : 'Show Problem Statement'}
                    >
                      {showProblemViewer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="hidden sm:inline">Problem</span>
                    </button>
                  )}
                  
                  <button
                    onClick={toggleLayoutMode}
                    className="flex items-center space-x-1 px-3 py-2 rounded text-sm text-vscode-comment hover:text-vscode-text hover:bg-vscode-line/50 transition-all duration-200"
                    title={`Switch to ${layoutMode === 'split' ? 'Code Focus' : layoutMode === 'code-focus' ? 'Fullscreen' : 'Split View'} Mode`}
                  >
                    {layoutMode === 'split' && <Layout className="h-4 w-4" />}
                    {layoutMode === 'code-focus' && <Code2 className="h-4 w-4" />}
                    {layoutMode === 'fullscreen' && <Monitor className="h-4 w-4" />}
                    <span className="hidden sm:inline">
                      {layoutMode === 'split' && 'Split'}
                      {layoutMode === 'code-focus' && 'Focus'}
                      {layoutMode === 'fullscreen' && 'Full'}
                    </span>
                  </button>
                </div>

                <a
                  href={problems[selectedProblem]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-vscode-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex-shrink-0"
                >
                  <span>Codeforces</span>
                </a>
              </div>
            </div>
          )}

          {/* Content Area with Perfect Boundaries */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Problem Viewer - Animated with Proper Boundaries */}
            <div 
              className={`${layout.problemViewerWidth} transition-all duration-300 ease-in-out overflow-hidden border-r border-vscode-line flex-shrink-0 relative`}
              style={{ 
                opacity: showProblemViewer && layoutMode !== 'fullscreen' ? 1 : 0,
                transform: showProblemViewer && layoutMode !== 'fullscreen' ? 'translateX(0)' : 'translateX(-20px)',
                visibility: showProblemViewer && layoutMode !== 'fullscreen' ? 'visible' : 'hidden'
              }}
            >
              {showProblemViewer && layoutMode !== 'fullscreen' && (
                <div className="w-full h-full overflow-hidden">
                  <ProblemViewer 
                    problem={problems[selectedProblem]}
                    contestId={contestId}
                  />
                </div>
              )}
            </div>

            {/* Code Editor Area - Maintains Perfect Boundaries */}
            <div className={`${layout.editorWidth} transition-all duration-300 ease-in-out flex overflow-hidden flex-shrink-0`}>
              <CodeEditor 
                problemUrl={problems[selectedProblem]?.url}
                contestId={contestId}
                userId={user?.id}
                layoutMode={layoutMode}
                showProblemViewer={showProblemViewer}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Controls for Fullscreen Mode - Z-Index 200 */}
      {layoutMode === 'fullscreen' && (
        <div className="fixed top-4 right-4 z-[200]">
          <div className="flex items-center space-x-2 bg-vscode-sidebar/95 backdrop-blur-md rounded-lg p-3 border border-vscode-line shadow-2xl">
            <button
              onClick={toggleLayoutMode}
              className="flex items-center space-x-2 px-4 py-2 rounded text-sm text-vscode-text hover:bg-vscode-line/50 transition-all duration-200"
              title="Exit Fullscreen"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Exit Fullscreen</span>
            </button>
            {problems[selectedProblem] && (
              <a
                href={problems[selectedProblem].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-vscode-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
              >
                <span>Codeforces</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
