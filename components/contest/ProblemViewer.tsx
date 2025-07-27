'use client';

import React from 'react';
import { ExternalLink, Star, Tag, Clock, Database, Copy, CheckCircle } from 'lucide-react';

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

interface Props {
  problem: Problem;
  contestId: string;
}

export default function ProblemViewer({ problem }: Props) {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!problem) {
    return (
      <div className="h-full p-6 flex items-center justify-center text-vscode-comment bg-vscode-editor">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-lg">Select a problem to view details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-vscode-editor flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* Problem Statement */}
          <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-vscode-text flex items-center">
                <Database className="h-5 w-5 mr-2 text-vscode-blue" />
                Problem Statement
              </h2>
              
              {/* Direct Codeforces Link in Problem Statement */}
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-vscode-blue hover:text-blue-400 bg-vscode-blue/10 px-3 py-1 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-medium">View on Codeforces</span>
              </a>
            </div>
            
            {problem.statement ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-vscode-text leading-relaxed text-base">
                  {problem.statement.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ) : (
                      <br key={index} />
                    )
                  ))}
                  
                  {/* Enhanced Codeforces Link */}
                  <div className="mt-6 p-4 bg-vscode-bg rounded-lg border border-vscode-line">
                    <div className="flex items-center space-x-3">
                      <div className="text-vscode-blue text-2xl">📖</div>
                      <div className="flex-1">
                        <p className="text-vscode-text font-medium mb-1">
                          View Complete Problem Details
                        </p>
                        <p className="text-vscode-comment text-sm mb-3">
                          Access the full problem statement, input/output specifications, constraints, and sample test cases.
                        </p>
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-vscode-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Open in Codeforces</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-vscode-editor rounded border border-vscode-line">
                <div className="text-vscode-yellow text-4xl mb-4">⚠️</div>
                <p className="text-vscode-comment mb-4">
                  Problem statement could not be extracted automatically.
                </p>
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-vscode-blue hover:text-blue-400 bg-vscode-blue/10 px-4 py-2 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View full problem on Codeforces</span>
                </a>
              </div>
            )}
          </div>

          {/* Input/Output Specifications */}
          <div className="grid md:grid-cols-2 gap-6">
            {problem.inputSpec && problem.inputSpec !== 'Input specification not available' && (
              <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
                <h2 className="text-lg font-semibold text-vscode-text mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-vscode-green" />
                  Input
                </h2>
                <div className="text-vscode-text leading-relaxed">
                  {problem.inputSpec}
                </div>
              </div>
            )}

            {problem.outputSpec && problem.outputSpec !== 'Output specification not available' && (
              <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
                <h2 className="text-lg font-semibold text-vscode-text mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-vscode-blue" />
                  Output
                </h2>
                <div className="text-vscode-text leading-relaxed">
                  {problem.outputSpec}
                </div>
              </div>
            )}
          </div>

          {/* Sample Tests */}
          {problem.sampleTests && problem.sampleTests.length > 0 && (
            <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
              <h2 className="text-lg font-semibold text-vscode-text mb-6">Sample Tests</h2>
              <div className="space-y-6">
                {problem.sampleTests.map((test, index) => (
                  <div key={index} className="bg-vscode-editor rounded-lg p-4 border border-vscode-line">
                    <h3 className="text-md font-medium text-vscode-text mb-4">
                      Example {index + 1}:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-vscode-green">Input:</h4>
                          <button
                            onClick={() => copyToClipboard(test.input, `input-${index}`)}
                            className="flex items-center space-x-1 text-vscode-comment hover:text-vscode-text p-1 rounded"
                            title="Copy input"
                          >
                            {copiedText === `input-${index}` ? (
                              <CheckCircle className="h-3 w-3 text-vscode-green" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-vscode-bg p-3 rounded text-sm text-vscode-text overflow-x-auto border border-vscode-line font-mono">
{test.input}
                        </pre>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-vscode-blue">Output:</h4>
                          <button
                            onClick={() => copyToClipboard(test.output, `output-${index}`)}
                            className="flex items-center space-x-1 text-vscode-comment hover:text-vscode-text p-1 rounded"
                            title="Copy output"
                          >
                            {copiedText === `output-${index}` ? (
                              <CheckCircle className="h-3 w-3 text-vscode-green" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-vscode-bg p-3 rounded text-sm text-vscode-text overflow-x-auto border border-vscode-line font-mono">
{test.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helper Note */}
          <div className="bg-vscode-blue/10 border border-vscode-blue/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-vscode-blue text-xl">💡</div>
              <div>
                <h3 className="text-vscode-text font-medium mb-2">Tips:</h3>
                <ul className="text-vscode-comment text-sm space-y-1">
                  <li>• Copy sample inputs using the copy buttons above</li>
                  <li>• Use the code editor to write and test your solution</li>
                  <li>• Click "Run Code" to test with custom inputs</li>
                  <li>• Click "Submit & Save" to save your code and open Codeforces</li>
                  <li>• Use fullscreen mode for better coding experience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
