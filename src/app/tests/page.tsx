'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Clock,
  Award,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Users,
  Calendar,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function TestDiscoveryPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedType !== 'all') params.set('test_type', selectedType);
    if (selectedSubject !== 'all') params.set('subject_id', selectedSubject);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (selectedDuration !== 'all') params.set('duration', selectedDuration);
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
    fetchTests();
  }, [selectedType, selectedSubject, selectedDifficulty, selectedDuration]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTests();
  };

  const testTypes = [
    { id: 'all', label: 'All Tests' },
    { id: 'full_mock', label: 'Full-Length Mocks' },
    { id: 'previous_year_paper', label: 'PYQ Papers' },
    { id: 'sectional_test', label: 'Sectional Drills' },
    { id: 'subject_test', label: 'Subject Tests' },
    { id: 'topic_test', label: 'Topic Tests' },
    { id: 'mixed_revision_test', label: 'Mixed Revision' },
    { id: 'educator_test', label: 'Educator Specials' },
    { id: 'community_test', label: 'Community Sprints' },
  ];

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No limit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'full_mock':
        return 'amber';
      case 'previous_year_paper':
        return 'purple';
      case 'sectional_test':
        return 'blue';
      case 'topic_test':
        return 'emerald';
      case 'mixed_revision_test':
        return 'rose';
      case 'educator_test':
        return 'brown';
      default:
        return 'gray';
    }
  };

  const getReadableTypeName = (type: string) => {
    switch (type) {
      case 'full_mock': return 'Full Mock';
      case 'previous_year_paper': return 'Official PYQ';
      case 'sectional_test': return 'Sectional Drill';
      case 'subject_test': return 'Subject Test';
      case 'topic_test': return 'Topic Assessment';
      case 'subtopic_test': return 'Subtopic Drill';
      case 'mixed_revision_test': return 'Mixed Revision';
      case 'educator_test': return 'Faculty Special';
      case 'community_test': return 'Community Mock';
      case 'chapter_test': return 'Chapter Test';
      default: return 'Practice Test';
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Testing Engine & Mock Hub' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Zap}
          title="Testing Engine & Mock Examination Hub"
          description="Authentic computer-based examination papers adhering strictly to TCS marking standards. Filter across 12 test formats from full-length mocks to targeted topical assessments."
          badge={<Badge variant="amber" size="sm">TCS CBE Testing System</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/mistakes">
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                  Mistake Notebook
                </Button>
              </Link>
              <Link href="/tests/create">
                <Button variant="primary" size="sm">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Author Test
                </Button>
              </Link>
            </div>
          }
        />

        {/* Database Filters */}
        <div className="space-y-3">
          {/* Test Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {testTypes.map((tt) => (
              <button
                key={tt.id}
                type="button"
                onClick={() => setSelectedType(tt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === tt.id
                    ? 'bg-[#202124] text-white'
                    : 'bg-white border border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
                }`}
              >
                {tt.label}
              </button>
            ))}
          </div>

          {/* Secondary Filter Row: Search & Selectors */}
          <div className="p-2.5 bg-white border border-[#E6E6E3] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests by title, topic, or exam..."
                aria-label="Search tests by title, topic, or exam"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E6E6E3] bg-[#F7F7F5] text-[#202124] placeholder:text-[#9b9a97] focus:outline-none focus:border-[#202124]"
              />
            </form>

            {/* Facet Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] text-[#202124] focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] text-[#202124] focus:outline-none"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (&lt;30m)</option>
                <option value="medium">Standard (30-60m)</option>
                <option value="long">Full Mock (&gt;60m)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests Database Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading tests catalog...
          </div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E6E6E3] rounded-lg space-y-3">
            <Layers className="w-8 h-8 text-[#9b9a97] mx-auto" />
            <h3 className="font-semibold text-sm text-[#202124]">No Tests Found</h3>
            <p className="text-xs text-[#787774] max-w-sm mx-auto">
              No examinations match the current filter selection. Try adjusting your search query or reset filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType('all');
                setSelectedDifficulty('all');
                setSelectedDuration('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {tests.map((test) => {
              const hasAttempted = test.attempts && test.attempts.length > 0;
              const isInProgress = test.last_attempt_status === 'in_progress';
              const bestAttempt = test.attempts ? test.attempts[0] : null;

              return (
                <div
                  key={test.id}
                  className="p-4 bg-white border border-[#E6E6E3] rounded-lg flex flex-col justify-between hover:border-[#d4d4d4] transition-colors space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                        {test.subject || 'Comprehensive'}
                      </span>
                      <Badge variant={getTypeBadgeVariant(test.test_type)} size="sm">
                        {getReadableTypeName(test.test_type)}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm text-[#202124] leading-snug line-clamp-1">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-[#787774] mt-1 line-clamp-2 leading-relaxed">
                          {test.description}
                        </p>
                      )}
                    </div>

                    {/* Test Specs Bar */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#E6E6E3] text-[#787774] font-mono text-[11px] text-center">
                      <div>
                        <span className="text-[9px] uppercase text-[#9b9a97] block">Questions</span>
                        <span className="font-medium text-[#202124]">{test.question_count || 0} Qs</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#9b9a97] block">Duration</span>
                        <span className="font-medium text-[#202124]">{formatDuration(test.duration_seconds)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#9b9a97] block">Difficulty</span>
                        <span className="font-medium capitalize text-[#202124]">{test.difficulty || 'Medium'}</span>
                      </div>
                    </div>

                    {/* Marking & Source Info */}
                    <div className="flex items-center justify-between text-[11px] text-[#787774]">
                      <span>
                        Marking: <strong className="text-[#202124]">+{test.default_correct_marks} / -{test.default_negative_marks}</strong>
                      </span>
                      <span className="text-[#9b9a97] truncate max-w-[130px]">
                        {test.source || 'Nalanda Official'}
                      </span>
                    </div>

                    {/* Previous Attempt Status Callout */}
                    {hasAttempted && (
                      <div className="p-2 rounded bg-[#F7F7F5] border border-[#E6E6E3] text-[11px] font-mono flex items-center justify-between">
                        {isInProgress ? (
                          <span className="text-amber-800 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            Attempt In Progress
                          </span>
                        ) : (
                          <span className="text-emerald-800">
                            Best: <strong>{test.best_score || bestAttempt?.final_score || 0} marks</strong> ({Math.round(bestAttempt?.percentage || 0)}%)
                          </span>
                        )}
                        <span className="text-[#9b9a97] text-[10px]">
                          {test.attempts.length} {test.attempts.length === 1 ? 'Attempt' : 'Attempts'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between gap-2">
                    <Link href={`/tests/${test.id}`} className="text-xs text-[#787774] hover:text-[#202124] hover:underline">
                      Blueprint
                    </Link>

                    <div className="flex items-center gap-2">
                      {isInProgress && test.last_attempt_id ? (
                        <Link href={`/exam/${test.last_attempt_id}`}>
                          <Button variant="primary" size="sm">
                            <Play className="w-3 h-3 mr-1 fill-current" />
                            Resume
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/tests/${test.id}/start`}>
                          <Button variant={hasAttempted ? 'secondary' : 'primary'} size="sm">
                            <Play className="w-3 h-3 mr-1 fill-current" />
                            {hasAttempted ? 'Retake' : 'Start'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
