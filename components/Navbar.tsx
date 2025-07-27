'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, User, Trophy, Users } from 'lucide-react';

interface NavbarProps {
  user?: any; // Add user prop type
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [user, setUser] = useState<any>(propUser || null);

  useEffect(() => {
    // Only check localStorage if no user prop is passed
    if (!propUser) {
      const data = localStorage.getItem('user');
      if (data) setUser(JSON.parse(data));
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <nav className="bg-vscode-sidebar border-b border-vscode-line px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-vscode-blue font-bold text-xl">
          CodeZenKai
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link href="/contests" className="text-vscode-text hover:text-vscode-blue transition-colors flex items-center space-x-1">
            <Trophy className="h-4 w-4" />
            <span>Contests</span>
          </Link>
          <Link href="/rankings" className="text-vscode-text hover:text-vscode-blue transition-colors flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Rankings</span>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link 
                href="/profile" 
                className="text-vscode-text hover:text-vscode-blue transition-colors flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-vscode-red text-white px-3 py-1 rounded hover:bg-red-600 transition-colors flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-vscode-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
