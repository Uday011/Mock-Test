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
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Educator Sandbox Active:</strong> Monetization metrics, payout ledgers, and student checkout records reflect Nalanda simulated test environment.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 shrink-0">
            Sandbox Tier
          </span>
        </div>

        {/* Educator Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center justify-center font-serif font-bold text-2xl shrink-0">
                {educator.name?.charAt(0) || 'E'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    {educator.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {educator.verification_status === 'verified' ? 'Verified Faculty' : 'Faculty Verification Pending'}
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    educator.publication_status === 'active'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-stone-100 text-stone-600 border border-stone-300'
                  }`}>
                    {educator.publication_status === 'active' ? 'Publishing Active' : 'Publishing Paused'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {educator.headline} • <span className="font-medium text-stone-800">{educator.institute_name}</span>
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-stone-500 font-mono">
                    {stats.total_published} Tests Published • {stats.total_series} Series • {stats.total_attempts} Attempts Recorded
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link href={`/creators/${educator.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Public Portfolio
                </Button>
              </Link>
              <button
                onClick={() => setShowCreateSeriesModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors shadow-2xs"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
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
        <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'overview'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'tests'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Authored Tests ({tests.length})
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'series'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Test Series ({test_series.length})
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'monetization'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Monetization & Ledger
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 px-2 ${
              activeTab === 'profile'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
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
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Published</span>
                <span className="text-xl font-serif font-bold text-stone-900 block mt-1">
                  {stats.total_published}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Live in Library</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Drafts</span>
                <span className="text-xl font-serif font-bold text-stone-900 block mt-1">
                  {stats.total_drafts}
                </span>
                <span className="text-[10px] text-stone-500">In Test Studio</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">In Review</span>
                <span className="text-xl font-serif font-bold text-amber-800 block mt-1">
                  {stats.total_under_review}
                </span>
                <span className="text-[10px] text-amber-700">Admin Queue</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Total Attempts</span>
                <span className="text-xl font-serif font-bold text-stone-900 block mt-1">
                  {stats.total_attempts}
                </span>
                <span className="text-[10px] text-stone-500">Submissions</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Paid Content</span>
                <span className="text-xl font-serif font-bold text-stone-900 block mt-1">
                  {stats.paid_tests_count} Tests
                </span>
                <span className="text-[10px] text-stone-500">₹ Tier Pricing</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Net Accrued</span>
                <span className="text-xl font-serif font-bold text-emerald-700 block mt-1">
                  ₹{monetization.net_payout_inr.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">85% Share (Sim)</span>
              </div>
            </div>

            {/* Pending Moderation Notice if any */}
            {pending_reviews && pending_reviews.length > 0 && (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <h3 className="font-serif font-bold text-sm text-amber-950">
                    Content Under Review ({pending_reviews.length})
                  </h3>
                </div>
                <p className="text-xs text-amber-800">
                  The following assessment papers have been submitted for quality and copyright review. They will be visible publicly upon moderation approval.
                </p>
                <div className="space-y-2">
                  {pending_reviews.map((pr: any) => (
                    <div
                      key={pr.id}
                      className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900">{pr.title}</span>
                        <p className="text-stone-500 text-[11px]">
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
                <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-stone-700" /> Master Test Series ({test_series.length})
                </h2>
                <button
                  onClick={() => setShowCreateSeriesModal(true)}
                  className="text-xs text-amber-800 font-bold hover:underline"
                >
                  + Add New Series
                </button>
              </div>

              {test_series.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500 space-y-3">
                  <p>You haven't created any test series yet. Group your tests into structured sequences for learners.</p>
                  <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                    Create First Test Series
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {test_series.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {s.exam_title || 'Competitive Exam'}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            s.is_paid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}>
                            {s.is_paid ? `₹${s.price_inr}` : 'Free Series'}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm text-stone-900">{s.title}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2">{s.description}</p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-stone-500">
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
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-700" /> Recent Learner Submissions ({recent_activity.length})
              </h2>

              {recent_activity.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                  No learner test submissions recorded yet on your authored tests.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-mono text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Learner</th>
                          <th className="py-3 px-4">Test Title</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">Accuracy</th>
                          <th className="py-3 px-4">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {recent_activity.map((act: any) => (
                          <tr key={act.attempt_id} className="hover:bg-stone-50/50">
                            <td className="py-3 px-4">
                              <span className="font-bold text-stone-900 block">{act.learner_name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">{act.learner_email}</span>
                            </td>
                            <td className="py-3 px-4 font-medium text-stone-800">{act.test_title}</td>
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                              {act.final_score} / {act.maximum_marks}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-emerald-700 font-bold">{act.accuracy}%</span>
                            </td>
                            <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
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
            <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-stone-400 uppercase text-[10px] font-bold">Status:</span>
                {['all', 'published', 'draft', 'under_review'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTestStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      testStatusFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-stone-400 uppercase text-[10px] font-bold">Pricing:</span>
                {['all', 'free', 'paid'].map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setTestPriceFilter(pr)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      testPriceFilter === pr
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Cards List */}
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500 space-y-3">
                <p>No tests match the selected filter criteria.</p>
                <Link href="/tests/create">
                  <Button variant="primary" size="sm">
                    Create New Test in Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTests.map((test: any) => (
                  <div
                    key={test.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-300 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          test.status === 'published' || !test.status
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : test.status === 'under_review'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-300'
                        }`}>
                          {test.status || 'published'}
                        </span>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          test.is_paid
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-stone-50 text-stone-700 border border-stone-200'
                        }`}>
                          {test.is_paid ? `₹${test.price_inr}` : 'Free'}
                        </span>

                        <span className="text-[10px] font-mono text-stone-400">
                          {test.subject || 'General'} • {test.difficulty || 'Medium'}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                        {test.title}
                      </h3>

                      {test.description && (
                        <p className="text-xs text-stone-500 line-clamp-1">{test.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-stone-500 font-mono flex-wrap">
                        <span>{test.question_count || 15} Questions</span>
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
                        <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
                          <strong>Admin Review Note:</strong> {test.review_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
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
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Preview Test
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
                <h2 className="font-serif font-bold text-base text-stone-900">
                  Curated Test Series & Sequences
                </h2>
                <p className="text-xs text-stone-500">
                  Package tests into sequential preparation journeys with free previews and bundled pricing.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Create Series
              </Button>
            </div>

            {test_series.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500 space-y-3">
                <p>No test series established yet.</p>
                <Button variant="primary" size="sm" onClick={() => setShowCreateSeriesModal(true)}>
                  Create Your First Test Series
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {test_series.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {s.exam_title || 'Competitive Exam'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          s.is_paid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {s.is_paid ? `₹${s.price_inr}` : 'Free Series'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-stone-900">{s.title}</h3>
                      <p className="text-xs text-stone-500 line-clamp-2">{s.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                        <span>{s.total_tests} Tests Mapped</span>
                        <span>{s.enrolled_count} Learners Enrolled</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/series/${s.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full text-xs">
                            Manage Sequence & Tests
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
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-mono uppercase text-stone-400 font-bold block">Gross Sales</span>
                <p className="text-2xl font-serif font-bold text-stone-900">
                  ₹{monetization.gross_sales_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500">Total volume processed in sandbox</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-mono uppercase text-stone-400 font-bold block">
                  Platform Processing Fee
                </span>
                <p className="text-2xl font-serif font-bold text-rose-700">
                  - ₹{monetization.platform_fee_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500">Standard 15% infrastructure deduction</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-mono uppercase text-stone-400 font-bold block">
                  Net Accrued Creator Payout
                </span>
                <p className="text-2xl font-serif font-bold text-emerald-700">
                  ₹{monetization.net_payout_inr.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">85% Net Revenue (Sandbox Ledger)</p>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                Ledger Settlement Information
              </div>
              <p>
                Nalanda operates in a transparent sandbox ledger mode for test author monetization. Real payment gateway integrations (Razorpay, Stripe, UPI Intent) will hook seamlessly into these ledger schemas without altering creator data models.
              </p>
            </div>

            {/* Simulated Orders Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-stone-700" /> Order & Transaction Ledger ({monetization.ledger.length})
                </h3>
              </div>

              {monetization.ledger.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
                  No purchase transactions recorded yet for this educator account.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-mono text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Receipt / Order ID</th>
                          <th className="py-3 px-4">Learner</th>
                          <th className="py-3 px-4">Item Type</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Net Payout (85%)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {monetization.ledger.map((row: any) => (
                          <tr key={row.id} className="hover:bg-stone-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                              {row.receipt_number || row.id}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-stone-900 block">{row.buyer_name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">{row.buyer_email}</span>
                            </td>
                            <td className="py-3 px-4 capitalize font-mono text-stone-700">
                              {row.item_type?.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 uppercase font-mono text-stone-500 text-[10px]">
                              {row.payment_method || 'UPI'}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                              ₹{row.amount_inr}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                              ₹{row.creator_earnings_inr || Math.round(row.amount_inr * 0.85)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {row.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
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
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-5">
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Educator Faculty Profile Details
              </h2>
              <p className="text-xs text-stone-500">
                These credentials and bio will be presented on your public profile and alongside all authored tests.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Academic Headline / Chair Title
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Faculty - Quantitative Aptitude & Exam Pedagogy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Affiliated Institute or Department
                  </label>
                  <input
                    type="text"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    placeholder="e.g. Nalanda Academic Council / Apex Civil Services Institute"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Academic Pedagogical Philosophy / Bio
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your subject mastery, exam focus, and test crafting principles..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Specialization Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    value={specializationsInput}
                    onChange={(e) => setSpecializationsInput(e.target.value)}
                    placeholder="e.g. Quantitative Aptitude, General Studies, Logical Reasoning"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
