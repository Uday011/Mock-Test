'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Play,
  BookOpen,
  Target,
  BookMarked,
  Sparkles,
  TrendingUp,
  FileText,
  UploadCloud,
  Youtube,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartQuickDemo = async () => {
    setLoadingDemo(true);
    try {
      await fetch('/api/auth/demo', { method: 'POST' });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-white text-[#202124] min-h-screen selection:bg-[#EEF0FB] selection:text-[#4F46A5] overflow-hidden">

      {/* ============================================================= */}
      {/* HERO SECTION */}
      {/* ============================================================= */}
      <section className="relative pt-20 sm:pt-28 md:pt-36 pb-20 sm:pb-28">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,165,0.06),transparent)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Central Brand Icon */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#4F46A5] text-white flex items-center justify-center shadow-lg shadow-[#4F46A5]/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 sm:w-9 sm:h-9 text-white"
              >
                <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="5" r="2" fill="#B7791F" />
              </svg>
            </div>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#202124]">
            Your personal workspace
          </h1>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#4F46A5] mt-1 sm:mt-2">
            for focused exam preparation
          </h1>

          {/* Positioning Subtitle */}
          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#787774] max-w-2xl mx-auto leading-relaxed font-normal">
            Nalanda is a personal exam-preparation workspace where you can turn PDFs into mock exams, organize free learning resources, study by syllabus, practice questions, and track your progress.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStartQuickDemo}
              disabled={loadingDemo}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#4F46A5] hover:bg-[#433B91] text-white text-sm sm:text-base font-medium shadow-lg shadow-[#4F46A5]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#4F46A5]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loadingDemo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering Workspace...</span>
                </>
              ) : (
                <>
                  <span>Open Free Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <Link
              href="/tests/create?pathway=upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E6E6E3] hover:border-[#202124] text-[#202124] text-sm sm:text-base font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-[#4F46A5]" />
              <span>Convert PDF to Mock</span>
            </Link>
          </div>
        </div>

        {/* ============================================================= */}
        {/* FLOATING FEATURE CARDS (Desktop) */}
        {/* ============================================================= */}

        {/* Card: Left Bottom — PDF Ingestion Preview */}
        <div className="hidden lg:block absolute left-[3%] xl:left-[6%] bottom-[2%] w-60">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-lg shadow-black/[0.04] p-4 space-y-3 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#4F46A5]" />
                <span className="text-xs font-semibold text-[#202124]">PDF to Test</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-mono">Parsed</span>
            </div>
            <div className="p-2 bg-[#F7F7F5] rounded border border-[#E6E6E3] text-[11px] space-y-1">
              <div className="font-mono text-[#202124] truncate">SSC_CGL_2024_Tier1.pdf</div>
              <div className="text-[10px] text-[#787774]">100 Questions &bull; Formula & Options Extracted</div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#4F46A5] font-medium pt-0.5">
              <span>Launch Simulator</span>
              <Play className="w-3 h-3 fill-current" />
            </div>
          </div>
        </div>

        {/* Card: Right Bottom — Free Resources & Videos */}
        <div className="hidden lg:block absolute right-[3%] xl:right-[6%] bottom-[2%] w-56">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-lg shadow-black/[0.04] p-4 space-y-3 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-[#C53030]" />
                <span className="text-xs font-semibold text-[#202124]">Free Resources</span>
              </div>
              <span className="text-[10px] font-mono text-[#787774]">4 Linked</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#E6E6E3] text-[#202124] truncate">
                Geometric Theorems Walkthrough
              </div>
              <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#E6E6E3] text-[#202124] truncate">
                Handwritten Coordinate Geometry Notes
              </div>
            </div>
          </div>
        </div>

        {/* Card: Top Left — Syllabus Tree */}
        <div className="hidden xl:block absolute left-[7%] top-[10%] w-48">
          <div className="bg-[#FFFBEB] rounded-lg border border-[#FEF3C7] shadow-md shadow-black/[0.03] p-3 space-y-1.5 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B7791F]" />
              <span className="text-[11px] font-semibold text-[#B7791F]">Syllabus Coverage</span>
            </div>
            <p className="text-[10px] text-[#787774] leading-relaxed">
              28 topics mapped with prerequisite dependencies.
            </p>
            <div className="flex items-center gap-1 pt-0.5">
              <div className="flex-1 bg-[#FEF3C7] rounded-full h-1">
                <div className="bg-[#B7791F] h-1 rounded-full" style={{ width: '67%' }} />
              </div>
              <span className="text-[9px] font-mono text-[#B7791F]">67%</span>
            </div>
          </div>
        </div>

        {/* Card: Top Right — Mistake Notebook */}
        <div className="hidden xl:block absolute right-[6%] top-[8%] w-50">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-md shadow-black/[0.03] p-3.5 space-y-2 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-[#C53030]" />
                <span className="text-[11px] font-semibold text-[#202124]">Mistake Notebook</span>
              </div>
              <span className="text-[10px] font-mono text-[#C53030] bg-[#FEF2F2] px-1 rounded">3 Due</span>
            </div>
            <p className="text-[10px] text-[#787774]">
              Spaced repetition schedule for active recall of error traps.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#F1F1EF] text-[10px]">
              <span className="text-[#787774]">Blind Retry Ready</span>
              <RotateCcw className="w-3 h-3 text-[#4F46A5]" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 6 CORE LEARNER WORKSPACE PILLARS */}
      {/* ============================================================= */}
      <section className="py-16 sm:py-24 bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#202124] tracking-tight">
              A workspace built entirely for learners
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#787774] max-w-xl mx-auto">
              Everything you need to organize your study, practice deliberately, and measure your progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                icon: UploadCloud,
                iconBg: 'bg-[#EEF0FB]',
                iconColor: 'text-[#4F46A5]',
                title: 'PDF to Mock Test',
                desc: 'Turn past papers and study material PDFs into interactive CBT mock exams with automated question extraction and answer key matching.',
                link: '/tests/create?pathway=upload',
                linkLabel: 'Convert a PDF',
              },
              {
                icon: BookOpen,
                iconBg: 'bg-[#FDF6EC]',
                iconColor: 'text-[#B7791F]',
                title: 'Syllabus-Based Study',
                desc: 'Organized prerequisite knowledge trees across subjects and topics. Know exactly what to learn next without guesswork.',
                link: '/learn',
                linkLabel: 'Explore Syllabus',
              },
              {
                icon: FileText,
                iconBg: 'bg-[#EDF7ED]',
                iconColor: 'text-[#1B5E20]',
                title: 'Free Learning Resources',
                desc: 'Organize public PDFs, revision summaries, worked examples, and personal notes connected directly to syllabus topics.',
                link: '/library',
                linkLabel: 'Browse Resources',
              },
              {
                icon: Youtube,
                iconBg: 'bg-[#FEF2F2]',
                iconColor: 'text-[#C53030]',
                title: 'YouTube Organization',
                desc: 'Embed high-yield video lectures, derivations, and topic walkthroughs from YouTube directly alongside your syllabus tree.',
                link: '/learn',
                linkLabel: 'View Pathways',
              },
              {
                icon: Target,
                iconBg: 'bg-[#EEF0FB]',
                iconColor: 'text-[#4F46A5]',
                title: 'Practice & Mock Tests',
                desc: 'Authentic CBT simulator with 5-state question palette, sectional timing, negative marking, and autosave fidelity.',
                link: '/tests',
                linkLabel: 'Take a Mock Test',
              },
              {
                icon: BookMarked,
                iconBg: 'bg-[#FEF2F2]',
                iconColor: 'text-[#C53030]',
                title: 'Mistake Review & Progress',
                desc: 'Automated mistake notebook logs every slip. Classify errors, conduct blind retries, and track your composite Readiness Index.',
                link: '/mistakes',
                linkLabel: 'Review Mistakes',
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="group bg-white rounded-xl border border-[#E6E6E3] p-6 hover:border-[#DCDDF7] hover:shadow-md hover:shadow-black/[0.03] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-lg ${pillar.iconBg} ${pillar.iconColor} flex items-center justify-center mb-4`}>
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#202124] mb-2">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-[#787774] leading-relaxed mb-4">{pillar.desc}</p>
                </div>
                <Link
                  href={pillar.link}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#4F46A5] group-hover:gap-2 transition-all duration-200 pt-2 border-t border-[#F1F1EF]"
                >
                  {pillar.linkLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* STATS & VALUE STRIP */}
      {/* ============================================================= */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#E6E6E3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { value: '100% Free', label: 'Learner Workspace', sub: 'Zero paywalls or subscriptions' },
              { value: 'Instant', label: 'PDF to Test', sub: 'Extract questions & answer keys' },
              { value: '28 Topics', label: 'Structured Syllabus', sub: 'Prerequisite knowledge trees' },
              { value: 'Autonomous', label: 'Mistake Notebook', sub: 'Error classification & blind retry' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#202124]">{stat.value}</span>
                <p className="text-xs sm:text-sm font-medium text-[#202124]">{stat.label}</p>
                <p className="text-[11px] text-[#787774]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* BOTTOM CTA */}
      {/* ============================================================= */}
      <section className="py-20 sm:py-28 bg-[#F7F7F5]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-semibold text-[#202124] tracking-tight">
            Start organizing your exam prep today
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#787774] leading-relaxed">
            Turn your study PDFs into practice tests, master topics by syllabus, and monitor your progress — completely focused and free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#4F46A5] hover:bg-[#433B91] text-white text-sm font-medium shadow-lg shadow-[#4F46A5]/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tests/create?pathway=upload"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#E6E6E3] bg-white hover:bg-[#F7F7F5] text-[#202124] text-sm font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-[#787774]" />
              Convert a PDF
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
