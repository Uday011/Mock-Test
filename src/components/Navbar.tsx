'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Sparkles,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Target,
  Library,
  FileCheck,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institute_name?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});

    const savedKey = localStorage.getItem('mocktest_gemini_api_key');
    if (savedKey) setGeminiKey(savedKey);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const handleSwitchRole = async (targetRole: UserRole) => {
    try {
      const res = await fetch(`/api/auth/demo?role=${targetRole}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (targetRole === 'superadmin') {
          router.push('/dashboard/superadmin');
        } else if (targetRole === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  const handleSaveKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('mocktest_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('mocktest_gemini_api_key');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isWorkspace =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/mistakes') ||
    pathname.startsWith('/performance') ||
    pathname.startsWith('/question-bank') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/tests') ||
    pathname.startsWith('/exams') ||
    pathname.startsWith('/series') ||
    pathname.startsWith('/creators') ||
    pathname.startsWith('/exam');

  if (isWorkspace) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-lg border-b border-transparent select-none">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-control bg-accent text-white flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white">
                <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="5" r="2" fill="#C5A05A" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-[0.12em] text-ink uppercase">
              ExamCraft
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '/dashboard', label: 'Home' },
              { href: '/learn', label: 'Learn' },
              { href: '/question-bank', label: 'Practice' },
              { href: '/tests', label: 'Tests' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-muted hover:text-ink transition-colors font-normal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-ink-muted hover:text-coral transition-colors px-1 py-0.5"
                    title="Sign Out"
                  >
                    Sign out
                  </button>
                </div>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-surface transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm text-ink-muted hover:text-ink transition-colors font-normal"
                >
                  Sign in
                </Link>
                <button
                  onClick={() => handleSwitchRole('student')}
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all duration-200 shadow-xs"
                >
                  Try Aspirant Demo
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink hover:bg-secondary rounded-btn transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col bg-black/30 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="h-16 px-4 flex items-center justify-between bg-surface border-b border-line shrink-0">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-control bg-accent text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                  <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="19" cy="5" r="2" fill="#C5A05A" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-[0.1em] text-ink uppercase">ExamCraft</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-ink-muted hover:text-ink hover:bg-secondary rounded-btn transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 bg-surface p-5 space-y-2 overflow-y-auto pb-safe">
            {user && (
              <div className="flex items-center justify-between p-3.5 rounded-card bg-canvas border border-line mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{user.name}</div>
                    <div className="text-[11px] text-ink-muted">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="p-1.5 text-ink-muted hover:text-coral rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {[
              { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
              { href: '/learn', label: 'Learn', icon: BookOpen },
              { href: '/question-bank', label: 'Practice', icon: Target },
              { href: '/tests', label: 'Tests', icon: FileCheck },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-card text-sm font-medium text-ink hover:bg-secondary transition-colors"
              >
                <link.icon className="w-4 h-4 text-ink-muted" />
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSwitchRole('student'); }}
                  className="py-2.5 rounded-btn bg-secondary text-ink text-sm font-medium text-center"
                >
                  Try Demo
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-btn bg-accent text-white text-sm font-medium text-center flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-hero max-w-md w-full p-6 shadow-2xl border border-line">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-control bg-accent/10 text-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-ink">Gemini AI Coach</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-ink-muted hover:text-ink text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-green/10 border border-green/25 rounded-control mb-4 text-xs text-green">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Server Key Active (gemini-3.6-flash)
              </div>
              AI Exam Analysis, Weak Spot Detection, and Strategic Recommendations are running automatically.
            </div>

            <p className="text-xs text-ink-muted mb-4 leading-relaxed">
              Override with a personal Gemini API Key for client-side extraction:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="AQ.Ab8RN6... or AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-control text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-mono transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-green font-medium">
                  {isSaved ? 'Saved' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3.5 py-1.5 text-xs text-ink-muted hover:bg-secondary rounded-btn font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-btn text-xs font-medium transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
