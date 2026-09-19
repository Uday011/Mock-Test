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
  Target,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Check,
  ExternalLink,
  PanelLeft,
  PlusCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

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

function sanitizeExamName(examName?: string | null): string {
  if (!examName) return 'CAT 2026';
  if (examName.includes('CAT')) return 'CAT 2026';
  if (examName.includes('XAT')) return 'XAT 2026';
  if (examName.includes('NMAT')) return 'NMAT 2026';
  if (examName.includes('SNAP')) return 'SNAP 2026';
  return 'CAT 2026';
}

export function AppShell({
  children,
  breadcrumbs,
  activeExamTitle = 'CAT 2026',
  actions,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExamSheetOpen, setMobileExamSheetOpen] = useState(false);
  const [mobileMoreSheetOpen, setMobileMoreSheetOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(() => sanitizeExamName(activeExamTitle));
  const examMenuRef = useRef<HTMLDivElement>(null);

  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    setMobileOpen(false);
    setMobileExamSheetOpen(false);
    setMobileMoreSheetOpen(false);
    setExamDropdownOpen(false);
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search);
    }
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    const savedExam = localStorage.getItem('nalanda_active_exam');
    const sanitized = sanitizeExamName(savedExam || activeExamTitle);
    setSelectedExam(sanitized);
    if (savedExam !== sanitized) {
      localStorage.setItem('nalanda_active_exam', sanitized);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (examMenuRef.current && !examMenuRef.current.contains(e.target as Node)) {
        setExamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeExamTitle]);

  const handleSelectExam = (exam: string) => {
    const sanitized = sanitizeExamName(exam);
    setSelectedExam(sanitized);
    localStorage.setItem('nalanda_active_exam', sanitized);
    setExamDropdownOpen(false);
    setMobileExamSheetOpen(false);
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
      title: 'WORKSPACE',
      items: [
        { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'LEARN',
      items: [
        { label: 'Syllabus', href: '/learn', icon: BookOpen },
        { label: 'VARC', href: '/learn?section=varc', icon: Compass },
        { label: 'DILR', href: '/learn?section=dilr', icon: Layers },
        { label: 'QA', href: '/learn?section=qa', icon: Target },
      ],
    },
    {
      title: 'PRACTICE',
      items: [
        { label: 'Question Bank', href: '/question-bank', icon: Layers },
        { label: 'VARC', href: '/question-bank?section=VARC', icon: Compass },
        { label: 'DILR', href: '/question-bank?section=DILR', icon: Layers },
        { label: 'QA', href: '/question-bank?section=QA', icon: Target },
      ],
    },
    {
      title: 'TESTS',
      items: [
        { label: 'Full Mocks', href: '/tests?type=full_mock', icon: FileCheck },
        { label: 'Sectional', href: '/tests?type=sectional', icon: Target },
        { label: 'PYQs', href: '/tests?type=pyq', icon: BookMarked },
        { label: 'Create Test', href: '/tests/create', icon: PenTool },
      ],
    },
    {
      title: 'INSIGHT',
      items: [
        { label: 'Performance', href: '/performance', icon: TrendingUp },
        { label: 'Mistakes', href: '/mistakes', icon: BookMarked },
        { label: 'Revision', href: '/mistakes?tab=revision', icon: Clock },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const availableExams = [
    { id: 'exam-cat-2026', name: 'CAT 2026', sub: 'Common Admission Test (IIMs)' },
    { id: 'exam-xat-2026', name: 'XAT 2026', sub: 'Xavier Aptitude Test (XLRI)' },
    { id: 'exam-nmat-2026', name: 'NMAT 2026', sub: 'NMIMS & Leading B-Schools' },
    { id: 'exam-snap-2026', name: 'SNAP 2026', sub: 'Symbiosis National Aptitude' },
  ];

  const isItemActive = (itemHref: string) => {
    const [targetPath, targetQuery] = itemHref.split('?');
    if (itemHref === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (targetQuery) {
      return pathname === targetPath && currentSearch.includes(targetQuery);
    }
    if (pathname === targetPath) {
      return !currentSearch || currentSearch === '?';
    }
    if (targetPath === '/learn' && pathname.startsWith('/learn/')) {
      return true;
    }
    if (targetPath === '/tests' && pathname.startsWith('/tests/') && !pathname.startsWith('/tests/create')) {
      return true;
    }
    return false;
  };

  const renderNavLinks = (isMobile = false) => (
    <div className={isMobile ? 'space-y-4' : 'space-y-5'}>
      {navGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-0.5">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-1">
            {group.title}
          </div>
          <div className="space-y-px">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) setMobileOpen(false);
                    if (item.href.includes('?')) {
                      setCurrentSearch(item.href.slice(item.href.indexOf('?')));
                    } else {
                      setCurrentSearch('');
                    }
                  }}
                  className={`flex items-center justify-between px-2.5 text-xs rounded-control transition-all select-none ${
                    isMobile ? 'min-h-[44px] py-2.5 active:scale-[0.98]' : 'min-h-[32px] py-1.5'
                  } ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                      : 'text-ink-muted hover:text-ink hover:bg-secondary active:bg-line'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} flex-shrink-0 ${
                        isActive ? 'text-accent' : 'text-ink-muted'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-accent/10 text-accent' : 'bg-line text-ink-muted'
                    }`}>
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
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row text-ink">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-line bg-secondary sticky top-0 h-screen overflow-y-auto shrink-0 z-20 transition-all duration-200 select-none ${
          sidebarCollapsed ? 'w-0 -ml-px border-r-0 overflow-hidden' : 'w-60'
        }`}
      >
        {/* Brand */}
        <div className="p-3 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-control bg-accent text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              E
            </div>
            <div>
              <span className="text-xs font-bold text-ink tracking-tight">
                ExamCraft
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-elevated transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Exam */}
        <div className="px-3 py-2 border-b border-line">
          <div className="flex items-center justify-between text-[10px] text-ink-muted mb-1.5">
            <span className="uppercase tracking-wider font-semibold">Target Exam</span>
            <span className="font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded font-medium">CBT</span>
          </div>
          <div className="flex items-center justify-between text-xs text-ink bg-surface px-2.5 py-1.5 rounded-control border border-line">
            <div className="flex items-center gap-1.5 truncate font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>CAT 2026</span>
            </div>
            <span className="text-[10px] text-ink-muted font-medium">Nov 2026</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2.5 flex-1 overflow-y-auto">
          {renderNavLinks()}
        </div>

        {/* User Footer */}
        <div className="p-2.5 border-t border-line bg-secondary">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-control hover:bg-elevated transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px] font-semibold shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EC'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-ink truncate">
                  {user?.name || 'Aspirant'}
                </div>
                <div className="text-[10px] text-ink-muted truncate">
                  CAT Aspirant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <ThemeSelector />
              <button
                onClick={handleLogout}
                className="p-1 text-ink-muted hover:text-coral rounded hover:bg-elevated transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-surface border-b border-line sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1.5 text-ink hover:bg-secondary active:bg-line rounded-btn transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileExamSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-accent/10 hover:bg-accent/15 active:scale-95 text-accent rounded-full text-xs font-semibold border border-accent/20 transition-all"
            aria-label="Change target exam"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{selectedExam.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="min-w-[38px] min-h-[38px] w-9 h-9 rounded-full bg-secondary text-ink border border-line flex items-center justify-center text-xs font-semibold active:scale-95 transition-transform"
            aria-label="User profile and menu"
          >
            {user?.name ? user.name.slice(0, 1).toUpperCase() : 'E'}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-[85%] max-w-xs bg-secondary h-full shadow-2xl z-10 overflow-hidden border-r border-line">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-surface">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-ink-muted hover:text-ink rounded-btn hover:bg-secondary active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Exam Card */}
            <div className="p-3 border-b border-line bg-surface/60">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] uppercase font-semibold text-ink-muted tracking-widest">
                  Active Target
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileExamSheetOpen(true);
                  }}
                  className="text-[11px] font-semibold text-accent hover:underline px-1 py-0.5"
                >
                  Change
                </button>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setMobileExamSheetOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-card bg-surface border border-line text-left hover:border-accent/40 active:bg-canvas transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="text-xs font-semibold text-ink truncate">{selectedExam}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted flex-shrink-0 ml-1" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2.5 border-b border-line bg-line/20 flex gap-2">
              <Link
                href="/tests/create"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-surface border border-line rounded-card text-xs font-semibold text-ink shadow-xs active:scale-95 hover:border-accent/40 transition-all"
              >
                <PenTool className="w-3.5 h-3.5 text-accent" />
                <span>Create Test</span>
              </Link>
              <Link
                href="/library?tab=add"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-surface border border-line rounded-card text-xs font-semibold text-ink shadow-xs active:scale-95 hover:border-accent/40 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-accent" />
                <span>Add Resource</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="p-3 flex-1 overflow-y-auto">
              {renderNavLinks(true)}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-line bg-surface">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {user?.name ? user.name.slice(0, 1).toUpperCase() : 'E'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink truncate">{user?.name || 'Aspirant'}</div>
                    <div className="text-[10px] text-ink-muted truncate">{user?.email || 'aspirant@examcraft.app'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeSelector />
                  <button
                    onClick={handleLogout}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-ink-muted hover:text-coral rounded-btn hover:bg-secondary active:scale-95 transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-canvas">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-6 h-12 bg-surface border-b border-line sticky top-0 z-10 select-none">
          <div className="flex items-center gap-2 min-w-0">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-secondary transition-colors mr-1"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="text-ink font-semibold">ExamCraft</span>
                <span className="text-ink-muted">/</span>
                <span className="text-ink-muted hidden sm:inline">Plan. Practice. Perform.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-muted hidden lg:inline font-normal">
              Disciplined today. A stronger you tomorrow.
            </span>
            <span className="text-xs text-line hidden lg:inline">—</span>
            {/* Target Exam Dropdown */}
            <div className="relative" ref={examMenuRef}>
              <button
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-ink hover:bg-secondary rounded-control transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-medium">{selectedExam}</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {examDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-surface rounded-card shadow-lg border border-line py-1 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                    Switch Target Exam
                  </div>
                  {availableExams.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExam(ex.name)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-secondary flex items-center justify-between text-ink transition-colors"
                    >
                      <div>
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-[10px] text-ink-muted">{ex.sub}</div>
                      </div>
                      {selectedExam === ex.name && (
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-line mt-0.5">
                    <Link
                      href="/exams"
                      className="text-[11px] text-ink-muted hover:text-accent flex items-center justify-center gap-1 font-medium"
                    >
                      Complete Catalog <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <ThemeSelector />

            {user && (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-ink-muted hover:text-coral rounded-control hover:bg-secondary transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {actions}
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-24 md:pb-10">
          {children}
        </main>

        {/* Mobile Exam Switcher Bottom Sheet */}
        {mobileExamSheetOpen && (
          <div className="fixed inset-0 z-[110] md:hidden flex flex-col justify-end" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileExamSheetOpen(false)}
            />
            <div className="relative bg-surface rounded-t-2xl shadow-2xl border-t border-line p-4 max-h-[80vh] overflow-y-auto z-10 animate-slide-up">
              <div className="w-10 h-1 bg-line rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Switch Target Exam</h3>
                  <p className="text-[11px] text-ink-muted">Select the examination you are preparing for</p>
                </div>
                <button
                  onClick={() => setMobileExamSheetOpen(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-ink rounded-btn hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {availableExams.map((exam) => {
                  const isSelected = selectedExam.includes(exam.name.split(' ')[0]);
                  return (
                    <button
                      key={exam.id}
                      onClick={() => {
                        handleSelectExam(exam.name);
                        setMobileExamSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-card border text-left min-h-[56px] transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-accent/40 bg-accent/8'
                          : 'border-line bg-surface hover:border-line/80'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-ink flex items-center gap-2">
                          {exam.name}
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-accent text-white rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted">{exam.sub}</div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-line" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setMobileExamSheetOpen(false)}
                className="w-full py-2.5 bg-secondary text-ink text-xs font-medium rounded-btn hover:bg-line active:scale-98"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mobile More Drawer / Sheet */}
        {mobileMoreSheetOpen && (
          <div className="fixed inset-0 z-[110] md:hidden flex flex-col justify-end" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMoreSheetOpen(false)}
            />
            <div className="relative bg-surface rounded-t-2xl shadow-2xl border-t border-line p-5 max-h-[85vh] overflow-y-auto z-10 animate-slide-up space-y-5">
              <div className="w-10 h-1 bg-line rounded-full mx-auto" />

              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div>
                  <h3 className="text-sm font-semibold text-ink">More Workspace Areas</h3>
                  <p className="text-[11px] text-ink-muted">Insights, revision queue, tools and preferences</p>
                </div>
                <button
                  onClick={() => setMobileMoreSheetOpen(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-ink rounded-btn hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Navigation Items */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/performance"
                  onClick={() => setMobileMoreSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-card border border-line bg-secondary/30 hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Analysis</div>
                    <div className="text-[10px] text-ink-muted">Accuracy & Trends</div>
                  </div>
                </Link>

                <Link
                  href="/mistakes"
                  onClick={() => setMobileMoreSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-card border border-line bg-secondary/30 hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Notebook</div>
                    <div className="text-[10px] text-ink-muted">Saved Mistakes</div>
                  </div>
                </Link>

                <Link
                  href="/mistakes?tab=revision"
                  onClick={() => setMobileMoreSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-card border border-line bg-secondary/30 hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Revision</div>
                    <div className="text-[10px] text-ink-muted">Spaced Practice</div>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setMobileMoreSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-card border border-line bg-secondary/30 hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-line text-ink-muted flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Settings</div>
                    <div className="text-[10px] text-ink-muted">Preferences</div>
                  </div>
                </Link>
              </div>

              {/* Target Exam Switcher Button */}
              <div className="pt-2 border-t border-line">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Target Exam</div>
                <button
                  onClick={() => {
                    setMobileMoreSheetOpen(false);
                    setMobileExamSheetOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-card border border-line bg-surface hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-ink">{selectedExam}</span>
                  </div>
                  <span className="text-[11px] text-accent font-medium">Switch &rarr;</span>
                </button>
              </div>

              {/* Theme Selector */}
              <div className="pt-2 border-t border-line">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Theme Mode</div>
                <div className="flex justify-center">
                  <ThemeSelector />
                </div>
              </div>

              {/* User / Sign Out */}
              {user && (
                <div className="pt-2 border-t border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-ink">{user.name}</div>
                      <div className="text-[10px] text-ink-muted">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-coral hover:bg-coral/10 rounded-btn transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-line z-30 flex items-center justify-around h-16 px-1 select-none"
        >
          {[
            { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
            { href: '/learn', label: 'Learn', icon: BookOpen, exact: false },
            { href: '/question-bank', label: 'Practice', icon: Layers, exact: true },
            { href: '/tests', label: 'Tests', icon: FileCheck, exact: false },
          ].map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && (item.href !== '/tests' || !pathname.startsWith('/tests/create'));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 rounded-btn text-[11px] transition-all active:scale-95 ${
                  isActive ? 'text-accent font-semibold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-accent/10 text-accent' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMoreSheetOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 rounded-btn text-[11px] transition-all active:scale-95 ${
              mobileMoreSheetOpen || pathname === '/performance' || pathname === '/mistakes' || pathname === '/settings'
                ? 'text-accent font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-colors ${
              mobileMoreSheetOpen || pathname === '/performance' || pathname === '/mistakes' || pathname === '/settings'
                ? 'bg-accent/10 text-accent'
                : ''
            }`}>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="mt-0.5">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
