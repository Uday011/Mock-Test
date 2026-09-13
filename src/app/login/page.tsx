'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Building2,
  Crown,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

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

      const data = await res.json();
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
      const data = await res.json();
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to ExamCraft</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your role or sign in with your email credentials
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Personas */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            1-Click Instant Persona Sign-In
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 text-left transition-all group flex flex-col items-center text-center"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center mb-1">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Student</span>
              <span className="text-[9px] text-emerald-700 mt-0.5">Take & AI Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-left transition-all group flex flex-col items-center text-center"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center mb-1">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[9px] text-amber-700 mt-0.5">Manage Students</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('superadmin')}
              disabled={Boolean(demoRoleLoading)}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 text-left transition-all group flex flex-col items-center text-center"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center mb-1">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Super Admin</span>
              <span className="text-[9px] text-purple-700 mt-0.5">Master Control</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or login with credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@examcraft.platform"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In with Email'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Pre-Configured Platform Accounts:</p>
          <div className="font-mono text-[10px] space-y-0.5">
            <div>👑 Superadmin: <span className="text-slate-800">superadmin@examcraft.platform / superadmin123</span></div>
            <div>🏫 Admin: <span className="text-slate-800">admin@examcraft.platform / admin1234</span></div>
            <div>🎓 Student: <span className="text-slate-800">candidate@mocktest.platform / student123</span></div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
