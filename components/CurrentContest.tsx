import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Contest } from '@/app/page';

interface Props {
  contest: Contest;
}

export default function CurrentContest({ contest }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6">
        <h2 className="text-2xl font-bold text-vscode-green mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-2" />
          Live Contest
        </h2>
        <div className="bg-vscode-editor border border-vscode-line rounded p-4">
          <h3 className="text-xl font-semibold text-vscode-text mb-2">{contest.title}</h3>
          <p className="text-vscode-comment mb-4">
            Ends at: {new Date(contest.end_time).toLocaleString()}
          </p>
          <Link href={`/contest/${contest.id}`} className="bg-vscode-green text-black px-6 py-2 rounded hover:bg-green-400 transition-colors font-semibold">
            Join Contest
          </Link>
        </div>
      </div>
    </section>
  );
}
