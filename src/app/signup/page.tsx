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
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'student', // All signups are candidates/aspirants
        }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        throw new Error(`Server response error (${res.status}): ${resText.slice(0, 120) || res.statusText || 'Empty response'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Account creation failed. Please try again.');
      }

      // Overwrite active exam to CAT 2026 and direct candidate to dashboard home page
      localStorage.setItem('nalanda_active_exam', 'CAT 2026');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            Create Candidate Account
          </h1>
          <p className="text-xs text-[#787774] max-w-sm mx-auto leading-relaxed">
            Begin your focused CAT preparation. Track syllabus mastery, solve timed sectional mocks, and isolate your mistake patterns.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-[#C53030] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">
              Candidate Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs min-h-[44px] sm:min-h-[36px] rounded-[6px] border border-[#E6E6E3] focus:outline-none focus:border-[#4F46A5] bg-[#fcfbf9] focus:bg-white text-[#202124] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">
              Email Address
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
            <label className="block text-xs font-medium text-[#202124] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs min-h-[44px] sm:min-h-[36px] rounded-[6px] border border-[#E6E6E3] focus:outline-none focus:border-[#4F46A5] bg-[#fcfbf9] focus:bg-white text-[#202124] transition-colors"
              />
            </div>
          </div>

          {/* Exam Focus Pill */}
          <div className="p-3 bg-[#EEF0FB]/60 border border-[#DCDDF7] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#4F46A5]" />
              <span className="text-xs font-semibold text-[#202124]">Target Examination</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#4F46A5] bg-white px-2 py-0.5 rounded border border-[#DCDDF7]">
              CAT 2026 (IIMs)
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full min-h-[44px] text-sm font-semibold rounded-[6px] shadow-xs active:scale-[0.99] transition-transform"
            disabled={loading}
          >
            {loading ? 'Setting up Your Engine...' : 'Start My CAT Preparation'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="text-center text-xs text-[#787774] pt-3 border-t border-[#E6E6E3]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4F46A5] font-semibold hover:underline">
            Sign In to Preparation Engine
          </Link>
        </div>
      </div>
    </div>
  );
}
