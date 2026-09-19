'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const navigateToDashboard = () => {
    localStorage.setItem('nalanda_active_exam', 'CAT 2026');
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Please check your email and password.');
      }

      navigateToDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAspirantLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/demo?role=student', { method: 'POST' });
      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      navigateToDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F7F7F5]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-xl border border-[#E6E6E3] shadow-xs">
        
        {/* Engine Header & Identity */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="md" href="/" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            CAT Preparation Engine
          </h1>
          <p className="text-xs text-[#787774] max-w-sm mx-auto leading-relaxed">
            Sign in to continue your syllabus progression, attempt timed CBT mock papers, and analyze mistake forensics.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-[#C53030] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Instant Aspirant Demo Entry */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleDemoAspirantLogin}
            disabled={loading || demoLoading}
            className="w-full py-2.5 px-3 min-h-[44px] rounded-lg border border-[#DCDDF7] bg-[#EEF0FB]/80 hover:bg-[#EEF0FB] text-[#4F46A5] text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-2xs"
          >
            {demoLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#4F46A5] border-t-transparent rounded-full animate-spin" />
                <span>Loading Preparation Demo...</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-[#4F46A5]" />
                <span>Try 1-Click Aspirant Demo (CAT 2026)</span>
                <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#E6E6E3] w-full" />
          <span className="bg-white px-2.5 text-[10px] uppercase font-semibold text-[#787774] tracking-wider absolute">
            Or sign in with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">
              Candidate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aspirant@example.com"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs min-h-[44px] sm:min-h-[36px] rounded-[6px] border border-[#E6E6E3] focus:outline-none focus:border-[#4F46A5] bg-[#fcfbf9] focus:bg-white text-[#202124] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#202124]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#787774] hover:text-[#4F46A5] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs min-h-[44px] sm:min-h-[36px] rounded-[6px] border border-[#E6E6E3] focus:outline-none focus:border-[#4F46A5] bg-[#fcfbf9] focus:bg-white text-[#202124] transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full min-h-[44px] text-sm font-semibold rounded-[6px] shadow-xs active:scale-[0.99] transition-transform"
            disabled={loading || demoLoading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Preparation Engine'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Switch to Signup */}
        <div className="text-center text-xs text-[#787774] pt-3 border-t border-[#E6E6E3]">
          New candidate?{' '}
          <Link href="/signup" className="text-[#4F46A5] font-semibold hover:underline">
            Create Candidate Account
          </Link>
        </div>
      </div>
    </div>
  );
}
