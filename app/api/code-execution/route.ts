import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, input = '' }: ExecutionRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code and language are required' 
      }, { status: 400 });
    }

    const result = await executeCode(code, language, input);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function executeCode(code: string, language: string, input: string) {
  const tempDir = mkdtempSync(join(tmpdir(), 'codezenkai-'));
  const startTime = Date.now();

  try {
    let fileName: string;
    let compileCommands: string[];
    let executeCommands: string[];

    switch (language) {
      case 'cpp':
        fileName = join(tempDir, 'solution.cpp');
        writeFileSync(fileName, code);
        compileCommands = ['g++', '-o', join(tempDir, 'solution'), fileName, '-std=c++17'];
        executeCommands = [join(tempDir, 'solution')];
        break;

      case 'python':
        fileName = join(tempDir, 'solution.py');
        writeFileSync(fileName, code);
        compileCommands = [];
        executeCommands = ['python3', fileName];
        break;

      case 'java':
        fileName = join(tempDir, 'Solution.java');
        writeFileSync(fileName, code);
        compileCommands = ['javac', fileName];
        executeCommands = ['java', '-cp', tempDir, 'Solution'];
        break;

      default:
        return {
          success: false,
          error: 'Unsupported language'
        };
    }

    // Compile if needed
    if (compileCommands.length > 0) {
      const compileResult = await executeCommand(compileCommands, '', 10000);
      if (!compileResult.success) {
        return {
          success: false,
          error: `Compilation Error:\n${compileResult.stderr}`
        };
      }
    }

    // Execute
    const executeResult = await executeCommand(executeCommands, input, 5000);
    const executionTime = Date.now() - startTime;

    if (executeResult.success) {
      return {
        success: true,
        output: executeResult.stdout,
        executionTime
      };
    } else {
      return {
        success: false,
        error: `Runtime Error:\n${executeResult.stderr}`,
        executionTime
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Execution failed: ${error}`
    };
  } finally {
    // Cleanup temp files
    try {
      const filesToClean = [
        join(tempDir, 'solution.cpp'),
        join(tempDir, 'solution.py'),
        join(tempDir, 'Solution.java'),
        join(tempDir, 'Solution.class'),
        join(tempDir, 'solution')
      ];
      
      filesToClean.forEach(file => {
        try {
          unlinkSync(file);
        } catch (e) {
          // Ignore individual file cleanup errors
        }
      });
      
      // Try to remove the temp directory
      try {
        const fs = require('fs');
        fs.rmdirSync(tempDir);
      } catch (e) {
        // Ignore directory cleanup errors
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

function executeCommand(commands: string[], input: string, timeout: number): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const process = spawn(commands[0], commands.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Send input to the process
    if (input) {
      process.stdin?.write(input);
    }
    process.stdin?.end();

    // Set timeout
    const timer = setTimeout(() => {
      process.kill('SIGKILL');
      resolve({
        success: false,
        stdout,
        stderr: stderr + '\nExecution timed out'
      });
    }, timeout);

    process.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        stdout,
        stderr
      });
    });

    process.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: error.message
      });
    });
  });
}
