'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Folder, Check, AlertCircle, Settings, Terminal, Copy, CheckCircle, Download, Code, Zap, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

interface Props {
  problemUrl?: string;
  contestId: string;
  userId?: string;
  layoutMode: 'split' | 'code-focus' | 'fullscreen';
  showProblemViewer: boolean;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

const getBrowserCapabilities = () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  const isMac = /Mac/.test(navigator.platform);
  const isWindows = /Win/.test(navigator.platform);
  const isLinux = /Linux/.test(navigator.platform);

  const supportsFileSystemAccess = 'showDirectoryPicker' in window && (isChrome || isEdge);
  
  return {
    browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : isSafari ? 'Safari' : 'Unknown',
    os: isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : 'Unknown',
    supportsFileSystemAccess,
    isChrome,
    isFirefox,
    isEdge,
    isSafari,
    isMac,
    isWindows,
    isLinux
  };
};

export default function CodeEditor({ problemUrl, contestId, userId, layoutMode, showProblemViewer }: Props) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveLocation, setSaveLocation] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [browserInfo] = useState(getBrowserCapabilities());
  const [executionPanelHeight, setExecutionPanelHeight] = useState(300); // Fixed height in pixels
  const [isExecutionPanelExpanded, setIsExecutionPanelExpanded] = useState(false);
  const fileHandleRef = useRef<any>(null);

  // Enhanced language templates
  const languageTemplates = {
    cpp: `#include <bits/stdc++.h>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
    python: `# Fast I/O for competitive programming
import sys
input = sys.stdin.readline

def main():
    # Your code here
    n = int(input())
    print(n)

if __name__ == "__main__":
    main()`,
    java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter pw = new PrintWriter(System.out);
        
        // Your code here
        int n = Integer.parseInt(br.readLine());
        pw.println(n);
        
        pw.close();
    }
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

int main() {
    // Your code here
    int n;
    scanf("%d", &n);
    printf("%d\\n", n);
    return 0;
}`,
    javascript: `// Node.js competitive programming template
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = [];
rl.on('line', (line) => {
    input.push(line);
});

rl.on('close', () => {
    solve();
});

function solve() {
    // Your code here
    const n = parseInt(input[0]);
    console.log(n);
}`,
    go: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strconv"
    "strings"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    
    // Your code here
    scanner.Scan()
    n, _ := strconv.Atoi(scanner.Text())
    fmt.Println(n)
}`,
    rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    
    // Your code here
    if let Some(Ok(line)) = lines.next() {
        let n: i32 = line.trim().parse().unwrap();
        println!("{}", n);
    }
}`
  };

  // Language display names and file extensions
  const languageInfo = {
    cpp: { name: 'C++', extension: 'cpp', monaco: 'cpp' },
    python: { name: 'Python', extension: 'py', monaco: 'python' },
    java: { name: 'Java', extension: 'java', monaco: 'java' },
    c: { name: 'C', extension: 'c', monaco: 'c' },
    javascript: { name: 'JavaScript', extension: 'js', monaco: 'javascript' },
    go: { name: 'Go', extension: 'go', monaco: 'go' },
    rust: { name: 'Rust', extension: 'rs', monaco: 'rust' }
  };

  useEffect(() => {
    setCode(languageTemplates[language as keyof typeof languageTemplates]);
  }, [language]);

  useEffect(() => {
    const savedLocation = localStorage.getItem('codezenkai_save_location');
    const savedMethod = localStorage.getItem('codezenkai_save_method');
    
    if (savedLocation && savedMethod) {
      setSaveLocation(savedLocation);
    }
  }, [browserInfo.supportsFileSystemAccess]);

  // Auto-expand execution panel when running code
  useEffect(() => {
    if (isExecuting || executionResult) {
      setIsExecutionPanelExpanded(true);
    }
  }, [isExecuting, executionResult]);

  const executeCode = async () => {
    if (!code.trim()) {
      alert('Please write some code before running');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setIsExecutionPanelExpanded(true); // Expand panel when executing

    try {
      const response = await fetch('/api/code-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: customInput })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        error: `Failed to execute code: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getProblemIdFromUrl = (url?: string): string => {
    if (!url) return "solution";
    try {
      if (url.includes('/contest/')) {
        const match = url.match(/\/contest\/(\d+)\/problem\/([A-Z])/);
        if (match) return `${match[1]}${match[2]}`;
      } else if (url.includes('/problemset/problem/')) {
        const match = url.match(/\/problemset\/problem\/(\d+)\/([A-Z])/);
        if (match) return `${match[1]}${match[2]}`;
      }
    } catch (e) {
      console.error('Error parsing problem URL:', e);
    }
    return "solution";
  };

  const handleSelectLocation = async () => {
    try {
      if (browserInfo.supportsFileSystemAccess) {
        const dirHandle = await (window as any).showDirectoryPicker();
        fileHandleRef.current = dirHandle;
        setSaveLocation(`${dirHandle.name} (File System)`);
        localStorage.setItem('codezenkai_save_location', dirHandle.name);
        localStorage.setItem('codezenkai_save_method', 'filesystem');
        setShowLocationPrompt(false);
      } else {
        const locationName = browserInfo.isFirefox ? 'Downloads (Firefox)' : 
                            browserInfo.isSafari ? 'Downloads (Safari)' : 
                            'Downloads (Browser Default)';
        
        setSaveLocation(locationName);
        localStorage.setItem('codezenkai_save_location', locationName);
        localStorage.setItem('codezenkai_save_method', 'download');
        setShowLocationPrompt(false);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting directory:', err);
        const fallbackLocation = `Downloads (${browserInfo.browser} - ${browserInfo.os})`;
        setSaveLocation(fallbackLocation);
        localStorage.setItem('codezenkai_save_location', fallbackLocation);
        localStorage.setItem('codezenkai_save_method', 'download');
        setShowLocationPrompt(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!saveLocation) {
      setShowLocationPrompt(true);
      return;
    }

    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const problemId = getProblemIdFromUrl(problemUrl);
      const langInfo = languageInfo[language as keyof typeof languageInfo];
      const fileName = `${problemId}.${langInfo.extension}`;
      const blob = new Blob([code], { type: 'text/plain' });

      const savedMethod = localStorage.getItem('codezenkai_save_method');

      if (savedMethod === 'filesystem' && fileHandleRef.current && browserInfo.supportsFileSystemAccess) {
        try {
          const fileHandle = await fileHandleRef.current.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          console.log(`File saved to selected directory: ${fileName}`);
        } catch (err) {
          console.error('Error saving to selected directory:', err);
          fallbackDownload(blob, fileName);
        }
      } else {
        fallbackDownload(blob, fileName);
      }

      if (problemUrl) {
        window.open(problemUrl, '_blank');
      }

    } catch (error) {
      console.error('Error during submission:', error);
      alert('Error during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    console.log(`File downloaded: ${fileName}`);
  };

  const clearSavedLocation = () => {
    setSaveLocation(null);
    fileHandleRef.current = null;
    localStorage.removeItem('codezenkai_save_location');
    localStorage.removeItem('codezenkai_save_method');
    setShowLocationPrompt(true);
  };

  const copyOutputToClipboard = async () => {
    if (executionResult?.output) {
      try {
        await navigator.clipboard.writeText(executionResult.output);
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      } catch (err) {
        console.error('Failed to copy output');
      }
    }
  };

  const toggleExecutionPanel = () => {
    setIsExecutionPanelExpanded(!isExecutionPanelExpanded);
  };

  // Dynamic layout based on mode and execution panel state
  const getLayoutConfig = () => {
    if (layoutMode === 'fullscreen') {
      return {
        editorWidth: isExecutionPanelExpanded ? 'w-3/4' : 'w-4/5',
        executionWidth: isExecutionPanelExpanded ? 'w-1/4' : 'w-1/5',
        showMinimap: true,
      };
    } else {
      return {
        editorWidth: isExecutionPanelExpanded ? 'w-2/3' : 'w-3/4',
        executionWidth: isExecutionPanelExpanded ? 'w-1/3' : 'w-1/4',
        showMinimap: layoutMode === 'code-focus',
      };
    }
  };

  const layout = getLayoutConfig();

  return (
    <div className="h-full bg-vscode-editor flex flex-col">
      {/* Toolbar - Fixed at top */}
      <div className="bg-vscode-sidebar border-b border-vscode-line px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-vscode-blue" />
            <span className="text-vscode-text text-sm font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue min-w-32"
            >
              {Object.entries(languageInfo).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {!saveLocation ? (
              <button
                onClick={handleSelectLocation}
                className="flex items-center space-x-2 bg-vscode-yellow text-black px-3 py-2 rounded text-sm hover:bg-yellow-400 transition-colors font-medium"
              >
                {browserInfo.supportsFileSystemAccess ? <Folder className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">Select Save Location</span>
                <span className="sm:hidden">Save</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-vscode-bg rounded px-3 py-2 border border-vscode-line">
                  <Check className="h-3 w-3 text-vscode-green flex-shrink-0" />
                  <span className="text-xs text-vscode-comment max-w-24 truncate" title={saveLocation}>
                    {saveLocation}
                  </span>
                  <button
                    onClick={clearSavedLocation}
                    className="text-vscode-red hover:text-red-400 text-xs ml-1"
                    title="Clear saved location"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="flex items-center space-x-2 bg-vscode-green text-black px-4 py-2 rounded hover:bg-green-400 disabled:opacity-50 transition-colors font-medium"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                <span className="hidden sm:inline">Running...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" />
                <span className="hidden sm:inline">Run Code</span>
                <span className="sm:hidden">Run</span>
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !saveLocation}
            className="flex items-center space-x-2 bg-vscode-blue text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="hidden sm:inline">Submitting...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Save & Submit</span>
                <span className="sm:hidden">Submit</span>
              </>
            )}
          </button>

          {/* Judge0 Badge */}
          {/* <div className="hidden lg:flex items-center space-x-2 text-xs text-vscode-comment">
            <Zap className="h-3 w-3 text-vscode-yellow" />
            <span>Judge0</span>
          </div> */}
        </div>
      </div>

      {/* Browser compatibility prompt */}
      {showLocationPrompt && (
        <div className="bg-vscode-blue/10 border-b border-vscode-blue/20 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-2 text-vscode-text text-sm">
              <AlertCircle className="h-4 w-4 text-vscode-blue mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">Choose your preferred save method:</div>
                <div className="text-vscode-comment">
                  {browserInfo.supportsFileSystemAccess ? (
                    <>• {browserInfo.browser} supports folder selection for custom save locations</>
                  ) : (
                    <>• {browserInfo.browser} will save files to your default Downloads folder</>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="text-vscode-comment hover:text-vscode-text"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Editor and Execution Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor - Maintains consistent width */}
        <div className={`${layout.editorWidth} transition-all duration-300 ease-in-out flex flex-col border-r border-vscode-line`}>
          <div className="flex-1 relative">
            {!isEditorReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-vscode-editor z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vscode-blue mx-auto mb-2"></div>
                  <div className="text-vscode-comment">Loading editor...</div>
                </div>
              </div>
            )}
            <Editor
              height="100%"
              language={languageInfo[language as keyof typeof languageInfo].monaco}
              value={code}
              onChange={(value: string | undefined) => setCode(value || '')}
              onMount={() => setIsEditorReady(true)}
              theme="vs-dark"
              options={{
                minimap: { enabled: layout.showMinimap },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                contextmenu: true,
                lineNumbers: 'on',
                rulers: [80],
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                bracketPairColorization: { enabled: true },
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                renderWhitespace: 'selection',
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                  useShadows: false,
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
              }}
            />
          </div>
        </div>

        {/* Execution Panel - Smart Layout */}
        <div className={`${layout.executionWidth} transition-all duration-300 ease-in-out bg-vscode-sidebar flex flex-col`}>
          {/* Collapsible Header */}
          <div className="flex-shrink-0 p-4 border-b border-vscode-line bg-vscode-bg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-vscode-text flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Code Execution</span>
                <span className="sm:hidden">Execute</span>
              </h3>
              <button
                onClick={toggleExecutionPanel}
                className="text-vscode-comment hover:text-vscode-text p-1 rounded hover:bg-vscode-line transition-colors"
                title={isExecutionPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
              >
                {isExecutionPanelExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Expandable Content */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            isExecutionPanelExpanded ? 'opacity-100' : 'opacity-60'
          }`}>
            {/* Input Section */}
            <div className="flex-shrink-0 p-4 border-b border-vscode-line">
              <label className="block text-sm font-medium text-vscode-text mb-2">
                {isExecutionPanelExpanded ? 'Custom Input:' : 'Input:'}
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input for your program..."
                className={`w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text text-sm focus:outline-none focus:border-vscode-blue resize-none font-mono transition-all duration-300 ${
                  isExecutionPanelExpanded ? 'h-24' : 'h-16'
                }`}
              />
            </div>

            {/* Output Section */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-vscode-text">
                  Output:
                </label>
                {executionResult?.output && (
                  <button
                    onClick={copyOutputToClipboard}
                    className="flex items-center space-x-1 text-vscode-comment hover:text-vscode-text p-1 rounded hover:bg-vscode-line"
                    title="Copy output"
                  >
                    {copiedOutput ? (
                      <CheckCircle className="h-3 w-3 text-vscode-green" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              
              {isExecuting ? (
                <div className="bg-vscode-editor border border-vscode-line rounded p-4 text-sm">
                  <div className="flex items-center space-x-2 text-vscode-yellow">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-vscode-yellow border-t-transparent"></div>
                    <span>Executing code...</span>
                  </div>
                </div>
              ) : executionResult ? (
                <div className="space-y-3">
                  {executionResult.success ? (
                    <div className="bg-vscode-editor border border-vscode-line rounded p-4">
                      <pre className="text-sm text-vscode-text whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto max-h-48">
                        {executionResult.output || '(no output)'}
                      </pre>
                      {executionResult.executionTime !== undefined && (
                        <div className="mt-3 pt-3 border-t border-vscode-line text-xs text-vscode-comment flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-vscode-green" />
                          <span>Time: {executionResult.executionTime}ms</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-vscode-red/10 border border-vscode-red rounded p-4">
                      <pre className="text-sm text-vscode-red whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto max-h-48">
                        {executionResult.error || 'Unknown error occurred'}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-vscode-editor border border-vscode-line rounded p-4 text-sm text-vscode-comment text-center">
                  <div className="mb-2">💻</div>
                  <div>{isExecutionPanelExpanded ? 'Click "Run Code" to execute your program' : 'Run code to see output'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
