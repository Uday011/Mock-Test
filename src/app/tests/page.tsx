'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileCheck,
  Play,
  Clock,
  Award,
  Search,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  BarChart2,
  Calendar,
  Zap,
  Target,
  PenTool,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type TestTab = 'all' | 'full_mock' | 'sectional' | 'pyq';

function TestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = (searchParams.get('type') || 'all') as TestTab;
  const [activeTab, setActiveTab] = useState<TestTab>(typeParam);

  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeParam && ['all', 'full_mock', 'sectional', 'pyq'].includes(typeParam)) {
      setActiveTab(typeParam);
    }
  }, [typeParam]);

  const handleTabChange = (tab: TestTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('type');
    } else {
      params.set('type', tab);
    }
    router.replace(`/tests?${params.toString()}`);
  };

  const fetchTests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('test_type', activeTab);
    if (selectedSubject !== 'all') params.set('subject_id', selectedSubject);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());

    fetch(`/api/tests?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tests) setTests(data.tests);
      })
      .catch((err) => console.error('Error fetching tests:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab, selectedSubject, selectedDifficulty, searchQuery]);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No limit';
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hrs`;
    }
    return `${mins} mins`;
  };

  const getReadableTypeName = (type: string) => {
    switch (type) {
      case 'full_mock':
        return 'Full Mock (120m)';
      case 'previous_year_paper':
        return 'CAT Official PYQ';
      case 'sectional_test':
        return 'Sectional Drill (40m)';
      case 'subject_test':
        return 'Section Test';
      case 'topic_test':
        return 'Topic Speed Test';
      case 'community_test':
        return 'All India Challenge';
      default:
        return 'CAT Test';
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Mocks' },
        {
          label:
            activeTab === 'full_mock'
              ? 'Full Mocks'
              : activeTab === 'sectional'
              ? 'Sectional Mocks'
              : activeTab === 'pyq'
              ? 'Previous Year Papers'
              : 'All Mocks',
        },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="border-b border-[#E6E6E3] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#787774] mb-1">
              <span>CAT 2026 Simulation</span>
              <span>•</span>
              <span>Computer Based Test (CBT) Environment</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
              Mock Tests & Simulators
            </h1>
          </div>

          {/* Tab Filter Switcher & Create Test Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex items-center bg-[#EAEAE7] p-1 rounded-xl text-xs w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Mocks' },
                { id: 'full_mock', label: 'Full Mocks (120m)' },
                { id: 'sectional', label: 'Sectionals (40m)' },
                { id: 'pyq', label: 'PYQs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TestTab)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all min-h-[38px] text-center truncate cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#202124] shadow-xs'
                      : 'text-[#787774] hover:text-[#202124]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link href="/tests/create" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] bg-[#4F46A5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs active:scale-98 transition-all cursor-pointer">
                <PenTool className="w-3.5 h-3.5" />
                <span>Create Test</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E6E6E3] rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title, slot, or year..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E6E6E3] focus:border-[#202124] focus:outline-none placeholder:text-[#787774] min-h-[40px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Section Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 text-xs rounded-lg border border-[#E6E6E3] bg-white text-[#202124] focus:outline-none focus:border-[#202124] w-full sm:w-auto min-h-[40px]"
            >
              <option value="all">All Sections</option>
              <option value="varc">VARC</option>
              <option value="dilr">DILR</option>
              <option value="qa">QA</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="p-2 text-xs rounded-lg border border-[#E6E6E3] bg-white text-[#202124] focus:outline-none focus:border-[#202124] w-full sm:w-auto min-h-[40px]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (Benchmark)</option>
              <option value="medium">Medium (Standard CAT)</option>
              <option value="hard">Hard (IIM Tough Slot)</option>
            </select>
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading test simulators...
          </div>
        ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tests.map((t) => {
              const typeName = getReadableTypeName(t.test_type);
              const hasAttempted = Boolean(t.user_attempts_count && t.user_attempts_count > 0);
              const isFull = t.test_type === 'full_mock' || t.test_type === 'community_test' || t.test_type === 'previous_year_paper';

              return (
                <div
                  key={t.id}
                  className="p-5 bg-white border border-[#E6E6E3] rounded-xl hover:border-[#D4D4D1] shadow-2xs transition-all flex flex-col justify-between space-y-4 text-xs"
                >
                  <div className="space-y-3">
                    {/* Tags / Metadata */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] font-medium">
                          {typeName}
                        </span>
                        {isFull ? (
                          <span className="text-[11px] text-[#4338CA] font-medium bg-[#EEF2FF] px-2 py-0.5 rounded">
                            VARC • DILR • QA
                          </span>
                        ) : t.subject ? (
                          <span className="text-[11px] text-[#787774] truncate max-w-[140px]">
                            {t.subject}
                          </span>
                        ) : null}
                      </div>

                      {t.difficulty && (
                        <Badge
                          variant={
                            t.difficulty === 'hard'
                              ? 'rose'
                              : t.difficulty === 'medium'
                              ? 'amber'
                              : 'emerald'
                          }
                          size="sm"
                        >
                          {t.difficulty}
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-semibold text-sm text-[#202124] leading-snug">
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-[11px] text-[#787774] mt-1 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}
                    </div>

                    {/* Previous Attempt Summary if available */}
                    {hasAttempted && (
                      <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Attempted</span>
                        </div>
                        {t.best_score !== null && (
                          <span className="font-mono font-semibold text-[#202124]">
                            Score: {t.best_score} pts
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Test Specs & Action Button */}
                  <div className="pt-3 border-t border-[#F1F1EF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-[#787774] text-center sm:text-left space-x-2">
                      <span className="font-medium text-[#202124]">
                        {t.question_count || t.total_questions || (isFull ? 66 : 22)} Qs
                      </span>
                      <span>•</span>
                      <span>{formatDuration(t.duration_seconds)}</span>
                      <span>•</span>
                      <span>+3 / -1</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {hasAttempted ? (
                        <Link
                          href={`/exam/${t.last_attempt_id || t.id}/result`}
                          className="flex-1 sm:flex-none"
                        >
                          <button className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 min-h-[40px] rounded-lg border border-[#E6E6E3] text-[#202124] text-xs font-semibold hover:bg-[#F1F1EF] active:scale-95 transition-all text-center">
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span>Analysis</span>
                          </button>
                        </Link>
                      ) : null}
                      <Link href={`/tests/${t.id}`} className="flex-1 sm:flex-none">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-[#202124] text-white text-xs font-semibold hover:bg-[#333538] active:scale-95 transition-all shadow-xs cursor-pointer">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{hasAttempted ? 'Re-take Test' : 'Launch Simulator'}</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white border border-[#E6E6E3] rounded-xl text-center space-y-3">
            <FileCheck className="w-8 h-8 mx-auto text-[#787774]" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#202124]">No Tests Found</h3>
              <p className="text-xs text-[#787774] max-w-sm mx-auto">
                No mock tests match your current section or difficulty filters.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedSubject('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                  router.replace('/tests');
                }}
                className="px-4 py-2 border border-[#E6E6E3] text-[#202124] text-xs font-medium rounded-lg hover:bg-[#F7F7F5] transition-all cursor-pointer"
              >
                Reset Filters
              </button>
              <Link href="/tests/create">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46A5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Create Custom Test</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function TestsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading test simulators...
          </div>
        </AppShell>
      }
    >
      <TestsContent />
    </Suspense>
  );
}
