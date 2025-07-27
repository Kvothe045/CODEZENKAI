import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { Contest } from '@/app/page';

interface Props {
  contests: Contest[];
}

export default function UpcomingContests({ contests }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-vscode-text mb-6 flex items-center">
        <Clock className="h-6 w-6 mr-2 text-vscode-yellow" />
        Upcoming Contests
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {contests.map(contest => (
          <div key={contest.id} className="bg-vscode-sidebar border border-vscode-line rounded-lg p-4">
            <h3 className="text-lg font-semibold text-vscode-text mb-2">{contest.title}</h3>
            <p className="text-vscode-comment text-sm mb-3">
              Starts: {new Date(contest.start_time).toLocaleString()}
            </p>
            <p className="text-vscode-comment text-sm mb-4">
              Duration: {contest.duration} minutes
            </p>
            <Link href={`/contest/${contest.id}`} className="text-vscode-blue hover:text-blue-400 transition-colors font-semibold">
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
