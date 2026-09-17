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
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  PanelLeft,
  Search,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      title: 'KNOWLEDGE & SYLLABUS',
      items: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Exam Workspace', href: '/exams/exam-ssc-cgl-2026', icon: Compass },
        { label: 'Syllabus Tree', href: '/learn', icon: BookOpen },
      ],
    },
    {
      title: 'PRACTICE & DIAGNOSTICS',
      items: [
        { label: 'Tests & Mocks', href: '/tests', icon: FileCheck },
        { label: 'Mistake Notebook', href: '/mistakes', icon: BookMarked, badge: '3' },
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
      title: 'WORKSPACE SETTINGS',
      items: [
        { label: 'Admin Moderation', href: '/dashboard/admin', icon: ShieldCheck },
        { label: 'Exam Catalog', href: '/exams', icon: Target },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const availableExams = [
    { id: 'exam-ssc-cgl-2026', name: 'SSC CGL 2026', sub: 'Staff Selection (Group B/C)' },
    { id: 'exam-neet-2026', name: 'NEET UG 2026', sub: 'Pre-Medical Entrance' },
    { id: 'exam-upsc-2026', name: 'UPSC CSE 2026', sub: 'Civil Services Prelims' },
    { id: 'exam-jee-2026', name: 'JEE Advanced 2026', sub: 'Engineering Entrance' },
  ];

  const renderNavLinks = () => (
    <div className="space-y-4">
      {navGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-0.5">
          <div className="px-2 text-[11px] font-medium uppercase tracking-wider text-[#787774]">
            {group.title}
          </div>
          <div className="space-y-0.5 pt-0.5">
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
                  className={`flex items-center justify-between px-2.5 py-1.5 text-[13px] rounded-md transition-colors min-h-[32px] select-none ${
                    isActive
                      ? 'bg-[#efefed] text-[#37352f] font-medium'
                      : 'text-[#5f5e5b] hover:text-[#37352f] hover:bg-[#efefed]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-[#37352f]' : 'text-[#787774]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#ebebeb] text-[#787774]">
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
    <div className="min-h-screen bg-[#ffffff] flex flex-col md:flex-row text-[#37352f]">
      {/* Notion-Style Collapsible Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#ebebeb] bg-[#f7f6f3] sticky top-0 h-screen overflow-y-auto shrink-0 z-20 transition-all duration-200 select-none ${
          sidebarCollapsed ? 'w-0 -ml-px border-r-0 overflow-hidden' : 'w-60'
        }`}
      >
        {/* Workspace Brand / Identity Switcher */}
        <div className="p-3 border-b border-[#ebebeb] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-[#37352f] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              N
            </div>
            <span className="text-xs font-semibold text-[#37352f] truncate tracking-tight">
              Nalanda Workspace
            </span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 rounded text-[#787774] hover:text-[#37352f] hover:bg-[#efefed] transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Target Exam Pill */}
        <div className="px-3 py-2 border-b border-[#ebebeb]">
          <div className="flex items-center justify-between text-[11px] text-[#787774] mb-1">
            <span>Target Exam</span>
            <Link href="/exams" className="text-[#37352f] hover:underline text-[10px]">
              Switch
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-[#37352f] bg-white px-2 py-1.5 rounded border border-[#ebebeb]">
            <div className="flex items-center gap-1.5 truncate font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0f7b6c] shrink-0" />
              <span className="truncate">{selectedExam}</span>
            </div>
            <span className="text-[10px] font-mono text-[#787774]">Tier-I</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-2.5 flex-1 overflow-y-auto">
          {renderNavLinks()}
        </div>

        {/* User Session Footer */}
        <div className="p-2.5 border-t border-[#ebebeb] bg-[#f7f6f3]">
          <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#efefed] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#ebebeb] text-[#37352f] flex items-center justify-center text-[10px] font-medium shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NL'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#37352f] truncate">
                  {user?.name || 'Aspirant'}
                </div>
                <div className="text-[10px] text-[#787774] capitalize truncate">
                  {user?.role || 'student'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1 text-[#787774] hover:text-[#c93b3b] rounded hover:bg-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#ebebeb] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 -ml-1 text-[#37352f] hover:bg-[#efefed] rounded transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="saffron" size="sm">
            {selectedExam.split(' ')[0]}
          </Badge>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="w-6 h-6 rounded-full bg-[#efefed] text-[#37352f] flex items-center justify-center text-[10px] font-medium"
          >
            {user?.name ? user.name.slice(0, 1).toUpperCase() : 'N'}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-4/5 max-w-xs bg-[#f7f6f3] h-full shadow-lg z-10 overflow-y-auto border-r border-[#ebebeb]">
            <div className="p-3.5 border-b border-[#ebebeb] flex items-center justify-between bg-white">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-[#787774] hover:text-[#37352f] rounded hover:bg-[#efefed]"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-[#ebebeb]">
              <div className="text-[10px] uppercase font-medium text-[#787774] tracking-wider mb-1">
                Active Target Exam
              </div>
              <div className="text-xs font-medium text-[#37352f] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f7b6c]" />
                {selectedExam}
              </div>
            </div>

            <div className="p-2.5 flex-1 overflow-y-auto">
              {renderNavLinks()}
            </div>

            <div className="p-3 border-t border-[#ebebeb] bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#37352f]">{user?.name || 'Aspirant'}</div>
                  <div className="text-[10px] text-[#787774]">{user?.email || 'aspirant@nalanda.edu'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#787774] hover:text-[#c93b3b] rounded hover:bg-[#efefed] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#ffffff]">
        {/* Compact Notion Top Header Bar (Height 44px) */}
        <header className="hidden md:flex items-center justify-between px-5 h-11 bg-white border-b border-[#ebebeb] sticky top-0 z-10 select-none">
          {/* Breadcrumbs & Sidebar Toggle */}
          <div className="flex items-center gap-2 min-w-0">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1 rounded text-[#787774] hover:text-[#37352f] hover:bg-[#efefed] transition-colors mr-1"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#787774]">
                <span className="text-[#37352f] font-medium">Nalanda</span>
                <span>/</span>
                <span>{selectedExam}</span>
              </div>
            )}
          </div>

          {/* Right Header Utilities: Exam Switcher + Persona + Actions */}
          <div className="flex items-center gap-2">
            {/* Target Exam Dropdown */}
            <div className="relative" ref={examMenuRef}>
              <button
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#37352f] hover:bg-[#efefed] rounded transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f7b6c]" />
                <span className="font-medium">{selectedExam}</span>
                <ChevronDown className="w-3 h-3 text-[#787774]" />
              </button>

              {examDropdownOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#ebebeb] py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#787774]">
                    Switch Target Exam
                  </div>
                  {availableExams.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExam(ex.name)}
                      className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#f7f6f3] flex items-center justify-between text-[#37352f] transition-colors"
                    >
                      <div>
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-[10px] text-[#787774]">{ex.sub}</div>
                      </div>
                      {selectedExam === ex.name && (
                        <Check className="w-3.5 h-3.5 text-[#0f7b6c] shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-[#ebebeb] mt-0.5">
                    <Link
                      href="/exams"
                      className="text-[11px] text-[#787774] hover:text-[#37352f] flex items-center justify-center gap-1"
                    >
                      Complete Catalog <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#37352f] hover:bg-[#efefed] rounded transition-colors"
                title="Switch Workspace Role"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#787774]" />
                <span className="capitalize">{user?.role || 'student'}</span>
                <ChevronDown className="w-3 h-3 text-[#787774]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#ebebeb] py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#787774]">
                    Active Workspace Role
                  </div>
                  {[
                    { role: 'student', label: 'Learner (Aspirant)' },
                    { role: 'educator', label: 'Educator (Faculty)' },
                    { role: 'creator', label: 'Creator (Author)' },
                    { role: 'admin', label: 'Administrator' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleSwitchRole(r.role)}
                      className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#f7f6f3] text-[#37352f] flex items-center justify-between"
                    >
                      <span>{r.label}</span>
                      {user?.role === r.role && <Check className="w-3.5 h-3.5 text-[#0f7b6c]" />}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-[#ebebeb] mt-0.5">
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
                      className="w-full py-1 px-2 rounded bg-[#faece3] hover:bg-[#f5e1d3] text-[#d9730d] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
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
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Screens < md:) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] z-30 flex items-center justify-around py-1.5 px-2 shadow-xs select-none"
        >
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] min-w-[52px] transition-colors ${
              pathname === '/dashboard' ? 'text-[#37352f] font-semibold' : 'text-[#787774] hover:text-[#37352f]'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 mb-0.5 ${pathname === '/dashboard' ? 'text-[#37352f]' : 'text-[#9b9a97]'}`} />
            <span>Overview</span>
          </Link>

          <Link
            href="/learn"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] min-w-[52px] transition-colors ${
              pathname.startsWith('/learn') ? 'text-[#37352f] font-semibold' : 'text-[#787774] hover:text-[#37352f]'
            }`}
          >
            <BookOpen className={`w-4 h-4 mb-0.5 ${pathname.startsWith('/learn') ? 'text-[#37352f]' : 'text-[#9b9a97]'}`} />
            <span>Learn</span>
          </Link>

          <Link
            href="/tests"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] min-w-[52px] transition-colors ${
              pathname.startsWith('/tests') && !pathname.startsWith('/tests/create') ? 'text-[#37352f] font-semibold' : 'text-[#787774] hover:text-[#37352f]'
            }`}
          >
            <FileCheck className={`w-4 h-4 mb-0.5 ${pathname.startsWith('/tests') && !pathname.startsWith('/tests/create') ? 'text-[#37352f]' : 'text-[#9b9a97]'}`} />
            <span>Tests</span>
          </Link>

          <Link
            href="/mistakes"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] min-w-[52px] transition-colors ${
              pathname === '/mistakes' ? 'text-[#c93b3b] font-semibold' : 'text-[#787774] hover:text-[#37352f]'
            }`}
          >
            <BookMarked className={`w-4 h-4 mb-0.5 ${pathname === '/mistakes' ? 'text-[#c93b3b]' : 'text-[#9b9a97]'}`} />
            <span>Mistakes</span>
          </Link>

          <Link
            href="/library"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[10px] min-w-[52px] transition-colors ${
              pathname === '/library' ? 'text-[#37352f] font-semibold' : 'text-[#787774] hover:text-[#37352f]'
            }`}
          >
            <Library className={`w-4 h-4 mb-0.5 ${pathname === '/library' ? 'text-[#37352f]' : 'text-[#9b9a97]'}`} />
            <span>Library</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
