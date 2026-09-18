'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Play,
  BookOpen,
  Target,
  BarChart3,
  BookMarked,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartQuickDemo = async () => {
    setLoadingDemo(true);
    try {
      await fetch('/api/auth/demo', { method: 'POST' });
      const res = await fetch('/api/tests');
      const data = await res.json();
      if (data.tests && data.tests.length > 0) {
        const firstTest = data.tests[0];
        router.push(`/tests/${firstTest.id}/start`);
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
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

          {/* Giant Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#202124]">
            Learn, practice, and master
          </h1>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#4F46A5] mt-1 sm:mt-2">
            all in one place
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#787774] max-w-xl mx-auto leading-relaxed font-normal">
            Structured knowledge paths, realistic exam simulations, and intelligent progress tracking.
          </p>

          {/* Single CTA */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <button
              onClick={handleStartQuickDemo}
              disabled={loadingDemo}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#4F46A5] hover:bg-[#433B91] text-white text-sm sm:text-base font-medium shadow-lg shadow-[#4F46A5]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#4F46A5]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loadingDemo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <span>Get free demo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* FLOATING FEATURE CARDS */}
        {/* ============================================================= */}

        {/* Card: Left Bottom — Mock Tests */}
        <div className="hidden lg:block absolute left-[3%] xl:left-[6%] bottom-[2%] w-56">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-lg shadow-black/[0.04] p-4 space-y-3 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#202124]">Today&apos;s Practice</span>
              <span className="w-2 h-2 rounded-full bg-[#1B5E20]" />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#EEF0FB] text-[#4F46A5] text-[10px] font-bold flex items-center justify-center">1</span>
                  <span className="text-xs text-[#202124]">SSC CGL Mock #4</span>
                </div>
                <span className="text-[10px] text-[#1B5E20] font-medium">82%</span>
              </div>
              <div className="w-full bg-[#E6E6E3] rounded-full h-1.5">
                <div className="bg-[#4F46A5] h-1.5 rounded-full" style={{ width: '82%' }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#FDF6EC] text-[#B7791F] text-[10px] font-bold flex items-center justify-center">2</span>
                  <span className="text-xs text-[#202124]">Quant Speed Drill</span>
                </div>
                <span className="text-[10px] text-[#B7791F] font-medium">64%</span>
              </div>
              <div className="w-full bg-[#E6E6E3] rounded-full h-1.5">
                <div className="bg-[#B7791F] h-1.5 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card: Right Bottom — Exam Coverage */}
        <div className="hidden lg:block absolute right-[3%] xl:right-[6%] bottom-[2%] w-52">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-lg shadow-black/[0.04] p-4 space-y-3 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <span className="text-xs font-semibold text-[#202124]">12+ Exam Frameworks</span>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="px-2 py-1 rounded-md bg-[#EEF0FB] text-[#4F46A5] text-[10px] font-medium">SSC CGL</span>
              <span className="px-2 py-1 rounded-md bg-[#FDF6EC] text-[#B7791F] text-[10px] font-medium">IBPS PO</span>
              <span className="px-2 py-1 rounded-md bg-[#EDF7ED] text-[#1B5E20] text-[10px] font-medium">UPSC</span>
              <span className="px-2 py-1 rounded-md bg-[#F1F1EF] text-[#787774] text-[10px] font-medium">RRB NTPC</span>
              <span className="px-2 py-1 rounded-md bg-[#EEF0FB] text-[#4F46A5] text-[10px] font-medium">JEE</span>
              <span className="px-2 py-1 rounded-md bg-[#FDF6EC] text-[#B7791F] text-[10px] font-medium">NEET</span>
            </div>
          </div>
        </div>

        {/* Card: Top Left — Syllabus Progress (rotated post-it style) */}
        <div className="hidden xl:block absolute left-[8%] top-[10%] w-44">
          <div className="bg-[#FFFBEB] rounded-lg border border-[#FEF3C7] shadow-md shadow-black/[0.03] p-3 space-y-1.5 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B7791F]" />
              <span className="text-[11px] font-semibold text-[#B7791F]">Syllabus Progress</span>
            </div>
            <p className="text-[10px] text-[#787774] leading-relaxed">
              28 topics mapped across 4 subjects with prerequisite trees.
            </p>
            <div className="flex items-center gap-1 pt-0.5">
              <div className="flex-1 bg-[#FEF3C7] rounded-full h-1">
                <div className="bg-[#B7791F] h-1 rounded-full" style={{ width: '67%' }} />
              </div>
              <span className="text-[9px] font-mono text-[#B7791F]">67%</span>
            </div>
          </div>
        </div>

        {/* Card: Top Right — Readiness Score */}
        <div className="hidden xl:block absolute right-[6%] top-[8%] w-48">
          <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-md shadow-black/[0.03] p-3.5 space-y-2 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#4F46A5]" />
              <span className="text-[11px] font-semibold text-[#202124]">Readiness Index</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-[#4F46A5]">74</span>
              <span className="text-[10px] text-[#1B5E20] font-medium flex items-center gap-0.5 mb-1">
                <TrendingUp className="w-3 h-3" /> +6 this week
              </span>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {[30, 45, 55, 60, 58, 68, 74].map((v, i) => (
                <div key={i} className="bg-[#E6E6E3] rounded-sm overflow-hidden h-6">
                  <div
                    className="bg-[#4F46A5] rounded-sm w-full transition-all"
                    style={{ height: `${v}%`, marginTop: `${100 - v}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* FEATURES GRID */}
      {/* ============================================================= */}
      <section className="py-16 sm:py-24 bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#202124] tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#787774] max-w-lg mx-auto">
              A complete workspace for deliberate practice and measurable progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                icon: BookOpen,
                iconBg: 'bg-[#EEF0FB]',
                iconColor: 'text-[#4F46A5]',
                title: 'Structured Knowledge Trees',
                desc: 'Prerequisite-mapped syllabus paths across 4 subjects and 28 topics. Learn in the right order.',
                link: '/learn',
                linkLabel: 'Explore Syllabus',
              },
              {
                icon: Target,
                iconBg: 'bg-[#FDF6EC]',
                iconColor: 'text-[#B7791F]',
                title: 'CBT Exam Simulator',
                desc: 'Full-length mock tests with official 5-state question palette, autosave, and negative marking.',
                link: '/tests',
                linkLabel: 'Browse Tests',
              },
              {
                icon: BookMarked,
                iconBg: 'bg-[#FEF2F2]',
                iconColor: 'text-[#C53030]',
                title: 'Mistake Notebook',
                desc: 'Every wrong answer is auto-logged with error classification. Blind retry and spaced repetition built in.',
                link: '/mistakes',
                linkLabel: 'View Notebook',
              },
              {
                icon: BarChart3,
                iconBg: 'bg-[#EDF7ED]',
                iconColor: 'text-[#1B5E20]',
                title: 'Performance Analytics',
                desc: 'Readiness index, topic-level accuracy breakdowns, predicted scores, and improvement recommendations.',
                link: '/performance',
                linkLabel: 'See Analytics',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-xl border border-[#E6E6E3] p-6 sm:p-7 hover:border-[#DCDDF7] hover:shadow-md hover:shadow-black/[0.03] transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#202124] mb-1.5">{feature.title}</h3>
                <p className="text-sm text-[#787774] leading-relaxed mb-4">{feature.desc}</p>
                <Link
                  href={feature.link}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#4F46A5] group-hover:gap-2 transition-all duration-200"
                >
                  {feature.linkLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* STATS STRIP */}
      {/* ============================================================= */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#E6E6E3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { value: '12+', label: 'Exam Frameworks', sub: 'SSC, Banking, UPSC, Railways' },
              { value: '100%', label: 'CBT Fidelity', sub: 'Official TCS iON standard' },
              { value: '5-Tier', label: 'Syllabus Depth', sub: 'Exam → Subject → Topic' },
              { value: '3-Day', label: 'Recall Cadence', sub: 'Spaced repetition engine' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#202124]">{stat.value}</span>
                <p className="text-sm font-medium text-[#202124]">{stat.label}</p>
                <p className="text-xs text-[#787774]">{stat.sub}</p>
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
            Start your preparation today
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#787774] leading-relaxed">
            Explore syllabus trees, take full-length mocks, and track your improvement — completely free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4F46A5] hover:bg-[#433B91] text-white text-sm font-medium shadow-lg shadow-[#4F46A5]/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E6E6E3] bg-white hover:bg-[#F7F7F5] text-[#202124] text-sm font-medium transition-colors"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
