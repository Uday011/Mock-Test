'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Library,
  Star,
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function PublicLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const testSeriesList = [
    {
      id: 'ts-1',
      title: 'SSC CGL 2026 Tier-I All India Master Mock Series',
      exam: 'SSC CGL 2026',
      author: 'Senior Academic Chair & Quantitative Faculty',
      institute: 'Nalanda Institute of Advanced Academics',
      testsCount: 10,
      enrolledCount: 1480,
      rating: 4.95,
      isFree: true,
      description: 'Ten full-length computer-based diagnostic mock exams adhering strictly to current TCS testing cadence, section balance, and negative marking constraints.',
      highlights: ['Full Cognitive Forensics', 'Subject-Wise Percentiles', 'TCS Interface Emulation'],
    },
    {
      id: 'ts-2',
      title: 'SSC CGL Advanced Mathematics & Geometry Sprint Pack',
      exam: 'SSC CGL 2026',
      author: 'Department of Mathematics',
      institute: 'Nalanda Academic Faculty',
      testsCount: 6,
      enrolledCount: 820,
      rating: 4.92,
      isFree: true,
      description: 'Topic-specific high-density speed drills targeting Intersecting Chords, Apollonius Theorem, Symmetric Polynomials, and Mensuration 3D.',
      highlights: ['High Weightage Topics', '15-min Speed Drills', 'Detailed Proofs'],
    },
    {
      id: 'ts-3',
      title: 'NEET UG 2026 Complete Biology High-Yield Diagnostics',
      exam: 'NEET UG 2026',
      author: 'Medical Pedagogy Board',
      institute: 'Apex Pre-Medical Academy',
      testsCount: 12,
      enrolledCount: 2350,
      rating: 4.97,
      isFree: true,
      description: 'Systematic NCERT line-by-line statement and diagram questions covering Human Physiology, Genetics, and Ecology.',
      highlights: ['NCERT Line-by-Line', 'Assertion-Reasoning Focus', '720 Marks Benchmarked'],
    },
    {
      id: 'ts-4',
      title: 'UPSC CSE Prelims 2026 GS Paper-I Comprehensive Series',
      exam: 'UPSC CSE 2026',
      author: 'Public Policy & History Faculty',
      institute: 'Civil Services Studies Group',
      testsCount: 8,
      enrolledCount: 1120,
      rating: 4.88,
      isFree: true,
      description: 'Multi-statement analytical mock papers covering Indian Polity, Modern History, Environmental Conventions, and Economic Surveys.',
      highlights: ['Detailed Source Citations', 'Elimination Strategy Guidance', 'Negative Marking Drill'],
    },
  ];

  const filteredSeries = selectedCategory === 'all'
    ? testSeriesList
    : testSeriesList.filter((s) => s.exam.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Public Library', href: '/library' },
      ]}
    >
      <PageHeader
        title="Public Test Series & Publishing Library"
        description="Explore curated assessment series and full-length CBE mocks published by verified academic chairs and partner institutions."
        badge={<Badge variant="emerald" size="md">Verified Publications</Badge>}
        actions={
          <Link href="/tests/create">
            <Button variant="secondary" size="sm">
              Publish Your Test Series
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Published Series"
          value="24"
          subtext="Full-length diagnostic collections"
          accent="navy"
        />
        <MetricCallout
          label="Enrolled Aspirants"
          value="5,770+"
          subtext="Active nationwide test-takers"
          accent="emerald"
        />
        <MetricCallout
          label="Institutional Quality"
          value="4.93 / 5"
          subtext="Across 1,200+ learner reviews"
          accent="saffron"
        />
        <MetricCallout
          label="Public Access"
          value="Open"
          subtext="No paywalls for foundation tests"
          accent="stone"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Series' },
          { id: 'ssc', label: 'SSC CGL 2026' },
          { id: 'neet', label: 'NEET UG 2026' },
          { id: 'upsc', label: 'UPSC CSE 2026' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Series Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSeries.map((s) => (
          <Card key={s.id} className="p-6 bg-white hover:border-stone-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {s.exam}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {s.testsCount} Mock Exams
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    {s.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 shrink-0 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{s.rating}</span>
                </div>
              </div>

              <div className="text-xs text-stone-500 space-y-0.5">
                <div className="font-medium text-stone-700">{s.author}</div>
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {s.institute}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed pt-1">
                {s.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {s.highlights.map((h) => (
                  <span key={h} className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200 rounded font-medium">
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-stone-100 flex items-center justify-between gap-3 mt-4">
              <div className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>{s.enrolledCount.toLocaleString()} Aspirants</span>
              </div>

              <Link href="/tests">
                <Button variant="saffron" size="sm">
                  Enroll & Attempt <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
