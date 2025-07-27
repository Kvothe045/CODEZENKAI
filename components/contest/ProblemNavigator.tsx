'use client';

import React from 'react';
import { CheckCircle, Circle, Star } from 'lucide-react';

interface Problem {
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  url: string;
}

interface Props {
  problems: Problem[];
  selectedProblem: number;
  onProblemSelectAction: (index: number) => void; // Make sure this matches what you're passing
}

export default function ProblemNavigator({ problems, selectedProblem, onProblemSelectAction }: Props) {
  const getDifficultyColor = (rating?: number) => {
    if (!rating) return 'text-vscode-comment';
    if (rating <= 1200) return 'text-green-500';
    if (rating <= 1600) return 'text-blue-500';
    if (rating <= 2000) return 'text-purple-500';
    if (rating <= 2400) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-vscode-text mb-4">Problems</h2>
      
      <div className="space-y-2">
        {problems.map((problem, index) => (
          <button
            key={index}
            onClick={() => onProblemSelectAction(index)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedProblem === index
                ? 'bg-vscode-blue/20 border-vscode-blue text-vscode-blue'
                : 'bg-vscode-editor border-vscode-line text-vscode-text hover:bg-vscode-line'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{problem.index}</span>
              <Circle className="h-4 w-4 text-vscode-comment" />
            </div>
            
            <div className="text-sm font-medium mb-1 truncate">
              {problem.name}
            </div>
            
            {problem.rating && (
              <div className="flex items-center space-x-1">
                <Star className={`h-3 w-3 ${getDifficultyColor(problem.rating)}`} />
                <span className={`text-xs ${getDifficultyColor(problem.rating)}`}>
                  {problem.rating}
                </span>
              </div>
            )}
            
            {problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {problem.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs bg-vscode-line text-vscode-comment px-1 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {problem.tags.length > 2 && (
                  <span className="text-xs text-vscode-comment">+{problem.tags.length - 2}</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
