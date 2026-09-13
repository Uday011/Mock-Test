'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Play,
  RotateCcw,
  Edit,
  Copy,
  Trash2,
  Clock,
  Award,
  Layers,
  Search,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle,
  AlertTriangle,
  History,
  Sparkles,
  Building2,
  GraduationCap,
  Crown,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institute_name?: string | null;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'practice' | 'attempts'>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [activeTestToRename, setActiveTestToRename] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [renamingLoading, setRenamingLoading] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [authRes, testsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/tests'),
      ]);

      const authData = await authRes.json();
      if (authData.user) {
        setCurrentUser(authData.user);
      }

      const testsData = await testsRes.json();
      if (testsData.tests) {
        setTests(testsData.tests);
        setStats(testsData.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    if (typeof window !== 'undefined' && window.location.search.includes('saved=true')) {
      setShowSavedBanner(true);
    }
  }, []);

  const handleOpenRename = (test: any) => {
    setActiveTestToRename(test);
    setNewTitle(test.title);
    setRenameModalOpen(true);
  };

  const handleSaveRename = async () => {
    if (!activeTestToRename || !newTitle.trim()) return;
    setRenamingLoading(true);
    try {
      const res = await fetch(`/api/tests/${activeTestToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setRenameModalOpen(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRenamingLoading(false);
    }
  };

  const handleDuplicate = async (testId: string) => {
    try {
      const res = await fetch(`/api/tests/${testId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (testId: string) => {
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['All', ...Array.from(new Set(tests.map((t) => t.subject).filter(Boolean)))];

  // Distinguish official institute mocks from student-created practice mocks
  const officialMocks = tests.filter(
    (t) => t.created_by_role === 'admin' || t.created_by_role === 'superadmin'
  );
  const practiceMocks = tests.filter((t) => t.user_id === currentUser?.id);

  // Flatten all historical attempts with test titles for attempts view
  const allAttemptsList = tests
    .flatMap((t) => (t.attempts || []).map((att: any) => ({ ...att, testTitle: t.title, testSubject: t.subject })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredTests = tests.filter((t) => {
    if (activeTab === 'official') {
      if (t.created_by_role !== 'admin' && t.created_by_role !== 'superadmin') return false;
    }
    if (activeTab === 'practice') {
      if (t.user_id !== currentUser?.id) return false;
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || t.subject === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No time limit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${mins} mins`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Role Banner / Context Switcher */}
      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              {currentUser.role === 'superadmin' ? <Crown className="w-5 h-5 text-purple-700" /> : <Building2 className="w-5 h-5 text-amber-700" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                You are previewing the <span className="text-amber-800 underline underline-offset-2">Student Practice Portal</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Signed in as {currentUser.name} ({currentUser.role === 'superadmin' ? 'Super Administrator' : 'Institute Administrator'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser.role === 'superadmin' && (
              <Link
                href="/dashboard/superadmin"
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
              >
                <Crown className="w-3.5 h-3.5" />
                Super Admin Console
              </Link>
            )}
            <Link
              href="/dashboard/admin"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              Institute Hub
            </Link>
          </div>
        </div>
      ) : null}

      {/* Test Saved Confirmation Banner */}
      {showSavedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Practice Test Saved Successfully!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Your test paper has been saved to your dashboard below. You can attempt it anytime at your own pace.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSavedBanner(false)}
            className="text-emerald-700 hover:text-emerald-950 text-base font-bold px-2 py-1"
            aria-label="Dismiss banner"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Student Portal
            </span>
            <span className="text-xs font-medium text-slate-500">
              {currentUser ? `Welcome, ${currentUser.name}` : 'Interactive Exam Practice'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Exam & Mock Test Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Attempt official institute mock exams, view full solution sheets with Gemini AI Performance Coaching, or upload your own papers for self-practice.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/tests/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Create Practice Test
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Tests</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalTests}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attempts Taken</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalAttempts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{stats.averageScore}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Best Score</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{stats.bestScore}%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          {/* Navigation Pills - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Tests ({tests.length})
            </button>
            <button
              onClick={() => setActiveTab('official')}
              className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'official'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Official Institute Mocks ({officialMocks.length})
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'practice'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              My Practice Tests ({practiceMocks.length})
            </button>
            <button
              onClick={() => setActiveTab('attempts')}
              className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'attempts'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Performance History ({allAttemptsList.length})
            </button>
          </div>

          {/* Search and Category Filter */}
          {activeTab !== 'attempts' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 pl-8 pr-3 py-2 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 min-h-[40px] border border-slate-300 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading mock exams and performance analytics...
          </div>
        ) : activeTab === 'attempts' ? (
          /* TAB 4: Dedicated AI Performance History & Past Attempts */
          allAttemptsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No completed attempts yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Attempt any of the available mock tests below. Upon submission, you will unlock full question breakdown and Gemini AI personalized coaching insights.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors"
              >
                Browse Available Tests
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Past Attempts & AI Personalized Coaching
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Each attempt includes detailed score breakdown, timing analysis, and AI recommendations.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                  {allAttemptsList.length} Total Submissions
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {allAttemptsList.map((att) => (
                  <div
                    key={att.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {att.testSubject || 'General'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(att.created_at).toLocaleDateString()} at{' '}
                          {new Date(att.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{att.testTitle}</h4>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Marks: <strong className="text-blue-600">{att.final_score}</strong> / {att.maximum_marks}
                        </span>
                        <span>
                          Accuracy: <strong className="text-emerald-600">{att.accuracy != null ? `${att.accuracy}%` : 'N/A'}</strong>
                        </span>
                        <span>
                          Time: <strong>{Math.round(att.time_taken_seconds / 60)} mins</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-xl sm:text-2xl font-black text-slate-900">{att.percentage}%</span>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</p>
                      </div>

                      <Link
                        href={`/exam/${att.id}/result`}
                        className="px-4 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Insights & Review
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : filteredTests.length === 0 ? (
          /* Empty State for Tests */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {activeTab === 'official'
                ? 'No official institute mocks available'
                : activeTab === 'practice'
                ? 'No personal practice mocks yet'
                : 'No mock tests found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search filters to find what you are looking for.'
                : 'Upload a question paper and answer key to create your first self-practice mock test.'}
            </p>
            <Link
              href="/tests/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              Upload & Create Practice Mock
            </Link>
          </div>
        ) : (
          /* Tests Grid */
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {filteredTests.map((test) => {
              const isExpanded = expandedTestId === test.id;
              const attempts = test.attempts || [];
              const isOfficial = test.created_by_role === 'admin' || test.created_by_role === 'superadmin';
              const isMine = test.user_id === currentUser?.id;

              return (
                <div
                  key={test.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOfficial
                      ? 'border-amber-300/80 shadow-2xs hover:shadow-md'
                      : 'border-slate-200 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isOfficial ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-700" />
                              Official Institute Mock {test.created_by_name ? `• ${test.created_by_name}` : ''}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-blue-600" />
                              Self-Practice Mock
                            </span>
                          )}

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {test.subject || 'General'}
                          </span>

                          <span className="text-xs text-slate-400 font-mono">
                            Created {new Date(test.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">{test.title}</h3>
                          {isMine && (
                            <button
                              onClick={() => handleOpenRename(test)}
                              title="Rename Test"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {test.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                            {test.description}
                          </p>
                        )}

                        {/* Badges / Metrics */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            {test.question_count} Questions
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDuration(test.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Sliders className="w-3.5 h-3.5 text-slate-400" />
                            +{test.default_correct_marks} / -{test.default_negative_marks} marks
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            Best Score: {test.best_score != null ? `${test.best_score} pts` : 'Not attempted'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <Link
                          href={`/tests/${test.id}/start`}
                          className={`flex-1 sm:flex-none justify-center px-5 py-2.5 min-h-[44px] font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                            isOfficial
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {attempts.length > 0 ? 'Retake Exam' : 'Start Exam'}
                        </Link>

                        <button
                          onClick={() => handleDuplicate(test.id)}
                          title="Duplicate Test"
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/tests/${test.id}`}
                          title="View Questions & Attempt History"
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </Link>

                        {isMine && (
                          <button
                            onClick={() => setDeleteConfirmId(test.id)}
                            title="Delete Test"
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl text-xs transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Grouped Attempts Collapsible Section */}
                    {attempts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1"
                        >
                          <span className="flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-blue-600" />
                            My Past Attempts ({attempts.length})
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            {attempts.map((att: any, idx: number) => {
                              const attemptNum = attempts.length - idx;
                              return (
                                <div
                                  key={att.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-200 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">Attempt {attemptNum}</span>
                                    <span className="text-slate-400 text-[11px]">
                                      {new Date(att.created_at).toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                    <span className="font-mono font-bold text-slate-900">
                                      {att.final_score} / {att.maximum_marks} ({att.percentage}%)
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                      {Math.round(att.time_taken_seconds / 60)} mins
                                    </span>
                                    <Link
                                      href={`/exam/${att.id}/result`}
                                      className="text-blue-600 hover:underline font-bold flex items-center gap-1 min-h-[36px]"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      AI Insights <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Rename Test</h3>
            <p className="text-xs text-slate-500 mb-4">
              Renaming updates the test title and reflects across all associated past attempts.
            </p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRenameModalOpen(false)}
                className="px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                disabled={renamingLoading || !newTitle.trim()}
                className="px-4 py-2 min-h-[40px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {renamingLoading ? 'Saving...' : 'Update Name'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-lg">Delete Practice Test?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete this test? All questions and recorded historical attempts for this paper will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 min-h-[40px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
