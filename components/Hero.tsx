import Link from 'next/link';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-5xl font-bold text-vscode-text mb-6">
        Welcome to <span className="text-vscode-blue">CodeZenKai</span>
      </h1>
      <p className="text-xl text-vscode-comment mb-8 max-w-3xl mx-auto">
        The ultimate proctored competitive programming platform for friends, classmates, and small groups. 
        Compete fairly with anti-cheat monitoring and Codeforces integration.
      </p>
      <div className="flex justify-center space-x-4">
        <Link href="/login" className="bg-vscode-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
          Get Started
        </Link>
        <Link href="/contests" className="border border-vscode-line text-vscode-text px-8 py-3 rounded-lg hover:bg-vscode-sidebar transition-colors font-semibold">
          View Contests
        </Link>
      </div>
    </section>
  );
}
