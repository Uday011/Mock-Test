'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Target,
  BookMarked,
  TrendingUp,
  FileText,
  UploadCloud,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartQuickDemo = async () => {
    setLoadingDemo(true);
    try {
      localStorage.setItem('nalanda_active_exam', 'CAT 2026');
      await fetch('/api/auth/demo', { method: 'POST' });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-surface text-ink min-h-screen selection:bg-accent/15 selection:text-accent overflow-hidden">

      {/* HERO */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(88,101,216,0.05),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-hero bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9 text-white">
                <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="5" r="2" fill="#C5A05A" />
              </svg>
            </div>
          </div>

          <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-4">Plan. Practice. Perform.</p>

          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.08] text-ink">
            Your personal engine for
          </h1>
          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.08] text-accent mt-1">
            focused CAT preparation
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            ExamCraft is a personal exam-preparation engine designed to turn past papers into CBT mocks, study systematically by syllabus, eliminate recurring mistakes, and maximize your percentile.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStartQuickDemo}
              disabled={loadingDemo}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm sm:text-base font-medium shadow-lg shadow-accent/20 transition-all duration-200 hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loadingDemo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching Engine...</span>
                </>
              ) : (
                <>
                  <span>Start Preparation Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <Link
              href="/tests/create?pathway=upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-line hover:border-ink text-ink text-sm sm:text-base font-medium transition-all duration-200"
            >
              <UploadCloud className="w-4 h-4 text-accent" />
              <span>Convert PDF to Mock</span>
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20 sm:py-28 bg-canvas">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink tracking-tight">
              Built entirely for CAT aspirants
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
              Everything you need to study methodically, simulate real CBT exams, and maximize your percentile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: UploadCloud,
                title: 'PDF to Mock Test',
                desc: 'Turn past papers and study material PDFs into interactive CBT mock exams with automated question extraction.',
                link: '/tests/create?pathway=upload',
                linkLabel: 'Convert a PDF',
              },
              {
                icon: BookOpen,
                title: 'Syllabus-Based Study',
                desc: 'Organized prerequisite knowledge trees across subjects and topics. Know exactly what to learn next.',
                link: '/learn',
                linkLabel: 'Explore Syllabus',
              },
              {
                icon: FileText,
                title: 'Learning Resources',
                desc: 'Organize PDFs, revision summaries, worked examples, and personal notes connected directly to syllabus topics.',
                link: '/library',
                linkLabel: 'Browse Resources',
              },
              {
                icon: Target,
                title: 'Practice & Mock Tests',
                desc: 'Authentic CBT simulator with 5-state question palette, sectional timing, negative marking, and autosave.',
                link: '/tests',
                linkLabel: 'Take a Mock Test',
              },
              {
                icon: BookMarked,
                title: 'Mistake Review',
                desc: 'Automated mistake notebook logs every slip. Classify errors, conduct blind retries, and track improvement.',
                link: '/mistakes',
                linkLabel: 'Review Mistakes',
              },
              {
                icon: TrendingUp,
                title: 'Performance Analysis',
                desc: 'Track your composite Readiness Index, identify weak areas, and receive AI-powered improvement recommendations.',
                link: '/performance',
                linkLabel: 'View Analysis',
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="group bg-surface rounded-hero border border-line p-6 sm:p-7 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-card bg-accent/8 text-accent flex items-center justify-center mb-5">
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-ink mb-2 tracking-tight">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-5">{pillar.desc}</p>
                </div>
                <Link
                  href={pillar.link}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all duration-200 pt-3 border-t border-line"
                >
                  {pillar.linkLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 sm:py-20 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { value: '100% Free', label: 'Candidate Engine', sub: 'Zero paywalls or subscriptions' },
              { value: 'Instant', label: 'PDF to Test', sub: 'Extract questions & answer keys' },
              { value: '28 Topics', label: 'Structured Syllabus', sub: 'Prerequisite knowledge trees' },
              { value: 'Autonomous', label: 'Mistake Notebook', sub: 'Error classification & blind retry' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">{stat.value}</span>
                <p className="text-xs sm:text-sm font-medium text-ink">{stat.label}</p>
                <p className="text-[11px] text-ink-muted">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 sm:py-32 bg-canvas">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-semibold text-ink tracking-tight">
            Start preparing for CAT today
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
            Turn your study PDFs into practice tests, master topics by syllabus, and monitor your progress.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-medium shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tests/create?pathway=upload"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-line bg-surface hover:bg-secondary text-ink text-sm font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-ink-muted" />
              Convert a PDF
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
