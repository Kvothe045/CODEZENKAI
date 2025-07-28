import { NextRequest, NextResponse } from 'next/server';

interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

interface Judge0Response {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: number;
}

// Judge0 Language IDs
const LANGUAGE_IDS = {
  cpp: 54,      // C++ (GCC 9.2.0)
  python: 71,   // Python 3.8.1
  java: 62,     // Java (OpenJDK 13.0.1)
  c: 50,        // C (GCC 9.2.0)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  go: 60,       // Go (1.13.5)
  rust: 73,     // Rust (1.40.0)
} as const;

// Status codes from Judge0
const STATUS_CODES = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error'
} as const;

// Judge0 API configuration
const JUDGE0_CONFIG = {
  // Using the free public API - you can replace with your own Judge0 instance
  baseUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  apiKey: process.env.JUDGE0_API_KEY || '', // Get from RapidAPI
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  }
};

class CodeExecutionService {
  private async submitCode(code: string, languageId: number, input: string = ''): Promise<string> {
    const submission = {
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: input ? Buffer.from(input).toString('base64') : undefined,
      cpu_time_limit: 5, // 5 seconds
      memory_limit: 128000, // 128 MB
    };

    const response = await fetch(`${JUDGE0_CONFIG.baseUrl}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: JUDGE0_CONFIG.headers,
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.token;
  }

  private async getResult(token: string): Promise<Judge0Response> {
    const response = await fetch(`${JUDGE0_CONFIG.baseUrl}/submissions/${token}?base64_encoded=true`, {
      method: 'GET',
      headers: JUDGE0_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async executeCode(code: string, language: string, input: string = '') {
    try {
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Submit code for execution
      const token = await this.submitCode(code, languageId, input);
      
      // Get result (Judge0 with wait=true should return immediately when done)
      const result = await this.getResult(token);

      return this.formatResult(result);
    } catch (error) {
      return {
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0
      };
    }
  }

  private formatResult(result: Judge0Response) {
    const { status, stdout, stderr, compile_output, time } = result;
    
    // Decode base64 outputs
    const output = stdout ? Buffer.from(stdout, 'base64').toString() : '';
    const errorOutput = stderr ? Buffer.from(stderr, 'base64').toString() : '';
    const compileError = compile_output ? Buffer.from(compile_output, 'base64').toString() : '';

    // Check if compilation failed
    if (status.id === 6) {
      return {
        success: false,
        error: `Compilation Error:\n${compileError}`,
        executionTime: 0
      };
    }

    // Check for runtime errors
    if (status.id >= 7 && status.id <= 12) {
      return {
        success: false,
        error: `Runtime Error (${STATUS_CODES[status.id as keyof typeof STATUS_CODES]}):\n${errorOutput}`,
        executionTime: parseFloat(time || '0') * 1000 // Convert to milliseconds
      };
    }

    // Check for other errors
    if (status.id === 5) {
      return {
        success: false,
        error: 'Time Limit Exceeded (5 seconds)',
        executionTime: 5000
      };
    }

    if (status.id === 13 || status.id === 14) {
      return {
        success: false,
        error: `System Error: ${STATUS_CODES[status.id as keyof typeof STATUS_CODES]}`,
        executionTime: 0
      };
    }

    // Success case
    return {
      success: true,
      output: output || '(no output)',
      executionTime: Math.round(parseFloat(time || '0') * 1000) // Convert to milliseconds
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, input = '' }: ExecutionRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const executionService = new CodeExecutionService();
    const result = await executionService.executeCode(code, language, input);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during code execution'
      },
      { status: 500 }
    );
  }
}
