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
  Library,
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
  const [selectedAccess, setSelectedAccess] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recently_published');

  const [tests, setTests] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);

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
        <div className="fixed bottom-6 right-6 z-50 bg-[#37352f] text-white text-xs px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Library}
          title="Public Assessment Library"
          description="Curated CBE mocks, sectional drills, and master series published by verified faculty and academic chairs."
          badge={<Badge variant="emerald" size="sm">Open Resource</Badge>}
          actions={
            <Link href="/tests/create">
              <Button variant="primary" size="sm">
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Publish Test
              </Button>
            </Link>
          }
        />

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'tests'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white border border-[#ebebeb] text-[#787774] hover:bg-[#f7f6f3]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Individual Tests</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'tests' ? 'bg-[#4f4d47]' : 'bg-[#f7f6f3]'}`}>
                {tests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('series')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'series'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white border border-[#ebebeb] text-[#787774] hover:bg-[#f7f6f3]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Test Series</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'series' ? 'bg-[#4f4d47]' : 'bg-[#f7f6f3]'}`}>
                {testSeries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('creators')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'creators'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white border border-[#ebebeb] text-[#787774] hover:bg-[#f7f6f3]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Verified Educators</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'creators' ? 'bg-[#4f4d47]' : 'bg-[#f7f6f3]'}`}>
                {creators.length}
              </span>
            </button>
          </div>

          {activeTab === 'tests' && hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#787774] hover:text-[#e03e3e] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* TAB 1: INDIVIDUAL TESTS */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white border border-[#ebebeb] rounded-lg p-3 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-[#787774] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tests by title, subject, formula, or creator..."
                    aria-label="Search tests by title, subject, formula, or creator"
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded-md focus:bg-white focus:outline-none focus:border-[#37352f] text-[#37352f] placeholder-[#9b9a97]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#37352f]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <span className="text-xs text-[#787774] whitespace-nowrap">Sort:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded-md text-[#37352f] focus:outline-none"
                  >
                    <option value="recently_published">Recently Published</option>
                    <option value="most_attempted">Most Attempted</option>
                    <option value="highest_rated">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Faceted Filter Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#ebebeb]">
                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Exam
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
                  >
                    {EXAMS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
                  >
                    {TEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Duration
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
                  >
                    <option value="all">Any Duration</option>
                    <option value="short">≤ 30 mins</option>
                    <option value="medium">30 - 60 mins</option>
                    <option value="long">&gt; 60 mins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#787774] uppercase tracking-wider mb-0.5">
                    Trust
                  </label>
                  <select
                    value={selectedTrust}
                    onChange={(e) => setSelectedTrust(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#fbfbfa] border border-[#ebebeb] rounded text-[#37352f] focus:outline-none"
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
              <div className="py-20 flex flex-col items-center justify-center space-y-2">
                <div className="w-5 h-5 border-2 border-[#37352f] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#787774] font-mono">Filtering repositories...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="bg-white border border-[#ebebeb] rounded-lg p-10 text-center space-y-3">
                <Search className="w-8 h-8 text-[#9b9a97] mx-auto" />
                <h3 className="font-semibold text-sm text-[#37352f]">No Tests Found</h3>
                <p className="text-xs text-[#787774] max-w-sm mx-auto">
                  Try clearing some filter constraints or searching for broader subject keywords.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-lg border border-[#ebebeb] hover:border-[#d4d4d4] transition-colors flex flex-col justify-between p-4 space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <TrustLabel label={test.trust_label} size="sm" showTooltip />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleBookmarkToggle(test.id)}
                            title={test.is_bookmarked ? 'Remove bookmark' : 'Save test'}
                            className={`p-1 rounded border text-xs transition-colors ${
                              test.is_bookmarked
                                ? 'bg-[#fdf5e8] border-[#fae2be] text-[#8f4f00]'
                                : 'bg-[#fbfbfa] border-[#ebebeb] text-[#787774] hover:bg-[#f7f6f3]'
                            }`}
                          >
                            <Bookmark className={`w-3 h-3 ${test.is_bookmarked ? 'fill-amber-600' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleShare(test.id, test.title)}
                            title="Share test link"
                            className="p-1 rounded border border-[#ebebeb] bg-[#fbfbfa] text-[#787774] hover:bg-[#f7f6f3] transition-colors"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]">
                          {test.subject || 'General Studies'}
                        </span>
                        <Badge variant="blue" size="sm">
                          {formatTestType(test.test_type)}
                        </Badge>
                        <Badge
                          variant={test.difficulty === 'hard' ? 'rose' : test.difficulty === 'medium' ? 'amber' : 'emerald'}
                          size="sm"
                        >
                          {test.difficulty || 'medium'}
                        </Badge>
                        <Badge variant={test.is_paid ? 'gray' : 'emerald'} size="sm">
                          {test.is_paid ? `₹${test.price_inr || 149}` : 'Free'}
                        </Badge>
                      </div>

                      <div>
                        <Link
                          href={`/tests/${test.id}`}
                          className="font-medium text-xs sm:text-sm text-[#37352f] hover:underline line-clamp-1 leading-snug"
                        >
                          {test.title}
                        </Link>
                        {test.description && (
                          <p className="text-xs text-[#787774] line-clamp-2 mt-1 leading-relaxed">
                            {test.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#f7f6f3] flex items-center justify-between text-xs">
                        <Link
                          href={`/creators/${test.user_id}`}
                          className="flex items-center gap-1.5 text-[#787774] hover:text-[#37352f]"
                        >
                          <div className="w-4 h-4 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb] flex items-center justify-center font-bold text-[9px]">
                            {test.created_by_name?.charAt(0) || 'F'}
                          </div>
                          <span className="truncate max-w-[120px] text-[11px]">
                            {test.created_by_name || 'Nalanda Faculty'}
                          </span>
                        </Link>

                        <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#37352f]">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{Number(test.rating || 4.8).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#ebebeb] space-y-2">
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[#787774] text-[11px] font-mono">
                        <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                          <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Qs</span>
                          <span className="font-medium text-[#37352f]">{test.question_count || 25}</span>
                        </div>
                        <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                          <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Time</span>
                          <span className="font-medium text-[#37352f]">{formatDuration(test.duration_seconds)}</span>
                        </div>
                        <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                          <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Tries</span>
                          <span className="font-medium text-[#37352f]">{test.attempts_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <Link href={`/tests/${test.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Blueprint
                          </Button>
                        </Link>
                        <Link href={`/tests/${test.id}/start`} className="flex-1">
                          <Button variant="primary" size="sm" className="w-full text-xs">
                            <Play className="w-3 h-3 mr-1 fill-current" />
                            Take Exam
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

        {/* TAB 2: TEST SERIES */}
        {activeTab === 'series' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSeries.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-white rounded-lg border border-[#ebebeb] hover:border-[#d4d4d4] transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]">
                          {s.exam_title || 'SSC CGL 2026'}
                        </span>
                        <Badge variant={s.is_paid ? 'gray' : 'emerald'} size="sm">
                          {s.is_paid ? `₹${s.price_inr}` : 'Free'}
                        </Badge>
                        <span className="text-[11px] text-[#787774] font-mono">
                          {s.total_tests || 10} Mock Exams
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[#37352f]">
                        {s.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#37352f] shrink-0 bg-[#fbfbfa] px-1.5 py-0.5 rounded border border-[#ebebeb]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{Number(s.rating || 4.9).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#787774]">
                    <span>By {s.creator_name || 'Senior Faculty'}</span>
                    {s.creator_institute && <span> • {s.creator_institute}</span>}
                  </div>

                  <p className="text-xs text-[#787774] leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-3">
                  <div className="text-xs text-[#787774] flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-[#9b9a97]" />
                    <span>{(s.enrolled_count || 1200).toLocaleString()} enrolled</span>
                  </div>

                  <Link href={`/series/${s.id}`}>
                    <Button variant="primary" size="sm">
                      Access Series <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: VERIFIED EDUCATORS */}
        {activeTab === 'creators' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-lg border border-[#ebebeb] p-4 hover:border-[#d4d4d4] transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-md bg-[#f7f6f3] border border-[#ebebeb] text-[#37352f] flex items-center justify-center font-semibold text-sm">
                      {creator.name?.charAt(0) || 'E'}
                    </div>
                    <button
                      onClick={() => handleFollowToggle(creator.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        creator.is_following
                          ? 'bg-[#f7f6f3] text-[#787774] border border-[#ebebeb] hover:bg-[#fff0f0] hover:text-[#e03e3e]'
                          : 'bg-[#37352f] text-white hover:bg-[#22211e]'
                      }`}
                    >
                      {creator.is_following ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#37352f]">{creator.name}</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-[#787774]">{creator.headline}</p>
                    <p className="text-[10px] text-[#9b9a97]">{creator.institute_name}</p>
                  </div>

                  <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed">
                    {creator.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(creator.specializations || []).slice(0, 3).map((subj: string) => (
                      <span
                        key={subj}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb] font-mono"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ebebeb] space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono text-[#787774]">
                    <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                      <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Students</span>
                      <span className="font-medium text-[#37352f]">{creator.total_students || 1200}</span>
                    </div>
                    <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                      <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Papers</span>
                      <span className="font-medium text-[#37352f]">{creator.published_tests_count || 12}</span>
                    </div>
                    <div className="bg-[#fbfbfa] p-1 rounded border border-[#ebebeb]">
                      <span className="block text-[#9b9a97] text-[9px] uppercase font-sans">Followers</span>
                      <span className="font-medium text-[#37352f]">{creator.followers_count || 0}</span>
                    </div>
                  </div>

                  <Link href={`/creators/${creator.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Educator Portfolio <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
