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

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fbfbfa]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-md border border-[#ebebeb] shadow-xs">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-2">
            <Logo size="md" href="/" />
          </div>
          <h2 className="text-xl font-bold text-[#37352f]">
            Create an Account
          </h2>
          <p className="text-xs text-[#787774] max-w-sm mx-auto">
            Join Nalanda to track syllabus progression, practice CBT mock papers, and curate mistake forensics.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-[4px] bg-[#fdf3f2] border border-[#f5c6cb] text-[#eb5757] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#787774]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[#ebebeb] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] focus:bg-white text-[#37352f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#787774]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[#ebebeb] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] focus:bg-white text-[#37352f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#787774]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[#ebebeb] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] focus:bg-white text-[#37352f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Primary Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-1.5 px-2.5 text-xs font-medium rounded-[4px] border transition-colors flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'border-[#37352f] bg-[#f7f6f3] text-[#37352f]'
                    : 'border-[#ebebeb] text-[#787774] hover:bg-[#fcfbf9]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Aspirant / Student
              </button>

              <button
                type="button"
                onClick={() => setRole('educator')}
                className={`py-1.5 px-2.5 text-xs font-medium rounded-[4px] border transition-colors flex items-center justify-center gap-1.5 ${
                  role === 'educator'
                    ? 'border-[#37352f] bg-[#f7f6f3] text-[#37352f]'
                    : 'border-[#ebebeb] text-[#787774] hover:bg-[#fcfbf9]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Educator / Faculty
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-[#787774] pt-2 border-t border-[#ebebeb]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#37352f] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
