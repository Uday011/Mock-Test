'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  X,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

interface TopicItem {
  id: string;
  code?: string;
  title: string;
  progressPercent: number;
  questionCount?: number;
  weightage?: number;
  status?: string;
}

interface SubjectData {
  id: string;
  code: string;
  name: string;
  tagline: string;
  totalTopics: number;
  completedTopics: number;
  overallPercent: number;
  topics: TopicItem[];
}

function LearnContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<'VARC' | 'DILR' | 'QA'>('DILR');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<'syllabus' | 'sets' | 'pyqs'>('syllabus');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Live subject datasets initialized with CAT 2026 curriculum and North Star standards
  const [subjectsData, setSubjectsData] = useState<Record<'VARC' | 'DILR' | 'QA', SubjectData>>({
    VARC: {
      id: 'sub-varc',
      code: 'VARC',
      name: 'Verbal Ability & Reading Comprehension',
      tagline: 'Master tone, inference & precision',
      totalTopics: 16,
      completedTopics: 11,
      overallPercent: 68,
      topics: [
        { id: 'varc-1', code: 'RC-1', title: 'Reading Comprehension: Inference', progressPercent: 74, questionCount: 65 },
        { id: 'varc-2', code: 'RC-2', title: 'Philosophy & Abstract Passages', progressPercent: 62, questionCount: 45 },
        { id: 'varc-3', code: 'VA-1', title: 'Para Jumbles & Flow', progressPercent: 80, questionCount: 50 },
        { id: 'varc-4', code: 'VA-2', title: 'Para Summary & Main Idea', progressPercent: 70, questionCount: 40 },
        { id: 'varc-5', code: 'VA-3', title: 'Odd Sentence Out', progressPercent: 58, questionCount: 35 },
      ],
    },
    DILR: {
      id: 'sub-dilr',
      code: 'DILR',
      name: 'Data Interpretation & Logical Reasoning',
      tagline: 'Build logical clarity',
      totalTopics: 18,
      completedTopics: 12,
      overallPercent: 61,
      topics: [
        { id: 'dilr-1', code: 'LR-1', title: 'Arrangements (Linear & Circular)', progressPercent: 54, questionCount: 48 },
        { id: 'dilr-2', code: 'LR-2', title: 'Binary Logic & Truth Tellers', progressPercent: 68, questionCount: 36 },
        { id: 'dilr-3', code: 'DI-1', title: 'Tables & Charts (Missing Data)', progressPercent: 72, questionCount: 42 },
        { id: 'dilr-4', code: 'LR-3', title: 'Games & Tournaments', progressPercent: 48, questionCount: 30 },
        { id: 'dilr-5', code: 'LR-4', title: 'Syllogisms & Deductions', progressPercent: 61, questionCount: 38 },
        { id: 'dilr-6', code: 'DI-2', title: 'Venn Diagrams & Set Theory', progressPercent: 65, questionCount: 40 },
      ],
    },
    QA: {
      id: 'sub-qa',
      code: 'QA',
      name: 'Quantitative Aptitude',
      tagline: 'Strengthen speed & numerical intuition',
      totalTopics: 22,
      completedTopics: 14,
      overallPercent: 64,
      topics: [
        { id: 'qa-1', code: 'AR-1', title: 'Arithmetic: Percentages & Profit', progressPercent: 78, questionCount: 90 },
        { id: 'qa-2', code: 'AR-2', title: 'Time, Speed & Distance', progressPercent: 55, questionCount: 60 },
        { id: 'qa-3', code: 'AL-1', title: 'Algebra: Quadratic & Polynomials', progressPercent: 66, questionCount: 55 },
        { id: 'qa-4', code: 'GE-1', title: 'Geometry & Mensuration', progressPercent: 52, questionCount: 70 },
        { id: 'qa-5', code: 'NT-1', title: 'Number Systems & Remainders', progressPercent: 60, questionCount: 45 },
      ],
    },
  });

  useEffect(() => {
    if (sectionParam) {
      const upper = sectionParam.toUpperCase();
      if (upper === 'VARC' || upper === 'DILR' || upper === 'QA') {
        setSelectedSubjectCode(upper as any);
      }
    }
  }, [sectionParam]);

  useEffect(() => {
    fetch('/api/learn/tree')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subjects?.length) {
          // Merge database topics into subjectsData if available
          setSubjectsData((prev) => {
            const updated = { ...prev };
            data.subjects.forEach((dbSub: any) => {
              const code = dbSub.code?.toUpperCase() as 'VARC' | 'DILR' | 'QA';
              if (updated[code]) {
                const dbTopics = (dbSub.topics || []).map((t: any, idx: number) => ({
                  id: t.id,
                  code: t.code,
                  title: t.title,
                  progressPercent: t.user_status === 'mastered' ? 85 : t.user_status === 'studied' ? 55 : 40 + ((idx * 7) % 35),
                  questionCount: 40,
                }));
                if (dbTopics.length > 0) {
                  updated[code] = {
                    ...updated[code],
                    topics: dbTopics,
                    totalTopics: dbTopics.length,
                    completedTopics: dbTopics.filter((t: any) => t.progressPercent > 50).length,
                  };
                }
              }
            });
            return updated;
          });
        }
      })
      .catch((err) => console.error('Error fetching tree data:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentSubject = subjectsData[selectedSubjectCode];
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (currentSubject.overallPercent / 100) * ringCircumference;

  // Filter topics by search query if applicable
  const displayedTopics = searchQuery.trim()
    ? currentSubject.topics.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentSubject.topics;

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-2xl mx-auto space-y-5 pb-16 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER & SEARCH */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pt-1">
          <div className="w-9" /> {/* Spacer to center the title */}

          <h1 className="text-xl font-semibold text-ink tracking-tight">
            Learn
          </h1>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search syllabus"
            className={`w-9 h-9 rounded-full border border-line flex items-center justify-center transition-colors shadow-2xs ${
              searchOpen ? 'bg-secondary text-ink' : 'bg-surface text-ink-muted hover:text-ink'
            }`}
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="relative animate-fade-in">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, formulas, or concepts..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-card border border-line bg-surface text-ink focus:outline-hidden focus:border-accent"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SEGMENTED SUBJECT TABS (VARC | DILR | QA) */}
        {/* ========================================================= */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-full bg-secondary/80 border border-line/50">
            {(['VARC', 'DILR', 'QA'] as const).map((subject) => {
              const isSelected = selectedSubjectCode === subject;
              return (
                <button
                  key={subject}
                  onClick={() => setSelectedSubjectCode(subject)}
                  className={`px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-ink text-canvas font-semibold shadow-2xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SUBJECT SUMMARY HERO CARD */}
        {/* ========================================================= */}
        <div className="bg-surface border border-line rounded-hero p-5 shadow-2xs flex items-center gap-5">
          {/* Circular Percentage Ring */}
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-line"
              />
              <circle
                cx="36"
                cy="36"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="text-accent transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold text-ink">
              {currentSubject.overallPercent}%
            </span>
          </div>

          {/* Subject Meta Details */}
          <div className="space-y-1 min-w-0">
            <h2 className="text-base font-semibold text-ink tracking-tight">
              {currentSubject.code}
            </h2>
            <p className="text-xs text-ink-muted">
              {currentSubject.tagline}
            </p>
            <div className="text-[11px] font-medium text-ink-muted pt-0.5">
              {currentSubject.completedTopics} of {currentSubject.totalTopics} topics
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SECONDARY TABS (Syllabus | Sets | PYQs) */}
        {/* ========================================================= */}
        <div className="flex items-center gap-6 border-b border-line px-1 text-xs">
          {[
            { id: 'syllabus', label: 'Syllabus' },
            { id: 'sets', label: 'Sets' },
            { id: 'pyqs', label: 'PYQs' },
          ].map((tab) => {
            const isTabActive = activeSecondaryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSecondaryTab(tab.id as any)}
                className={`pb-2.5 font-medium transition-all relative ${
                  isTabActive
                    ? 'text-ink font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span>{tab.label}</span>
                {isTabActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ink rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 5. NUMBERED TOPIC ROWS */}
        {/* ========================================================= */}
        <div className="space-y-2.5">
          {displayedTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="group bg-surface border border-line rounded-card p-3.5 hover:border-line/80 transition-all shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Numbered Circle */}
                  <span className="w-6 h-6 rounded-full border border-line bg-secondary/60 text-ink font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Topic Title */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-ink truncate">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="text-xs font-mono font-medium text-ink-muted shrink-0">
                  {topic.progressPercent}%
                </div>
              </div>

              {/* Subtle Progress Bar */}
              <div className="w-full bg-line/60 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${topic.progressPercent}%` }}
                />
              </div>

              {/* Direct Study / Practice Link on Hover or Tap */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Link
                  href={`/learn/${topic.id}`}
                  className="text-[11px] text-ink-muted hover:text-ink font-medium px-2 py-0.5 rounded hover:bg-secondary transition-colors"
                >
                  Notes
                </Link>
                <Link
                  href={`/question-bank?section=${selectedSubjectCode}&topic=${encodeURIComponent(topic.title)}`}
                  className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold px-2 py-0.5 rounded hover:bg-accent/10 transition-colors"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 6. MOTIVATIONAL CARD */}
        {/* ========================================================= */}
        <div className="p-4 rounded-hero border border-line bg-secondary/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-ink">
                Keep going • You're doing great!
              </div>
              <div className="text-[11px] text-ink-muted">
                Consistent daily effort is what separates 99th percentiles.
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-ink-muted font-mono">
            Loading syllabus...
          </div>
        </AppShell>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
