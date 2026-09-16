'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fcfbf9]">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="md" href="/" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Reset Your Password
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Enter your registered email address and we will generate a secure recovery token to restore your academic profile.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-stone-900">
                Recovery Instructions Dispatched
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                A password reset token and verification link have been simulated for <strong>{email}</strong>. Check your inbox to choose a new password.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="saffron" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Registered Email
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

            <Button
              type="submit"
              variant="saffron"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Dispatching Token...' : 'Send Password Reset Link'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-stone-500 hover:text-stone-800 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
