'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  FileCheck,
  BookMarked,
  TrendingUp,
  PenTool,
  Layers,
  Library,
  GraduationCap,
  Target,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  activeExamTitle?: string;
  actions?: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'saffron' | 'emerald' | 'navy' | 'stone' | 'rose';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppShell({
  children,
  breadcrumbs,
  activeExamTitle = 'SSC CGL 2026',
  actions,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(activeExamTitle);
  const examMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setExamDropdownOpen(false);
    setRoleDropdownOpen(false);
  }, [pathname]);

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    const savedExam = localStorage.getItem('nalanda_active_exam');
    if (savedExam) setSelectedExam(savedExam);

    const handleClickOutside = (e: MouseEvent) => {
      if (examMenuRef.current && !examMenuRef.current.contains(e.target as Node)) {
        setExamDropdownOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectExam = (exam: string) => {
    setSelectedExam(exam);
    localStorage.setItem('nalanda_active_exam', exam);
    setExamDropdownOpen(false);
  };

  const handleSwitchRole = async (targetRole: string) => {
    try {
      await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  const navGroups: NavGroup[] = [
    {
      title: 'LEARNER WORKSPACE',
      items: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Exam Workspace', href: '/exams/exam-ssc-cgl-2026', icon: Compass },
        { label: 'Learning Path', href: '/learn', icon: BookOpen },
      ],
    },
    {
      title: 'PRACTICE & DIAGNOSTICS',
      items: [
        { label: 'Tests & Practice', href: '/tests', icon: FileCheck },
        { label: 'Mistake Notebook', href: '/mistakes', icon: BookMarked, badge: '3', badgeVariant: 'rose' },
        { label: 'Performance Analytics', href: '/performance', icon: TrendingUp },
      ],
    },
    {
      title: 'STUDIO & PUBLISHING',
      items: [
        { label: 'Educator Dashboard', href: '/dashboard/educator', icon: GraduationCap },
        { label: 'Test Studio', href: '/tests/create', icon: PenTool },
        { label: 'Question Bank', href: '/question-bank', icon: Layers },
        { label: 'Public Library', href: '/library', icon: Library },
      ],
    },
    {
      title: 'PLATFORM & CONTROL',
      items: [
        { label: 'Admin Review Center', href: '/dashboard/admin', icon: ShieldCheck },
        { label: 'Target Exam Catalog', href: '/exams', icon: Target },
        { label: 'Account Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const availableExams = [
    { id: 'exam-ssc-cgl-2026', name: 'SSC CGL 2026', sub: 'Staff Selection (Group B/C)', active: true },
    { id: 'exam-neet-2026', name: 'NEET UG 2026', sub: 'Pre-Medical Entrance', active: false },
    { id: 'exam-upsc-2026', name: 'UPSC CSE 2026', sub: 'Civil Services Prelims', active: false },
    { id: 'exam-jee-2026', name: 'JEE Advanced 2026', sub: 'Engineering Entrance', active: false },
  ];

  const renderNavLinks = () => (
    <div className="space-y-6">
      {navGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-sans">
            {group.title}
          </div>
          <div className="space-y-0.5 pt-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-900 font-semibold border-l-2 border-amber-600 pl-2.5'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-stone-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeVariant === 'rose'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col md:flex-row text-stone-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200/80 bg-white sticky top-0 h-screen overflow-y-auto shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <Logo size="sm" />
          <Badge variant="saffron" size="sm">
            v1.0
          </Badge>
        </div>

        {/* Active Target Exam Capsule */}
        <div className="p-3 border-b border-stone-100 bg-stone-50/60">
          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1 flex items-center justify-between">
            <span>Target Exam</span>
            <Link href="/exams" className="text-amber-700 hover:underline">Change</Link>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-800 bg-white p-2 rounded-lg border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="truncate">{selectedExam}</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 shrink-0">Tier-I</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3 flex-1">
          {renderNavLinks()}
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold font-serif shrink-0 border border-amber-200">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NL'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-stone-900 truncate">
                  {user?.name || 'Aspirant'}
                </div>
                <div className="text-[10px] text-stone-500 capitalize truncate">
                  {user?.role || 'student'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="saffron" size="sm">
            {selectedExam.split(' ')[0]}
          </Badge>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold border border-amber-200"
          >
            {user?.name ? user.name.slice(0, 1).toUpperCase() : 'N'}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 overflow-y-auto">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-100 bg-stone-50">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                Active Exam Target
              </div>
              <div className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {selectedExam}
              </div>
            </div>

            <div className="p-3 flex-1">
              {renderNavLinks()}
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-stone-900">{user?.name || 'Aspirant'}</div>
                  <div className="text-[11px] text-stone-500">{user?.email || 'aspirant@nalanda.edu'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-white/90 backdrop-blur-xs border-b border-stone-200/80 sticky top-0 z-10">
          {/* Breadcrumbs or Target Exam indicator */}
          <div className="flex items-center gap-3 min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : (
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-stone-800">Academic Workspace</span>
                <span>/</span>
                <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedExam}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Utilities: Exam Switcher + Persona + Actions */}
          <div className="flex items-center gap-3">
            {/* Target Exam Dropdown */}
            <div className="relative" ref={examMenuRef}>
              <button
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
              >
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>{selectedExam}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {examDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Switch Active Target Exam
                  </div>
                  {availableExams.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExam(ex.name)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-amber-700">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-stone-400">{ex.sub}</div>
                      </div>
                      {selectedExam === ex.name && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="p-2 border-t border-stone-100 mt-1">
                    <Link
                      href="/exams"
                      className="text-[11px] text-amber-700 hover:underline flex items-center justify-center gap-1 font-medium"
                    >
                      View Complete Catalog <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                title="Switch Persona Role"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span className="capitalize">{user?.role || 'student'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Active Workspace Role
                  </div>
                  <button
                    onClick={() => handleSwitchRole('student')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 text-stone-700 font-medium flex items-center justify-between"
                  >
                    <span>Learner (Aspirant)</span>
                    {user?.role === 'student' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('educator')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 text-stone-700 font-medium flex items-center justify-between"
                  >
                    <span>Educator (Senior Faculty)</span>
                    {user?.role === 'educator' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('creator')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 text-stone-700 font-medium flex items-center justify-between"
                  >
                    <span>Creator (Author)</span>
                    {user?.role === 'creator' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 text-stone-700 font-medium flex items-center justify-between"
                  >
                    <span>Administrator</span>
                    {user?.role === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  
                  <div className="p-2 border-t border-stone-100 mt-1">
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/user/roles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: 'educator' }),
                          });
                          window.location.href = '/dashboard/educator';
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-200"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Become an Educator</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {actions}
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Screens < md:) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-30 flex items-center justify-around py-1.5 px-2 shadow-lg"
        >
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold min-w-[56px] transition-colors ${
              pathname === '/dashboard' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mb-0.5 ${pathname === '/dashboard' ? 'text-amber-800' : 'text-stone-400'}`} />
            <span>Overview</span>
          </Link>

          <Link
            href="/learn"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold min-w-[56px] transition-colors ${
              pathname.startsWith('/learn') ? 'text-amber-800' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BookOpen className={`w-5 h-5 mb-0.5 ${pathname.startsWith('/learn') ? 'text-amber-800' : 'text-stone-400'}`} />
            <span>Learn</span>
          </Link>

          <Link
            href="/tests"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold min-w-[56px] transition-colors ${
              pathname.startsWith('/tests') && !pathname.startsWith('/tests/create') ? 'text-amber-800' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileCheck className={`w-5 h-5 mb-0.5 ${pathname.startsWith('/tests') && !pathname.startsWith('/tests/create') ? 'text-amber-800' : 'text-stone-400'}`} />
            <span>Tests</span>
          </Link>

          <Link
            href="/mistakes"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold min-w-[56px] transition-colors ${
              pathname === '/mistakes' ? 'text-rose-700' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BookMarked className={`w-5 h-5 mb-0.5 ${pathname === '/mistakes' ? 'text-rose-700' : 'text-stone-400'}`} />
            <span>Mistakes</span>
          </Link>

          <Link
            href="/library"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold min-w-[56px] transition-colors ${
              pathname === '/library' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Library className={`w-5 h-5 mb-0.5 ${pathname === '/library' ? 'text-amber-800' : 'text-stone-400'}`} />
            <span>Library</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
