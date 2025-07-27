'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    uid: '',
    codeforces_username: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Login request failed');
    }
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError('');

    try {
      const { name, email, password, uid, codeforces_username } = formData;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, uid, codeforces_username }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful! Please login with your credentials.');
        setIsRegister(false);
        setFormData({ ...formData, password: '', name: '', uid: '', codeforces_username: '' });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Registration request failed');
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch {
      setError('Reset request failed');
    }
    setLoading(false);
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-vscode-sidebar rounded-lg border border-vscode-line">
          <div className="text-center">
            <Mail className="h-12 w-12 text-vscode-blue mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-vscode-text mb-2">Reset Password</h2>
            <p className="text-vscode-comment">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="bg-vscode-red/20 border border-vscode-red text-vscode-red p-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-vscode-green/20 border border-vscode-green text-vscode-green p-3 rounded">
              {message}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vscode-blue text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-vscode-blue hover:text-blue-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vscode-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-vscode-sidebar rounded-lg border border-vscode-line">
        <h2 className="text-3xl font-bold text-vscode-text text-center mb-6">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="bg-vscode-red/20 border border-vscode-red text-vscode-red p-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-vscode-green/20 border border-vscode-green text-vscode-green p-3 rounded">
            {message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            isRegister ? handleRegister() : handleLogin();
          }}
          className="space-y-4"
        >
          {isRegister && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
              />
              <input
                type="text"
                name="codeforces_username"
                placeholder="Codeforces Username"
                value={formData.codeforces_username}
                onChange={handleChange}
                required
                className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
              />
              <input
                type="text"
                name="uid"
                placeholder="Student ID (Optional)"
                value={formData.uid}
                onChange={handleChange}
                className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
          />
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-vscode-editor border border-vscode-line rounded px-3 py-2 pr-10 text-vscode-text focus:outline-none focus:border-vscode-blue"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vscode-comment hover:text-vscode-text"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vscode-blue text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50 font-semibold"
          >
            {loading ? (isRegister ? 'Creating Account...' : 'Signing In...') : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-3 text-center text-vscode-comment">
          {!isRegister && (
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-vscode-blue hover:text-blue-400 transition-colors"
            >
              Forgot your password?
            </button>
          )}
          
          <div>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button className="text-vscode-blue hover:text-blue-400 transition-colors" onClick={() => setIsRegister(false)}>
                  Sign in here
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button className="text-vscode-blue hover:text-blue-400 transition-colors" onClick={() => setIsRegister(true)}>
                  Create one here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
