'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Building2,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'educator'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            Create an Account
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Join Nalanda to track syllabus progression, practice CBT mock papers, and curate mistake forensics.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Primary Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Aspirant / Student
              </button>

              <button
                type="button"
                onClick={() => setRole('educator')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'educator'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Educator / Faculty
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="saffron"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-800 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
