'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Clock, Upload } from 'lucide-react';

interface CodeEditorProps {
  onSubmit: (code: string, language: string) => void;
  contestId?: string;
  userId?: string;
  problemUrl?: string;
  onActivity?: (event: string, details: any) => void;
}

export default function CodeEditor({ onSubmit, contestId, userId, problemUrl, onActivity }: CodeEditorProps) {
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('cpp');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && contestId && userId) {
        onActivity?.('tab_switch', { timestamp: new Date().toISOString() });
      }
    };
    const handleFocusLoss = () => {
      if (contestId && userId) {
        onActivity?.('focus_lost', { timestamp: new Date().toISOString() });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLoss);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLoss);
    };
  }, [contestId, userId, onActivity]);

  const getProblemIdFromUrl = (url?: string): string => {
    if (!url) return "solution";
    try {
      const parts = url.split('/');
      const contestIndex = parts.indexOf('contest');
      if (contestIndex !== -1 && contestIndex + 2 < parts.length) {
        const contestId = parts[contestIndex + 1];
        const problemIndex = parts[contestIndex + 2];
        return `${contestId}${problemIndex}`;
      }
    } catch {
      // fallback
    }
    return "solution";
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    onSubmit(code, language);

    const problemId = getProblemIdFromUrl(problemUrl);
    const ext = language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'java';
    const fileName = `${problemId}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Source Code', accept: { 'text/plain': [`.${ext}`] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      // fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setTimeout(() => setIsRunning(false), 2000);
  };

  const languageOptions = [
    { value: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
    { value: 'python', label: 'Python', defaultCode: '# Write your Python code here\n' },
    { value: 'java', label: 'Java', defaultCode: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' }
  ];

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    const langConf = languageOptions.find(l => l.value === lang);
    if (langConf) setCode(langConf.defaultCode);
  };

  return (
    <div className="bg-vscode-editor border border-vscode-line rounded-lg overflow-hidden">
      <div className="bg-vscode-sidebar px-4 py-3 border-b border-vscode-line flex justify-between items-center">
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-vscode-bg text-vscode-text border border-vscode-line rounded px-3 py-1 focus:outline-none focus:border-vscode-blue"
        >
          {languageOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={isRunning}
          className="bg-vscode-blue text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2 transition-colors"
        >
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Submit & Download</span>
            </>
          )}
        </button>
      </div>
      <div className="h-96">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            contextmenu: false,
          }}
        />
      </div>
    </div>
  );
}
