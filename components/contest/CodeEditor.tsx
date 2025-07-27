'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Folder, Check, AlertCircle, Settings, Terminal, Copy, CheckCircle, Download, Code } from 'lucide-react';

interface Props {
  problemUrl?: string;
  contestId: string;
  userId?: string;
  isFullscreen?: boolean;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

// Detect browser and OS capabilities
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

export default function CodeEditor({ problemUrl, contestId, userId, isFullscreen = false }: Props) {
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
  const fileHandleRef = useRef<any>(null);

  const languageTemplates = {
    cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <string>\n#include <map>\n#include <set>\n#include <queue>\n#include <stack>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your code here\n    \n    return 0;\n}',
    python: '# Write your Python code here\n\n# Read input\nn = int(input())\nprint(n)\n',
    java: 'import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n        // Write your code here\n        \n        sc.close();\n    }\n}'
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

  const executeCode = async () => {
    if (!code.trim()) {
      alert('Please write some code before running');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/code-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: customInput })
      });

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        error: 'Failed to execute code. Please try again.'
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
      const fileExtension = language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'java';
      const fileName = `${problemId}.${fileExtension}`;
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

  const editorHeight = isFullscreen ? 'calc(100vh - 280px)' : '500px';

  return (
    <div className="h-full bg-vscode-editor flex">
      {/* Code Editor - Left Side */}
      <div className={`${isFullscreen ? 'w-3/4' : 'w-2/3'} flex flex-col border-r border-vscode-line`}>
        {/* Toolbar */}
        <div className="bg-vscode-sidebar border-b border-vscode-line px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-vscode-blue" />
              <span className="text-vscode-text text-sm font-medium">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue min-w-24"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {!saveLocation ? (
                <button
                  onClick={handleSelectLocation}
                  className="flex items-center space-x-2 bg-vscode-yellow text-black px-3 py-2 rounded text-sm hover:bg-yellow-400 transition-colors font-medium"
                >
                  {browserInfo.supportsFileSystemAccess ? <Folder className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  <span>Select Save Location</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectLocation}
                    className="flex items-center space-x-2 bg-vscode-line text-vscode-text px-3 py-2 rounded text-sm hover:bg-vscode-comment transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Change</span>
                  </button>
                  <div className="flex items-center space-x-2 bg-vscode-bg rounded px-3 py-2 border border-vscode-line">
                    <Check className="h-3 w-3 text-vscode-green flex-shrink-0" />
                    <span className="text-xs text-vscode-comment max-w-32 truncate" title={saveLocation}>
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
        </div>

        {/* Browser Compatibility Info */}
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

        {/* Code Editor */}
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
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={(value: string | undefined) => setCode(value || '')}
            onMount={() => setIsEditorReady(true)}
            theme="vs-dark"
            options={{
              minimap: { enabled: isFullscreen },
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

      {/* Execution Panel - Right Side */}
      <div className={`${isFullscreen ? 'w-1/4' : 'w-1/3'} bg-vscode-sidebar flex flex-col`}>
        {/* Panel Header */}
        <div className="p-4 border-b border-vscode-line bg-vscode-bg">
          <h3 className="font-semibold text-vscode-text flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Code Execution
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-vscode-line space-y-3">
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="w-full flex items-center justify-center space-x-2 bg-vscode-green text-black px-4 py-3 rounded hover:bg-green-400 disabled:opacity-50 transition-colors font-medium"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" />
                <span>Run Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !saveLocation}
            className="w-full flex items-center justify-center space-x-2 bg-vscode-blue text-white px-4 py-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Submit & Save</span>
              </>
            )}
          </button>
        </div>

        {/* Input Section */}
        <div className="p-4 border-b border-vscode-line">
          <label className="block text-sm font-medium text-vscode-text mb-2">
            Custom Input:
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter input for your program..."
            className="w-full h-24 bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text text-sm focus:outline-none focus:border-vscode-blue resize-none font-mono"
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
                  <pre className="text-sm text-vscode-text whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                    {executionResult.output || '(no output)'}
                  </pre>
                  {executionResult.executionTime && (
                    <div className="mt-3 pt-3 border-t border-vscode-line text-xs text-vscode-comment flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-vscode-green" />
                      <span>Execution time: {executionResult.executionTime}ms</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-vscode-red/10 border border-vscode-red rounded p-4">
                  <pre className="text-sm text-vscode-red whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                    {executionResult.error || 'Unknown error occurred'}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-vscode-editor border border-vscode-line rounded p-4 text-sm text-vscode-comment text-center">
              <div className="mb-2">💻</div>
              <div>Click "Run Code" to execute your program</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
