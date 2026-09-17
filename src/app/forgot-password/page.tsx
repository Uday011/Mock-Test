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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fbfbfa]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-md border border-[#ebebeb] shadow-xs">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-2">
            <Logo size="md" href="/" />
          </div>
          <h2 className="text-xl font-bold text-[#37352f]">
            Reset Your Password
          </h2>
          <p className="text-xs text-[#787774] max-w-sm mx-auto">
            Enter your registered email address and we will generate a secure recovery token to restore your academic profile.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-[4px] bg-[#fdf3f2] border border-[#f5c6cb] text-[#eb5757] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-10 h-10 rounded-[4px] bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#37352f]">
                Recovery Instructions Dispatched
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed max-w-xs mx-auto">
                A password reset token and verification link have been simulated for <strong>{email}</strong>. Check your inbox to choose a new password.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#37352f] mb-1">
                Registered Email
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Dispatching Token...' : 'Send Password Reset Link'}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-[#787774] hover:text-[#37352f] font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
