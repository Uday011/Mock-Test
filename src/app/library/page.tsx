'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Bookmark,
  Share2,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Star,
  Layers,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Check,
  Flame,
  ArrowRight,
  SlidersHorizontal,
  X,
  FileCheck2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrustLabel, TrustLabelType } from '@/components/ui/TrustLabel';

const TEST_TYPES = [
  { value: 'all', label: 'All Test Types' },
  { value: 'full_length_mock', label: 'Full-length Mock' },
  { value: 'sectional_test', label: 'Sectional Test' },
  { value: 'subject_test', label: 'Subject Test' },
  { value: 'chapter_test', label: 'Chapter Test' },
  { value: 'topic_test', label: 'Topic Test' },
  { value: 'subtopic_test', label: 'Subtopic Test' },
  { value: 'previous_year_paper', label: 'Previous Year Paper' },
  { value: 'mixed_revision_test', label: 'Mixed Revision Test' },
  { value: 'custom_practice', label: 'Custom Test' },
  { value: 'community_test', label: 'Community Test' },
  { value: 'educator_test', label: 'Educator Test' },
];

const TRUST_LABELS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Trust Labels' },
  { value: 'Nalanda Official', label: 'Nalanda Official' },
  { value: 'Educator Published', label: 'Educator Published' },
  { value: 'Reviewed', label: 'Peer Reviewed' },
  { value: 'Source Linked', label: 'Source Linked' },
  { value: 'Community Created', label: 'Community Created' },
  { value: 'AI Assisted', label: 'AI Assisted' },
];

const EXAMS = [
  { value: 'all', label: 'All Target Exams' },
  { value: 'exam-ssc-cgl-2026', label: 'SSC CGL 2026' },
  { value: 'exam-neet-ug-2026', label: 'NEET UG 2026' },
  { value: 'exam-upsc-cse-2026', label: 'UPSC CSE 2026' },
];

const SUBJECTS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'Quantitative Aptitude', label: 'Quantitative Aptitude' },
  { value: 'General Intelligence', label: 'General Intelligence & Reasoning' },
  { value: 'General Awareness', label: 'General Awareness' },
  { value: 'English Comprehension', label: 'English Comprehension' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Indian Polity', label: 'Indian Polity' },
];

export default function PublicLibraryPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'series' | 'creators'>('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedTrust, setSelectedTrust] = useState('all');
  const [selectedAccess, setSelectedAccess] = useState('all'); // 'all', 'free', 'paid'
  const [selectedSort, setSelectedSort] = useState('recently_published');

  const [tests, setTests] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load Library Data
  const loadLibraryData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedExam !== 'all') params.set('exam_id', selectedExam);
    if (selectedSubject !== 'all') params.set('subject_id', selectedSubject);
    if (selectedType !== 'all') params.set('test_type', selectedType);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (selectedDuration !== 'all') params.set('duration', selectedDuration);
    if (selectedTrust !== 'all') params.set('trust_label', selectedTrust);
    if (selectedAccess === 'free') params.set('is_paid', '0');
    if (selectedAccess === 'paid') params.set('is_paid', '1');
    params.set('sort', selectedSort);

    fetch(`/api/library?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTests(data.tests || []);
          setTestSeries(data.test_series || []);
          setCreators(data.creators || []);
        }
      })
      .catch((err) => console.error('Failed to load library:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLibraryData();
    }, 200);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    selectedExam,
    selectedSubject,
    selectedType,
    selectedDifficulty,
    selectedDuration,
    selectedTrust,
    selectedAccess,
    selectedSort,
  ]);

  const handleBookmarkToggle = async (testId: string) => {
    try {
      const res = await fetch(`/api/tests/${testId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, is_bookmarked: data.bookmarked } : t))
        );
        showToast(data.message);
      }
    } catch (err) {
      console.error('Failed to bookmark test:', err);
    }
  };

  const handleFollowToggle = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/creators/${creatorId}/follow`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, is_following: data.following, followers_count: data.followers_count }
              : c
          )
        );
        showToast(data.message);
      }
    } catch (err) {
      console.error('Failed to follow creator:', err);
    }
  };

  const handleShare = (testId: string, title: string) => {
    const url = `${window.location.origin}/tests/${testId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link copied for "${title}"`);
    } else {
      showToast(`Test URL: ${url}`);
    }
  };

  const showToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Untimed';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const formatTestType = (type: string) => {
    if (!type) return 'Practice Test';
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedExam('all');
    setSelectedSubject('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedDuration('all');
    setSelectedTrust('all');
    setSelectedAccess('all');
    setSelectedSort('recently_published');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedExam !== 'all' ||
    selectedSubject !== 'all' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedDuration !== 'all' ||
    selectedTrust !== 'all' ||
    selectedAccess !== 'all';

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Public Library', href: '/library' },
      ]}
    >
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Public Assessment Library & Question Repositories"
        description="Explore, practice, and benchmark curated CBE mocks and question papers published by verified academic faculty, coaching chairs, and the open community."
        badge={<Badge variant="emerald" size="md">Open Educational Resource</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/tests/create">
              <Button variant="primary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                Publish Test Paper
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Callouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCallout
          label="Curated Test Papers"
          value={tests.length > 0 ? String(tests.length) : '18+'}
          subtext="Verified CBE diagnostics"
          accent="navy"
          icon={<FileCheck2 className="w-4 h-4" />}
        />
        <MetricCallout
          label="Published Master Series"
          value={testSeries.length > 0 ? String(testSeries.length) : '4'}
          subtext="Structured curriculum bundles"
          accent="saffron"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <MetricCallout
          label="Verified Educators"
          value={creators.length > 0 ? String(creators.length) : '10'}
          subtext="Faculty & Subject Chairs"
          accent="emerald"
          icon={<GraduationCap className="w-4 h-4" />}
        />
        <MetricCallout
          label="Learner Benchmarks"
          value="4.92 / 5"
          subtext="Transparent quality metrics"
          accent="stone"
          icon={<Star className="w-4 h-4" />}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-stone-200 mb-6 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'tests'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Individual Tests
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
              {tests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'series'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Test Series
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
              {testSeries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'creators'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Verified Educators
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
              {creators.length}
            </span>
          </button>
        </div>

        {activeTab === 'tests' && hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* TAB 1: INDIVIDUAL TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests by title, subject, formula, or creator..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="recently_published">Recently Published</option>
                  <option value="most_attempted">Most Attempted</option>
                  <option value="highest_rated">Highest Quality Rating</option>
                </select>
              </div>
            </div>

            {/* Faceted Filter Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-stone-100">
              {/* Exam */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Exam
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  {EXAMS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Type */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Test Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  {TEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Foundational (Easy)</option>
                  <option value="medium">Standard (Medium)</option>
                  <option value="hard">Advanced (Hard)</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  <option value="all">Any Duration</option>
                  <option value="short">Speed Drill (≤ 30 min)</option>
                  <option value="medium">Standard (30 - 60 min)</option>
                  <option value="long">Full Mock (&gt; 60 min)</option>
                </select>
              </div>

              {/* Trust Badge */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Provenance
                </label>
                <select
                  value={selectedTrust}
                  onChange={(e) => setSelectedTrust(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  {TRUST_LABELS.map((tl) => (
                    <option key={tl.value} value={tl.value}>
                      {tl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Test Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-500 font-medium">Filtering public question repositories...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-stone-900">No Tests Found Matching Filters</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try clearing some filter constraints or searching for broader subject keywords like &quot;Quantitative&quot; or &quot;Biology&quot;.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map((test) => {
                return (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between p-5 space-y-4"
                  >
                    {/* Top Row: Trust Label + Bookmark */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <TrustLabel label={test.trust_label} size="sm" showTooltip />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleBookmarkToggle(test.id)}
                            title={test.is_bookmarked ? 'Remove bookmark' : 'Save test'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              test.is_bookmarked
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                            }`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${test.is_bookmarked ? 'fill-amber-500' : ''}`}
                            />
                          </button>
                          <button
                            onClick={() => handleShare(test.id, test.title)}
                            title="Share test link"
                            className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 hover:text-stone-700 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subject & Type Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {test.subject || 'General Studies'}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-50 text-stone-600 border border-stone-200">
                          {formatTestType(test.test_type)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                            test.difficulty === 'hard'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : test.difficulty === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {test.difficulty || 'medium'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <Link
                          href={`/tests/${test.id}`}
                          className="font-serif font-bold text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 text-sm leading-snug"
                        >
                          {test.title}
                        </Link>
                        {test.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {test.description}
                          </p>
                        )}
                      </div>

                      {/* Creator Attribution */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <Link
                          href={`/creators/${test.user_id}`}
                          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 group"
                        >
                          <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                            {test.created_by_name?.charAt(0) || 'F'}
                          </div>
                          <div className="truncate max-w-[150px]">
                            <span className="font-semibold text-stone-800 block truncate group-hover:underline">
                              {test.created_by_name || 'Nalanda Faculty'}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {test.creator_institute || 'Academic Board'}
                            </span>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{Number(test.rating || 4.8).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-3 border-t border-stone-100 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-stone-600 text-[11px] font-mono">
                        <div className="bg-stone-50 p-1.5 rounded-lg border border-stone-200/70">
                          <span className="block text-stone-400 text-[9px] uppercase font-sans">Questions</span>
                          <span className="font-bold text-stone-800">{test.question_count || 25}</span>
                        </div>
                        <div className="bg-stone-50 p-1.5 rounded-lg border border-stone-200/70">
                          <span className="block text-stone-400 text-[9px] uppercase font-sans">Duration</span>
                          <span className="font-bold text-stone-800">{formatDuration(test.duration_seconds)}</span>
                        </div>
                        <div className="bg-stone-50 p-1.5 rounded-lg border border-stone-200/70">
                          <span className="block text-stone-400 text-[9px] uppercase font-sans">Attempts</span>
                          <span className="font-bold text-stone-800">{test.attempts_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link href={`/tests/${test.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full text-xs">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/tests/${test.id}/start`} className="flex-1">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                            icon={<Play className="w-3 h-3 fill-current" />}
                          >
                            Take Exam
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEST SERIES */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testSeries.map((s) => (
            <Card key={s.id} className="p-6 bg-white hover:border-stone-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {s.exam_title || 'SSC CGL 2026'}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {s.total_tests || 10} Mock Exams
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {s.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 shrink-0 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{Number(s.rating || 4.9).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-stone-500 space-y-0.5">
                  <div className="font-semibold text-stone-800">{s.creator_name || 'Senior Academic Faculty'}</div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {s.creator_institute || 'Nalanda Academic Board'}
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-1">
                  {s.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200 rounded font-medium">
                    ✓ Full Cognitive Forensics
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200 rounded font-medium">
                    ✓ Sectional Percentile Benchmarks
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200 rounded font-medium">
                    ✓ TCS Interface Emulation
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-stone-100 flex items-center justify-between gap-3 mt-4">
                <div className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{(s.enrolled_count || 1200).toLocaleString()} Aspirants Enrolled</span>
                </div>

                <Link href="/tests">
                  <Button variant="saffron" size="sm">
                    Access Series <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: VERIFIED EDUCATORS */}
      {activeTab === 'creators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-serif font-bold text-lg">
                    {creator.name?.charAt(0) || 'E'}
                  </div>
                  <button
                    onClick={() => handleFollowToggle(creator.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      creator.is_following
                        ? 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {creator.is_following ? 'Following' : 'Follow'}
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-serif font-bold text-stone-900">{creator.name}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium">{creator.headline}</p>
                  <p className="text-[10px] text-stone-400">{creator.institute_name}</p>
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {creator.bio}
                </p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1">
                  {(creator.specializations || []).slice(0, 3).map((subj: string) => (
                    <span
                      key={subj}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 font-mono"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Creator stats */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-stone-600">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    <span className="block text-stone-400 text-[9px] uppercase font-sans">Students</span>
                    <span className="font-bold text-stone-800">{creator.total_students || 1200}</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    <span className="block text-stone-400 text-[9px] uppercase font-sans">Papers</span>
                    <span className="font-bold text-stone-800">{creator.published_tests_count || 12}</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    <span className="block text-stone-400 text-[9px] uppercase font-sans">Followers</span>
                    <span className="font-bold text-stone-800">{creator.followers_count || 0}</span>
                  </div>
                </div>

                <Link href={`/creators/${creator.id}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    View Educator Portfolio <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
