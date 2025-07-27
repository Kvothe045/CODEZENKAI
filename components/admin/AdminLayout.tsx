'use client';

import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AdminLayoutProps {
  children: React.ReactNode;
  adminName?: string;
}

export default function AdminLayout({ children, adminName }: AdminLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar user={{ name: adminName ?? 'Admin' }} />
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4 border-b border-vscode-line bg-vscode-sidebar">
        <h1 className="text-3xl font-bold text-vscode-text flex items-center">
          <Settings className="h-8 w-8 mr-3 text-vscode-blue" />
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex items-center space-x-2 bg-vscode-red hover:bg-red-600 text-white rounded px-4 py-2 font-semibold transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
