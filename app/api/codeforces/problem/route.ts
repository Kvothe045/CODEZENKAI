import { NextRequest, NextResponse } from 'next/server';

interface CodeforcesProblem {
  contestId: string;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  url: string;
  statement: string;
  inputSpec: string;
  outputSpec: string;
  sampleTests: Array<{
    input: string;
    output: string;
  }>;
  timeLimit: string;
  memoryLimit: string;
}

// Use Codeforces API instead of scraping
async function fetchProblemFromAPI(contestId: string, problemIndex: string): Promise<any> {
  try {
    // First try to get problem info from contest.standings API
    const standingsResponse = await fetch(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1&showUnofficial=false`,
      {
        headers: {
          'User-Agent': 'CodeZenKai Contest Platform',
        }
      }
    );

    if (standingsResponse.ok) {
      const standingsData = await standingsResponse.json();
      if (standingsData.status === 'OK') {
        const problem = standingsData.result?.problems?.find((p: any) => p.index === problemIndex);
        if (problem) {
          return problem;
        }
      }
    }

    // Fallback: try problemset.problems API
    const problemsetResponse = await fetch(
      `https://codeforces.com/api/problemset.problems`,
      {
        headers: {
          'User-Agent': 'CodeZenKai Contest Platform',
        }
      }
    );

    if (problemsetResponse.ok) {
      const problemsetData = await problemsetResponse.json();
      if (problemsetData.status === 'OK') {
        const problem = problemsetData.result?.problems?.find(
          (p: any) => p.contestId.toString() === contestId && p.index === problemIndex
        );
        if (problem) {
          return problem;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Codeforces API:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const problemUrl = searchParams.get('url');

  if (!problemUrl) {
    return NextResponse.json({ error: 'Problem URL is required' }, { status: 400 });
  }

  try {
    // Parse both contest and problemset URLs
    let contestId: string;
    let problemIndex: string;

    if (problemUrl.includes('/contest/')) {
      const contestMatch = problemUrl.match(/\/contest\/(\d+)\/problem\/([A-Z])/);
      if (!contestMatch) {
        return NextResponse.json({ error: 'Invalid contest URL format' }, { status: 400 });
      }
      contestId = contestMatch[1];
      problemIndex = contestMatch[2];
    } else if (problemUrl.includes('/problemset/problem/')) {
      const problemsetMatch = problemUrl.match(/\/problemset\/problem\/(\d+)\/([A-Z])/);
      if (!problemsetMatch) {
        return NextResponse.json({ error: 'Invalid problemset URL format' }, { status: 400 });
      }
      contestId = problemsetMatch[1];
      problemIndex = problemsetMatch[2];
    } else {
      return NextResponse.json({ error: 'Unsupported URL format' }, { status: 400 });
    }

    console.log(`Fetching problem via API: ${contestId}${problemIndex}`);

    // Try to fetch from Codeforces API
    const apiProblem = await fetchProblemFromAPI(contestId, problemIndex);

    if (apiProblem) {
      const problemData: CodeforcesProblem = {
        contestId,
        index: problemIndex,
        name: apiProblem.name || `Problem ${problemIndex}`,
        rating: apiProblem.rating,
        tags: apiProblem.tags || [],
        url: problemUrl,
        statement: `Problem: ${apiProblem.name}\n\nThis problem is from Codeforces Contest ${contestId}.\n\nTo view the complete problem statement, input/output specifications, and sample test cases, please click "View on Codeforces" below.`,
        inputSpec: 'Please view the complete problem on Codeforces for input specifications.',
        outputSpec: 'Please view the complete problem on Codeforces for output specifications.',
        sampleTests: [],
        timeLimit: 'See Codeforces',
        memoryLimit: 'See Codeforces'
      };

      return NextResponse.json(problemData);
    }

    // Fallback response when API fails
    const fallbackProblem: CodeforcesProblem = {
      contestId,
      index: problemIndex,
      name: `Problem ${problemIndex}`,
      url: problemUrl,
      tags: [],
      statement: `This is Problem ${problemIndex} from Contest ${contestId}.\n\nDue to Codeforces access restrictions, the full problem statement cannot be displayed here.\n\nPlease click "View on Codeforces" to see the complete problem details.`,
      inputSpec: 'Available on Codeforces',
      outputSpec: 'Available on Codeforces',
      sampleTests: [],
      timeLimit: 'See Codeforces',
      memoryLimit: 'See Codeforces'
    };

    return NextResponse.json(fallbackProblem);

  } catch (error) {
    console.error('Error in problem API:', error);
    
    // Always return a usable response
    const fallbackMatch = problemUrl.match(/\/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Z])/);
    if (fallbackMatch) {
      const [, contestId, problemIndex] = fallbackMatch;
      return NextResponse.json({
        contestId,
        index: problemIndex,
        name: `Problem ${problemIndex}`,
        url: problemUrl,
        tags: [],
        statement: `Problem ${problemIndex} from Contest ${contestId}\n\nClick "View on Codeforces" to see the complete problem.`,
        inputSpec: 'See Codeforces',
        outputSpec: 'See Codeforces',
        sampleTests: [],
        timeLimit: 'Unknown',
        memoryLimit: 'Unknown'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch problem details',
    }, { status: 500 });
  }
}
