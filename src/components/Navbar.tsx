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
    // Close mobile menu on route change
    setMobileMenuOpen(false);
    setShowRoleMenu(false);
    // Check current user session
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

    // Read stored Gemini key from localStorage
    const savedKey = localStorage.getItem('mocktest_gemini_api_key');
    if (savedKey) setGeminiKey(savedKey);

    // Close role dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

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

  // Hide Navbar during live exam to provide distraction-free environment
  if (pathname.startsWith('/exam/') && !pathname.includes('/result')) {
    return null;
  }

  const role = user?.role || 'student';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  ExamCraft{' '}
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
                    PRO
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-medium">MCQ Mock Test Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {role === 'superadmin' && (
                <Link
                  href="/dashboard/superadmin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    pathname === '/dashboard/superadmin'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  Super Admin
                </Link>
              )}

              {(role === 'admin' || role === 'superadmin') && (
                <Link
                  href="/dashboard/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    pathname === '/dashboard/admin'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  Institute Hub
                </Link>
              )}

              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === '/dashboard'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                {role === 'student' ? 'Dashboard' : 'Student View'}
              </Link>

              <Link
                href="/tests/create"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === '/tests/create'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                Create Test
              </Link>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona / Role Switcher Menu (Desktop) */}
            <div className="relative hidden sm:block" ref={roleMenuRef}>
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Switch between Student, Administrator, and Superadmin roles"
              >
                {role === 'superadmin' && (
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <Crown className="w-3.5 h-3.5 text-purple-600" />
                    <span>Super Admin</span>
                  </span>
                )}
                {role === 'admin' && (
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Administrator</span>
                  </span>
                )}
                {role === 'student' && (
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student</span>
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-left animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Persona
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Instant 1-click preview of role capabilities
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleSwitchRole('student')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        role === 'student' ? 'bg-emerald-50/80 border border-emerald-200/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Student (Candidate)</span>
                          {role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Take mock tests, view AI score breakdown & create practice exams.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSwitchRole('admin')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        role === 'admin' ? 'bg-amber-50/80 border border-amber-200/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Administrator (Teacher)</span>
                          {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Publish batch mocks, manage enrolled student accounts & review submissions.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSwitchRole('superadmin')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        role === 'superadmin' ? 'bg-slate-100 border border-slate-300' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Crown className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Super Administrator</span>
                          {role === 'superadmin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Absolute system control: modify admins, students, all tests & exam sections.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights / Key Status */}
            <button
              onClick={() => setShowSettings(true)}
              title="Gemini AI Performance Coach Status"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden lg:inline text-xs font-semibold">AI Coach</span>
            </button>

            {/* User Session Info or Login Links */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[130px]">{user.email}</span>
                </div>
                <div
                  className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border shadow-2xs bg-slate-900 text-white border-slate-800"
                  title={`${user.name} (${role})`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hidden sm:block"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleSwitchRole('student')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Try Demo
                </button>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-start animate-fade-in">
            <div className="bg-white border-b border-slate-200 p-4 shadow-2xl space-y-4 max-h-[85dvh] overflow-y-auto">
              {/* User Info on Mobile */}
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSwitchRole('student');
                    }}
                    className="py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center border border-slate-200"
                  >
                    Try Demo
                  </button>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold text-center shadow-xs"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* 1-Click Role Switcher on Mobile */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Persona (Tap to Switch)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSwitchRole('student')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                      role === 'student'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Student</span>
                  </button>

                  <button
                    onClick={() => handleSwitchRole('admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                      role === 'admin'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Admin</span>
                  </button>

                  <button
                    onClick={() => handleSwitchRole('superadmin')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                      role === 'superadmin'
                        ? 'border-slate-900 bg-slate-900 text-white font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-[11px] font-bold leading-tight">Super Admin</span>
                  </button>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    pathname === '/dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {role === 'student' ? 'Student Dashboard' : 'Student View'}
                </Link>

                <Link
                  href="/tests/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    pathname === '/tests/create' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Create New Test
                </Link>

                {(role === 'admin' || role === 'superadmin') && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      pathname === '/dashboard/admin' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Institute Admin Hub
                  </Link>
                )}

                {role === 'superadmin' && (
                  <Link
                    href="/dashboard/superadmin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      pathname === '/dashboard/superadmin' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    Master Superadmin Control
                  </Link>
                )}
              </div>

              {/* AI Status on Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSettings(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Gemini AI Coach & Parser Status</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Gemini AI Coach & Extraction</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-800">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Server Key Active (gemini-3.6-flash)
              </div>
              Your platform is equipped with an active Google Gemini API key configured on the server. AI Exam Analysis, Weak Spot Detection, and Strategic Recommendations run automatically!
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              If you wish to override with a personal custom Gemini API Key for client-side extraction, enter it below:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="AQ.Ab8RN6... or AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-600 font-medium">
                  {isSaved ? '✓ Key Saved' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
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
