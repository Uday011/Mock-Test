'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Layers,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  CreditCard,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  Eye,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Receipt,
  HelpCircle,
  RefreshCw,
  FolderPlus,
  Play,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function EducatorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'series' | 'monetization' | 'profile'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test filters
  const [testStatusFilter, setTestStatusFilter] = useState<string>('all');
  const [testPriceFilter, setTestPriceFilter] = useState<string>('all');

  // Profile Form state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [specializationsInput, setSpecializationsInput] = useState('');
  const [publicationStatus, setPublicationStatus] = useState('active');
  const [savingProfile, setSavingProfile] = useState(false);

  // Quick Series Create Modal
  const [showCreateSeriesModal, setShowCreateSeriesModal] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');
  const [newSeriesExam, setNewSeriesExam] = useState('exam-ssc-cgl-2026');
  const [newSeriesPaid, setNewSeriesPaid] = useState(false);
  const [newSeriesPrice, setNewSeriesPrice] = useState(299);
  const [creatingSeries, setCreatingSeries] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('/api/educator/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load educator dashboard');
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          if (resData.educator) {
            setHeadline(resData.educator.headline || '');
            setBio(resData.educator.bio || '');
            setInstituteName(resData.educator.institute_name || '');
            setSpecializationsInput((resData.educator.specializations || []).join(', '));
            setPublicationStatus(resData.educator.publication_status || 'active');
          }
        } else {
          setError(resData.error || 'Failed to fetch dashboard');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const specializations = specializationsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/educator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          institute_name: instituteName,
          specializations,
          publication_status: publicationStatus,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Educator profile updated successfully');
        fetchDashboardData();
      } else {
        showToast(resData.error || 'Failed to update profile');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeriesTitle.trim()) return;
    setCreatingSeries(true);
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSeriesTitle.trim(),
          description: newSeriesDesc.trim(),
          exam_id: newSeriesExam,
          target_year: 2026,
          is_paid: newSeriesPaid,
          price_inr: newSeriesPaid ? Number(newSeriesPrice) : 0,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Test series created successfully');
        setShowCreateSeriesModal(false);
        setNewSeriesTitle('');
        setNewSeriesDesc('');
        fetchDashboardData();
      } else {
        showToast(resData.error || 'Failed to create series');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating series');
    } finally {
      setCreatingSeries(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Loading Educator Publishing Studio...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-stone-900 font-serif text-lg">Studio Unavailable</h3>
          <p className="text-xs text-stone-500">{error || 'Could not load educator dashboard data'}</p>
          <Button variant="primary" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      </AppShell>
    );
  }

  const { educator, stats, monetization, tests, test_series, recent_activity, pending_reviews } = data;

  const filteredTests = tests.filter((t: any) => {
    if (testStatusFilter !== 'all') {
      if (testStatusFilter === 'published' && t.status !== 'published' && t.status !== null) return false;
      if (testStatusFilter === 'draft' && t.status !== 'draft') return false;
      if (testStatusFilter === 'under_review' && t.status !== 'under_review' && t.status !== 'revisions_requested') return false;
    }
    if (testPriceFilter !== 'all') {
      if (testPriceFilter === 'free' && t.is_paid) return false;
      if (testPriceFilter === 'paid' && !t.is_paid) return false;
    }
    return true;
  });

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Studio & Publishing', href: '/dashboard/educator' },
        { label: 'Educator Dashboard', href: '/dashboard/educator' },
      ]}
    >
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Sandbox Notice */}
        <div className="p-3 bg-notion-sidebar border border-notion-border rounded-md flex items-start sm:items-center justify-between gap-3 text-xs text-notion-text">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-notion-muted shrink-0" />
            <span>
              <strong>Educator Sandbox Active:</strong> Monetization metrics, payout ledgers, and student checkout records reflect Nalanda simulated test environment.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            Sandbox Tier
          </span>
        </div>

        {/* Educator Header Banner */}
        <div className="bg-white rounded-md p-6 border border-notion-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center font-serif font-bold text-xl shrink-0">
                {educator.name?.charAt(0) || 'E'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-notion-text tracking-tight">
                    {educator.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {educator.verification_status === 'verified' ? 'Verified Faculty' : 'Verification Pending'}
                  </span>
                  <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                    educator.publication_status === 'active'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                  }`}>
                    {educator.publication_status === 'active' ? 'Publishing Active' : 'Publishing Paused'}
                  </span>
                </div>
                <p className="text-xs text-notion-muted">
                  {educator.headline} • <span className="font-medium text-notion-text">{educator.institute_name}</span>
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-notion-muted font-mono">
                    {stats.total_published} Tests Published • {stats.total_series} Series • {stats.total_attempts} Attempts Recorded
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/creators/${educator.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Public Portfolio
                </Button>
              </Link>
              <button
                onClick={() => setShowCreateSeriesModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-notion-border bg-white hover:bg-notion-sidebar text-notion-text transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-notion-muted" />
                New Series
              </button>
              <Link href="/tests/create">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Create Test
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-notion-border gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'overview'
                ? 'border-notion-text text-notion-text font-semibold'
                : 'border-transparent text-notion-muted hover:text-notion-text'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'tests'
                ? 'border-notion-text text-notion-text font-semibold'
                : 'border-transparent text-notion-muted hover:text-notion-text'
            }`}
          >
            <Layers className="w-4 h-4" />
            Authored Tests ({tests.length})
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`pb-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'series'
                ? 'border-notion-text text-notion-text font-semibold'
                : 'border-transparent text-notion-muted hover:text-notion-text'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Test Series ({test_series.length})
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`pb-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'monetization'
                ? 'border-notion-text text-notion-text font-semibold'
                : 'border-transparent text-notion-muted hover:text-notion-text'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Monetization & Ledger
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'profile'
                ? 'border-notion-text text-notion-text font-semibold'
                : 'border-transparent text-notion-muted hover:text-notion-text'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Profile & Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Callout Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Published</span>
                <span className="text-lg font-bold text-notion-text block mt-0.5 font-mono">
                  {stats.total_published}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Live in Library</span>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Drafts</span>
                <span className="text-lg font-bold text-notion-text block mt-0.5 font-mono">
                  {stats.total_drafts}
                </span>
                <span className="text-[10px] text-notion-muted">In Test Studio</span>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">In Review</span>
                <span className="text-lg font-bold text-amber-800 block mt-0.5 font-mono">
                  {stats.total_under_review}
                </span>
                <span className="text-[10px] text-amber-700">Admin Queue</span>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Total Attempts</span>
                <span className="text-lg font-bold text-notion-text block mt-0.5 font-mono">
                  {stats.total_attempts}
                </span>
                <span className="text-[10px] text-notion-muted">Submissions</span>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Paid Content</span>
                <span className="text-lg font-bold text-notion-text block mt-0.5 font-mono">
                  {stats.paid_tests_count} Tests
                </span>
                <span className="text-[10px] text-notion-muted">₹ Tier Pricing</span>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Net Accrued</span>
                <span className="text-lg font-bold text-emerald-700 block mt-0.5 font-mono">
                  ₹{monetization.net_payout_inr.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">85% Share (Sim)</span>
              </div>
            </div>

            {/* Pending Moderation Notice if any */}
            {pending_reviews && pending_reviews.length > 0 && (
              <div className="p-3 bg-amber-50/50 rounded-md border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <h3 className="font-semibold text-xs text-amber-950">
                    Content Under Review ({pending_reviews.length})
                  </h3>
                </div>
                <p className="text-xs text-amber-800">
                  The following assessment papers have been submitted for quality and copyright review. They will be visible publicly upon moderation approval.
                </p>
                <div className="space-y-1.5">
                  {pending_reviews.map((pr: any) => (
                    <div
                      key={pr.id}
                      className="p-2.5 bg-white rounded-md border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-notion-text">{pr.title}</span>
                        <p className="text-notion-muted text-[11px]">
                          {pr.question_count || 15} Qs • {pr.is_paid ? `₹${pr.price_inr}` : 'Free'} • Status:{' '}
                          <span className="font-medium text-amber-800 uppercase">{pr.status}</span>
                        </p>
                      </div>
                      <Link href={`/tests/create?edit=${pr.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Edit in Studio
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Series Quick Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-notion-text flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-notion-muted" /> Master Test Series ({test_series.length})
                </h2>
                <button
                  onClick={() => setShowCreateSeriesModal(true)}
                  className="text-xs text-notion-text font-medium hover:underline"
                >
                  + Add New Series
                </button>
              </div>

              {test_series.length === 0 ? (
                <div className="bg-white rounded-md border border-notion-border p-6 text-center text-xs text-notion-muted space-y-2">
                  <p>You haven't created any test series yet. Group your tests into structured sequences for learners.</p>
                  <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                    Create First Test Series
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {test_series.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-md border border-notion-border p-4 flex flex-col justify-between space-y-3 hover:border-notion-text/40 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-notion-sidebar text-notion-muted border border-notion-border">
                            {s.exam_title || 'Competitive Exam'}
                          </span>
                          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                            s.is_paid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                          }`}>
                            {s.is_paid ? `₹${s.price_inr}` : 'Free Series'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-notion-text">{s.title}</h3>
                        <p className="text-xs text-notion-muted line-clamp-2">{s.description}</p>
                      </div>

                      <div className="pt-2.5 border-t border-notion-border flex items-center justify-between text-xs">
                        <span className="font-mono text-notion-muted text-[11px]">
                          {s.total_tests} Tests • {s.enrolled_count} Enrolled
                        </span>
                        <Link href={`/series/${s.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            View Series <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Learner Activity */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-notion-text flex items-center gap-2">
                <Users className="w-4 h-4 text-notion-muted" /> Recent Learner Submissions ({recent_activity.length})
              </h2>

              {recent_activity.length === 0 ? (
                <div className="bg-white rounded-md border border-notion-border p-6 text-center text-xs text-notion-muted">
                  No learner test submissions recorded yet on your authored tests.
                </div>
              ) : (
                <div className="bg-white rounded-md border border-notion-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-notion-sidebar text-notion-muted border-b border-notion-border font-mono text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Learner</th>
                          <th className="py-2.5 px-3">Test Title</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Accuracy</th>
                          <th className="py-2.5 px-3">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-notion-border">
                        {recent_activity.map((act: any) => (
                          <tr key={act.attempt_id} className="hover:bg-notion-bg">
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-notion-text block">{act.learner_name}</span>
                              <span className="text-[10px] text-notion-muted font-mono">{act.learner_email}</span>
                            </td>
                            <td className="py-2.5 px-3 text-notion-text font-normal">{act.test_title}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-notion-text">
                              {act.final_score} / {act.maximum_marks}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-emerald-700 font-medium">{act.accuracy}%</span>
                            </td>
                            <td className="py-2.5 px-3 text-notion-muted font-mono text-[11px]">
                              {new Date(act.submitted_at || act.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUTHORED TESTS */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="p-2 bg-white rounded-md border border-notion-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-notion-muted uppercase text-[10px] font-medium px-1">Status:</span>
                {['all', 'published', 'draft', 'under_review'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTestStatusFilter(st)}
                    className={`px-2.5 py-1 rounded capitalize text-xs transition-colors ${
                      testStatusFilter === st
                        ? 'bg-notion-text text-white font-medium'
                        : 'text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-notion-muted uppercase text-[10px] font-medium px-1">Pricing:</span>
                {['all', 'free', 'paid'].map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setTestPriceFilter(pr)}
                    className={`px-2.5 py-1 rounded capitalize text-xs transition-colors ${
                      testPriceFilter === pr
                        ? 'bg-notion-text text-white font-medium'
                        : 'text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Cards List */}
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-md border border-notion-border p-8 text-center text-xs text-notion-muted space-y-2">
                <p>No tests match the selected filter criteria.</p>
                <Link href="/tests/create">
                  <Button variant="primary" size="sm">
                    Create New Test in Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTests.map((test: any) => (
                  <div
                    key={test.id}
                    className="p-4 bg-white rounded-md border border-notion-border flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-notion-text/40 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded uppercase ${
                          test.status === 'published' || !test.status
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : test.status === 'under_review'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                        }`}>
                          {test.status || 'published'}
                        </span>

                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                          test.is_paid
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                        }`}>
                          {test.is_paid ? `₹${test.price_inr}` : 'Free'}
                        </span>

                        <span className="text-[10px] font-mono text-notion-muted">
                          {test.subject || 'General'} • {test.difficulty || 'Medium'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-notion-text">
                        {test.title}
                      </h3>

                      {test.description && (
                        <p className="text-xs text-notion-muted line-clamp-1">{test.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-notion-muted font-mono text-[11px] flex-wrap">
                        <span>{test.question_count || 15} Qs</span>
                        <span>•</span>
                        <span>{Math.round((test.duration_seconds || 1800) / 60)} Mins</span>
                        <span>•</span>
                        <span>{test.attempts_count || 0} Attempts</span>
                        {test.avg_score && (
                          <>
                            <span>•</span>
                            <span>Avg Score: <strong>{test.avg_score}</strong></span>
                          </>
                        )}
                      </div>

                      {test.review_notes && (
                        <div className="p-2 bg-amber-50/50 rounded text-xs text-amber-900 border border-amber-200">
                          <strong>Admin Review Note:</strong> {test.review_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-notion-border">
                      <Link href={`/tests/${test.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      <Link href={`/tests/create?edit=${test.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Link href={`/tests/${test.id}/start`}>
                        <Button variant="primary" size="sm" className="text-xs">
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEST SERIES */}
        {activeTab === 'series' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm text-notion-text">
                  Curated Test Series & Sequences
                </h2>
                <p className="text-xs text-notion-muted">
                  Package tests into sequential preparation journeys with free previews and bundled pricing.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Create Series
              </Button>
            </div>

            {test_series.length === 0 ? (
              <div className="bg-white rounded-md border border-notion-border p-8 text-center text-xs text-notion-muted space-y-2">
                <p>No test series established yet.</p>
                <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                  Create Your First Test Series
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {test_series.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 bg-white rounded-md border border-notion-border space-y-3 flex flex-col justify-between hover:border-notion-text/40 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-notion-sidebar text-notion-muted border border-notion-border">
                          {s.exam_title || 'Competitive Exam'}
                        </span>
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                          s.is_paid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                        }`}>
                          {s.is_paid ? `₹${s.price_inr}` : 'Free Series'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-notion-text">{s.title}</h3>
                      <p className="text-xs text-notion-muted line-clamp-2">{s.description}</p>
                    </div>

                    <div className="space-y-2.5 pt-2.5 border-t border-notion-border">
                      <div className="flex items-center justify-between text-[11px] font-mono text-notion-muted">
                        <span>{s.total_tests} Tests</span>
                        <span>{s.enrolled_count} Learners</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/series/${s.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full text-xs">
                            Manage Tests
                          </Button>
                        </Link>
                        <Link href={`/series/${s.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MONETIZATION & LEDGER */}
        {activeTab === 'monetization' && (
          <div className="space-y-5">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white rounded-md border border-notion-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">Gross Sales</span>
                <p className="text-xl font-mono font-bold text-notion-text">
                  ₹{monetization.gross_sales_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-notion-muted">Total volume processed in sandbox</p>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">
                  Platform Fee (15%)
                </span>
                <p className="text-xl font-mono font-bold text-rose-700">
                  - ₹{monetization.platform_fee_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-notion-muted">Standard infrastructure deduction</p>
              </div>

              <div className="p-3.5 bg-white rounded-md border border-notion-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-notion-muted font-medium block">
                  Net Accrued Payout
                </span>
                <p className="text-xl font-mono font-bold text-emerald-700">
                  ₹{monetization.net_payout_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">85% Net Revenue (Sandbox Ledger)</p>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="p-3 bg-notion-sidebar rounded-md border border-notion-border text-xs text-notion-muted space-y-1">
              <div className="flex items-center gap-2 font-medium text-notion-text">
                <HelpCircle className="w-3.5 h-3.5 text-notion-muted" />
                Ledger Settlement Information
              </div>
              <p>
                Nalanda operates in a transparent sandbox ledger mode for test author monetization. Real payment gateway integrations (Razorpay, Stripe, UPI Intent) hook seamlessly into these ledger schemas.
              </p>
            </div>

            {/* Simulated Orders Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-notion-text flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-notion-muted" /> Order & Transaction Ledger ({monetization.ledger.length})
                </h3>
              </div>

              {monetization.ledger.length === 0 ? (
                <div className="bg-white rounded-md border border-notion-border p-6 text-center text-xs text-notion-muted">
                  No purchase transactions recorded yet for this educator account.
                </div>
              ) : (
                <div className="bg-white rounded-md border border-notion-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-notion-sidebar text-notion-muted border-b border-notion-border font-mono text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Receipt / Order ID</th>
                          <th className="py-2.5 px-3">Learner</th>
                          <th className="py-2.5 px-3">Item Type</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Net (85%)</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-notion-border">
                        {monetization.ledger.map((row: any) => (
                          <tr key={row.id} className="hover:bg-notion-bg">
                            <td className="py-2.5 px-3 font-mono font-medium text-notion-text">
                              {row.receipt_number || row.id}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-notion-text block">{row.buyer_name}</span>
                              <span className="text-[10px] text-notion-muted font-mono">{row.buyer_email}</span>
                            </td>
                            <td className="py-2.5 px-3 capitalize font-mono text-notion-text">
                              {row.item_type?.replace('_', ' ')}
                            </td>
                            <td className="py-2.5 px-3 uppercase font-mono text-notion-muted text-[10px]">
                              {row.payment_method || 'UPI'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-notion-text">
                              ₹{row.amount_inr}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-emerald-700">
                              ₹{row.creator_earnings_inr || Math.round(row.amount_inr * 0.85)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {row.payment_status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-notion-muted font-mono text-[11px]">
                              {new Date(row.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-5 bg-white rounded-md border border-notion-border space-y-4">
              <div>
                <h2 className="font-semibold text-sm text-notion-text">
                  Educator Faculty Profile
                </h2>
                <p className="text-xs text-notion-muted mt-0.5">
                  These credentials and bio will be presented on your public profile and alongside all authored tests.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">
                    Academic Headline / Chair Title
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Faculty - Quantitative Aptitude & Exam Pedagogy"
                    className="w-full px-2.5 py-1.5 rounded-md border border-notion-border bg-white text-notion-text text-xs focus:border-notion-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">
                    Affiliated Institute or Department
                  </label>
                  <input
                    type="text"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    placeholder="e.g. Nalanda Academic Council / Apex Civil Services Institute"
                    className="w-full px-2.5 py-1.5 rounded-md border border-notion-border bg-white text-notion-text text-xs focus:border-notion-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">
                    Academic Pedagogical Philosophy / Bio
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your subject mastery, exam focus, and test crafting principles..."
                    className="w-full px-2.5 py-1.5 rounded-md border border-notion-border bg-white text-notion-text text-xs focus:border-notion-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">
                    Specialization Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    value={specializationsInput}
                    onChange={(e) => setSpecializationsInput(e.target.value)}
                    placeholder="e.g. Quantitative Aptitude, General Studies, Logical Reasoning"
                    className="w-full px-2.5 py-1.5 rounded-md border border-notion-border bg-white text-notion-text text-xs focus:border-notion-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={publicationStatus}
                    onChange={(e) => setPublicationStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="active">Active (Accepting learners & publishing tests)</option>
                    <option value="paused">Paused (Hide from discovery, retain existing learners)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-mono">
                    Faculty Verification: <strong>{educator.verification_status}</strong>
                  </span>
                  <Button variant="primary" size="sm" type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Quick Series Create Modal */}
      {showCreateSeriesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Create New Master Test Series
              </h3>
              <button
                onClick={() => setShowCreateSeriesModal(false)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Series Title</label>
                <input
                  type="text"
                  required
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  placeholder="e.g. SSC CGL 2026 Tier-I 10-Mock Master Series"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newSeriesDesc}
                  onChange={(e) => setNewSeriesDesc(e.target.value)}
                  placeholder="Describe the series structure, exam target, and test sequence..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Target Exam</label>
                  <select
                    value={newSeriesExam}
                    onChange={(e) => setNewSeriesExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="exam-ssc-cgl-2026">SSC CGL 2026</option>
                    <option value="exam-neet-ug-2026">NEET UG 2026</option>
                    <option value="exam-jee-adv-2026">JEE Advanced 2026</option>
                    <option value="exam-upsc-cse-2026">UPSC CSE 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Access Tier</label>
                  <select
                    value={newSeriesPaid ? 'paid' : 'free'}
                    onChange={(e) => setNewSeriesPaid(e.target.value === 'paid')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="free">Free Access</option>
                    <option value="paid">Paid Master Bundle</option>
                  </select>
                </div>
              </div>

              {newSeriesPaid && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bundle Price (₹ INR)</label>
                  <input
                    type="number"
                    min="1"
                    value={newSeriesPrice}
                    onChange={(e) => setNewSeriesPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreateSeriesModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={creatingSeries}>
                  {creatingSeries ? 'Creating...' : 'Establish Series'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
