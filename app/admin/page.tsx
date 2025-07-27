// codezenkai/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing supabase session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        router.push('/admin/dashboard');
      }
    });

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) router.push('/admin/dashboard');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Successful login, redirection handled above by useEffect on session change
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-vscode-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-vscode-sidebar rounded-lg border border-vscode-line">
        <h2 className="text-3xl font-bold text-vscode-text mb-6 text-center">Admin Login</h2>

        {error && (
          <div className="bg-vscode-red/20 border border-vscode-red text-vscode-red p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 rounded bg-vscode-editor border border-vscode-line text-vscode-text focus:outline-none focus:border-vscode-blue"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 rounded bg-vscode-editor border border-vscode-line text-vscode-text focus:outline-none focus:border-vscode-blue"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-vscode-blue text-white rounded hover:bg-blue-600 font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
