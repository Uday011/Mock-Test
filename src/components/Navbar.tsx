'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  Sparkles,
  LogOut,
  User,
  Key,
  ShieldCheck,
  GraduationCap,
  Building2,
  ChevronDown,
  Crown,
  CheckCircle2,
  Menu,
  X,
  Target,
  Library,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

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
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowRoleMenu(false);
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

    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowRoleMenu(false);
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
    setShowRoleMenu(false);
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

  // AppShell provides the navigation bar on internal workspace routes
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

  const role = user?.role || 'student';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-transparent select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left — Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-md bg-[#4F46A5] text-white flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-white"
              >
                <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="5" r="2" fill="#B7791F" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-[0.12em] text-[#202124] uppercase">
              Nalanda
            </span>
          </Link>

          {/* Center — Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/learn', label: 'Learn' },
              { href: '/tests', label: 'Tests' },
              { href: '/library', label: 'Library' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#787774] hover:text-[#202124] transition-colors font-normal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5" ref={roleMenuRef}>
                  <div className="relative">
                    <button
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      className="flex items-center gap-1.5 text-sm text-[#787774] hover:text-[#202124] transition-colors font-normal"
                    >
                      <span>{user.name}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {showRoleMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg border border-[#E6E6E3] shadow-xl shadow-black/[0.06] py-1.5 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
                          Switch Role
                        </div>
                        {[
                          { role: 'student' as UserRole, label: 'Student', icon: GraduationCap },
                          { role: 'admin' as UserRole, label: 'Administrator', icon: Building2 },
                          { role: 'superadmin' as UserRole, label: 'Super Admin', icon: Crown },
                        ].map((r) => (
                          <button
                            key={r.role}
                            onClick={() => handleSwitchRole(r.role)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#202124] hover:bg-[#F7F7F5] transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <r.icon className="w-3.5 h-3.5 text-[#787774]" />
                              {r.label}
                            </span>
                            {user?.role === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46A5]" />}
                          </button>
                        ))}
                        <div className="border-t border-[#E6E6E3] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#C53030] hover:bg-[#FEF2F2] transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-[#202124] text-[#202124] text-sm font-medium hover:bg-[#202124] hover:text-white transition-all duration-200"
                >
                  Open workspace
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSwitchRole('student')}
                  className="hidden sm:inline-flex text-sm text-[#787774] hover:text-[#202124] transition-colors font-normal"
                >
                  Sign in
                </button>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-[#202124] text-[#202124] text-sm font-medium hover:bg-[#202124] hover:text-white transition-all duration-200"
                >
                  Get demo
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#202124] hover:bg-[#F1F1EF] rounded-lg transition-colors"
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

          <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-[#E6E6E3] shrink-0">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#4F46A5] text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                  <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="19" cy="5" r="2" fill="#B7791F" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-[0.1em] text-[#202124] uppercase">Nalanda</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 bg-white p-5 space-y-2 overflow-y-auto pb-safe">
            {/* User info */}
            {user && (
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E6E6E3] mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4F46A5] text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#202124]">{user.name}</div>
                    <div className="text-[11px] text-[#787774]">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="p-1.5 text-[#787774] hover:text-[#C53030] rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Nav links */}
            {[
              { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { href: '/learn', label: 'Learn', icon: BookOpen },
              { href: '/tests', label: 'Tests', icon: Target },
              { href: '/library', label: 'Library', icon: Library },
              { href: '/tests/create', label: 'Test Studio', icon: PlusCircle },
              { href: '/dashboard/educator', label: 'Educator Hub', icon: GraduationCap },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-[#202124] hover:bg-[#F1F1EF] transition-colors"
              >
                <link.icon className="w-4 h-4 text-[#787774]" />
                {link.label}
              </Link>
            ))}

            {/* Role switcher */}
            <div className="pt-3 border-t border-[#E6E6E3]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#787774] mb-2 px-1">Switch Role</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'student' as UserRole, label: 'Student', icon: GraduationCap },
                  { role: 'admin' as UserRole, label: 'Admin', icon: Building2 },
                  { role: 'superadmin' as UserRole, label: 'Super', icon: Crown },
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={() => { setMobileMenuOpen(false); handleSwitchRole(r.role); }}
                    className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      role === r.role
                        ? 'border-[#4F46A5] bg-[#EEF0FB] text-[#4F46A5] font-semibold'
                        : 'border-[#E6E6E3] text-[#787774] hover:bg-[#F7F7F5]'
                    }`}
                  >
                    <r.icon className="w-4 h-4" />
                    <span className="text-[11px]">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth */}
            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E6E6E3]">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSwitchRole('student'); }}
                  className="py-2.5 rounded-lg bg-[#F1F1EF] text-[#202124] text-sm font-medium text-center"
                >
                  Try Demo
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-lg bg-[#202124] text-white text-sm font-medium text-center flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E6E6E3]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF0FB] text-[#4F46A5] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-[#202124]">Gemini AI Coach</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#787774] hover:text-[#202124] text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-[#EDF7ED] border border-[#C8E6C9] rounded-lg mb-4 text-xs text-[#1B5E20]">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                Server Key Active (gemini-3.6-flash)
              </div>
              AI Exam Analysis, Weak Spot Detection, and Strategic Recommendations are running automatically.
            </div>

            <p className="text-xs text-[#787774] mb-4 leading-relaxed">
              Override with a personal Gemini API Key for client-side extraction:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="AQ.Ab8RN6... or AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E6E3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46A5]/30 focus:border-[#4F46A5] font-mono transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#1B5E20] font-medium">
                  {isSaved ? '✓ Key Saved' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3.5 py-1.5 text-xs text-[#787774] hover:bg-[#F1F1EF] rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-1.5 bg-[#4F46A5] hover:bg-[#433B91] text-white rounded-lg text-xs font-medium transition-colors"
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
