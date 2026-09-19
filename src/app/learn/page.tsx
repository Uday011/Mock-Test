'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

interface TopicItem {
  id: string;
  number: number;
  title: string;
  progressPercent: number;
  topicsCount: number;
}

interface SubjectData {
  code: 'VARC' | 'DILR' | 'QA';
  name: string;
  tagline: string;
  totalTopics: number;
  completedTopics: number;
  overallPercent: number;
  topics: TopicItem[];
}

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [selectedSubject, setSelectedSubject] = useState<'VARC' | 'DILR' | 'QA'>('DILR');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<'syllabus' | 'sets' | 'pyqs'>('syllabus');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Exact data from North Star reference image
  const subjects: Record<'VARC' | 'DILR' | 'QA', SubjectData> = {
    DILR: {
      code: 'DILR',
      name: 'Data Interpretation & Logical Reasoning',
      tagline: 'Build logical clarity.',
      totalTopics: 18,
      completedTopics: 12,
      overallPercent: 61,
      topics: [
        { id: 'topic-arr', number: 1, title: 'Arrangements', progressPercent: 54, topicsCount: 12 },
        { id: 'topic-bin', number: 2, title: 'Binary Logic', progressPercent: 68, topicsCount: 10 },
        { id: 'topic-tab', number: 3, title: 'Tables & Charts', progressPercent: 72, topicsCount: 8 },
        { id: 'topic-gam', number: 4, title: 'Games & Tournaments', progressPercent: 48, topicsCount: 10 },
        { id: 'topic-syl', number: 5, title: 'Syllogisms', progressPercent: 61, topicsCount: 6 },
      ],
    },
    VARC: {
      code: 'VARC',
      name: 'Verbal Ability & Reading Comprehension',
      tagline: 'Master tone & precision.',
      totalTopics: 16,
      completedTopics: 11,
      overallPercent: 68,
      topics: [
        { id: 'topic-rc', number: 1, title: 'Reading Comprehension', progressPercent: 74, topicsCount: 14 },
        { id: 'topic-pj', number: 2, title: 'Para Jumbles', progressPercent: 82, topicsCount: 8 },
        { id: 'topic-ps', number: 3, title: 'Para Summary', progressPercent: 65, topicsCount: 6 },
        { id: 'topic-oso', number: 4, title: 'Odd Sentence Out', progressPercent: 58, topicsCount: 6 },
      ],
    },
    QA: {
      code: 'QA',
      name: 'Quantitative Aptitude',
      tagline: 'Strengthen numerical speed.',
      totalTopics: 22,
      completedTopics: 14,
      overallPercent: 64,
      topics: [
        { id: 'topic-arith', number: 1, title: 'Arithmetic', progressPercent: 78, topicsCount: 16 },
        { id: 'topic-alg', number: 2, title: 'Algebra', progressPercent: 66, topicsCount: 12 },
        { id: 'topic-geo', number: 3, title: 'Geometry & Mensuration', progressPercent: 52, topicsCount: 10 },
        { id: 'topic-num', number: 4, title: 'Number Systems', progressPercent: 60, topicsCount: 8 },
      ],
    },
  };

  useEffect(() => {
    if (sectionParam) {
      const upper = sectionParam.toUpperCase();
      if (upper === 'VARC' || upper === 'DILR' || upper === 'QA') {
        setSelectedSubject(upper as any);
      }
    }
  }, [sectionParam]);

  const current = subjects[selectedSubject];

  // Radial progress ring calculation
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (current.overallPercent / 100) * ringCircumference;

  const filteredTopics = searchQuery.trim()
    ? current.topics.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : current.topics;

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-xl mx-auto space-y-5 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER (Back arrow on left, Learn center, Search right) */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 rounded-full border border-line bg-surface hover:bg-secondary flex items-center justify-center text-ink-muted hover:text-ink transition-colors shadow-2xs"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="text-base font-semibold text-ink tracking-tight">
            Learn
          </h1>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`w-9 h-9 rounded-full border border-line flex items-center justify-center transition-colors shadow-2xs ${
              searchOpen ? 'bg-secondary text-ink' : 'bg-surface text-ink-muted hover:text-ink'
            }`}
            aria-label="Search syllabus"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="relative animate-fade-in">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics or concepts..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-card border border-line bg-surface text-ink focus:outline-hidden focus:border-accent"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-3" />
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SEGMENTED SUBJECT PILLS (VARC | DILR | QA) */}
        {/* ========================================================= */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-full bg-[#EAE8E3] dark:bg-zinc-800">
            {(['VARC', 'DILR', 'QA'] as const).map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-7 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-ink text-canvas font-semibold shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SUBJECT SUMMARY HERO CARD */}
        {/* ========================================================= */}
        <div className="bg-surface border border-line rounded-hero p-5 sm:p-6 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl font-bold text-ink tracking-tight">
              {current.code}
            </h2>
            <p className="text-xs text-ink-muted">
              {current.tagline}
            </p>
            <div className="text-[11px] text-ink-muted pt-2 font-normal">
              {current.completedTopics} of {current.totalTopics} topics completed
            </div>
          </div>

          {/* Radial Progress Ring with exact emerald stroke */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 68 68">
              <circle
                cx="34"
                cy="34"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-[#E8E6E1] dark:text-zinc-800"
              />
              <circle
                cx="34"
                cy="34"
                r={ringRadius}
                stroke="#2E7D62"
                strokeWidth="5"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold text-ink">
              {current.overallPercent}%
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SECONDARY TABS (Syllabus | Sets | PYQs) */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-[#EAE8E3]/60 dark:bg-zinc-800/60 max-w-xs">
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
                className={`flex-1 py-1.5 rounded-full text-xs font-medium text-center transition-all ${
                  isTabActive
                    ? 'bg-surface text-ink font-semibold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 5. NUMBERED TOPIC ROWS */}
        {/* ========================================================= */}
        <div className="space-y-2">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/question-bank?section=${selectedSubject}&topic=${encodeURIComponent(topic.title)}`}
              className="group flex items-center justify-between p-3.5 rounded-card border border-line bg-surface hover:border-line/80 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Number Circle in light stone */}
                <span className="w-7 h-7 rounded-full bg-[#EAE8E3] dark:bg-zinc-800 text-ink font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                  {topic.number}
                </span>

                {/* Topic Title & Subtitle */}
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-ink truncate">
                    {topic.title}
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    {topic.progressPercent}% • {topic.topicsCount} topics
                  </p>
                </div>
              </div>

              {/* Chevron Arrow */}
              <div className="text-ink-muted group-hover:text-ink transition-colors shrink-0 pl-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 6. BOTTOM INSPIRATION CARD */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden p-5 rounded-hero bg-[#191A1D] text-white border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5 z-10">
            <h3 className="text-xs font-semibold text-white">
              Keep going
            </h3>
            <p className="text-[11px] text-white/60">
              You're doing great!
            </p>
          </div>

          {/* Plant / Leaf Silhouette Silhouette SVG */}
          <div className="opacity-20 transform scale-125">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
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
