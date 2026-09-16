'use client';

import React, { useState } from 'react';
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
  Compass,
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

      if (data.user?.role === 'superadmin') {
        router.push('/dashboard/superadmin');
      } else if (data.user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
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

      if (role === 'superadmin') {
        router.push('/dashboard/superadmin');
      } else if (role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fcfbf9]">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="md" href="/" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Sign in to Nalanda
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Access your syllabus roadmap, computer-based mock diagnostics, and cognitive mistake forensics.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Personas */}
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center font-mono">
            1-Click Instant Persona Sign-In
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all flex flex-col items-center text-center min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Aspirant</span>
              <span className="text-[9px] text-stone-500 mt-0.5">SSC CGL 2026</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all flex flex-col items-center text-center min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-1">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Educator</span>
              <span className="text-[9px] text-stone-500 mt-0.5">Test Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('superadmin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 transition-all flex flex-col items-center text-center min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center mb-1">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Superadmin</span>
              <span className="text-[9px] text-stone-500 mt-0.5">Master Gov</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase font-mono text-stone-400 absolute">
            Or Account Credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="saffron"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          New to Nalanda?{' '}
          <Link href="/signup" className="text-amber-800 font-semibold hover:underline">
            Create an Aspirant Account
          </Link>
        </div>
      </div>
    </div>
  );
}
