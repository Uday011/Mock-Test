'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Building2,
  Crown,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<UserRole | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get('redirect');
      if (redir && redir.startsWith('/')) {
        setRedirectUrl(redir);
      }
    }
  }, []);

  const navigateAfterAuth = (userRole?: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (userRole === 'superadmin') {
      router.push('/dashboard/superadmin');
    } else if (userRole === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      navigateAfterAuth(data.user?.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoRoleLoading(role);
    setError('');
    try {
      const res = await fetch(`/api/auth/demo?role=${role}`, { method: 'POST' });
      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      navigateAfterAuth(role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F7F7F5]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-md border border-[#E6E6E3] shadow-xs">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-2">
            <Logo size="md" href="/" />
          </div>
          <h2 className="text-xl font-bold text-[#202124]">
            Sign in to Nalanda
          </h2>
          <p className="text-xs text-[#787774] max-w-sm mx-auto">
            Access your syllabus roadmap, computer-based mock diagnostics, and cognitive mistake forensics.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-[4px] bg-[#fdf3f2] border border-[#f5c6cb] text-[#eb5757] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Personas */}
        <div className="space-y-2 pt-1">
          <p className="text-[10px] uppercase font-semibold text-[#787774] text-center tracking-wider">
            1-Click Instant Persona Sign-In
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2 rounded-[4px] border border-[#E6E6E3] bg-[#fcfbf9] hover:bg-[#F1F1EF] text-[#202124] transition-colors flex flex-col items-center text-center"
            >
              <div className="w-6 h-6 rounded-[3px] bg-[#edf6f9] text-[#1e6074] flex items-center justify-center mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium leading-tight">Aspirant</span>
              <span className="text-[9px] text-[#787774] mt-0.5">SSC CGL</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2 rounded-[4px] border border-[#E6E6E3] bg-[#fcfbf9] hover:bg-[#F1F1EF] text-[#202124] transition-colors flex flex-col items-center text-center"
            >
              <div className="w-6 h-6 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] flex items-center justify-center mb-1">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium leading-tight">Educator</span>
              <span className="text-[9px] text-[#787774] mt-0.5">Test Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('superadmin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2 rounded-[4px] border border-[#E6E6E3] bg-[#fcfbf9] hover:bg-[#F1F1EF] text-[#202124] transition-colors flex flex-col items-center text-center"
            >
              <div className="w-6 h-6 rounded-[3px] bg-[#F1F1EF] text-[#202124] flex items-center justify-center mb-1 border border-[#E6E6E3]">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium leading-tight">Superadmin</span>
              <span className="text-[9px] text-[#787774] mt-0.5">Master Gov</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E6E6E3] w-full" />
          <span className="bg-white px-2.5 text-[10px] uppercase font-medium text-[#787774] absolute">
            Or Credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1">
              Email Address
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#787774]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[#E6E6E3] focus:outline-none focus:border-[#202124] bg-[#fcfbf9] focus:bg-white text-[#202124]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#202124]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#787774] hover:text-[#202124] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#787774]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[#E6E6E3] focus:outline-none focus:border-[#202124] bg-[#fcfbf9] focus:bg-white text-[#202124]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-[#787774] pt-2 border-t border-[#E6E6E3]">
          New to Nalanda?{' '}
          <Link href="/signup" className="text-[#202124] font-medium hover:underline">
            Create an Aspirant Account
          </Link>
        </div>
      </div>
    </div>
  );
}
