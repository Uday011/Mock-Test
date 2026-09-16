'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
  Play,
  Layers,
  BarChart3,
  Sliders,
  FileCheck,
  Compass,
  GraduationCap,
  Building2,
  BookOpen,
  Target,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartQuickDemo = async () => {
    setLoadingDemo(true);
    try {
      // 1. Authenticate with demo account
      await fetch('/api/auth/demo', { method: 'POST' });
      // 2. Fetch available tests
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
    <div className="space-y-20 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 md:pt-18 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Platform Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-slate-800 text-xs font-bold mb-6 sm:mb-8 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Nalanda Academic Platform &middot; Integrated Syllabus, Testing & Publishing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Integrated Learning, Testing &{' '}
            <span className="text-amber-800 underline decoration-amber-400/60 underline-offset-8">
              Readiness Diagnostics
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Follow structured syllabus paths with prerequisite mapping, practice in a high-fidelity CBT environment with instant scoring, diagnose weaknesses, and publish verified test series.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                iconRight={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Explore Learning Paths & Mocks
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleStartQuickDemo}
              loading={loadingDemo}
              loadingText="Launching Demo CBT Exam..."
              icon={<Play className="w-4 h-4 text-amber-600 fill-amber-600" />}
            >
              Take Sample Mock Exam
            </Button>

            <Link href="/tests/create">
              <Button variant="outline" size="lg" fullWidth>
                Open Test Studio
              </Button>
            </Link>
          </div>

          {/* Core Dimension Trust Pills */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-700">
            <Badge variant="stone" dot>NEET UG 2026</Badge>
            <Badge variant="stone" dot>UPSC CSE Prelims</Badge>
            <Badge variant="stone" dot>JEE Advanced 2026</Badge>
            <Badge variant="saffron" dot>Syllabus Prerequisite Trees</Badge>
            <Badge variant="navy" dot>Live CBT Engine</Badge>
            <Badge variant="emerald" dot>Readiness Scoring</Badge>
          </div>
        </div>

        {/* Product Visual Mockup */}
        <div className="mt-12 sm:mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-xs p-2 sm:p-4 overflow-hidden">
            <div className="rounded-xl border border-stone-100 bg-[#faf9f6] p-3 sm:p-6">
              {/* Fake Exam Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base line-clamp-1">
                    All-India Mock Exam #04 — Physics & Chemistry
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold font-mono shrink-0">
                    CBT Single Choice
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs font-mono text-xs font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>00:28:45</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                    Submit Test
                  </span>
                </div>
              </div>

              {/* Fake Question + Palette Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                {/* Left: Question Area */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-800">Question 4 of 25</span>
                    <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      +4.0 Correct / -1.0 Negative
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                    According to Snell&apos;s Law of refraction, what is the exact mathematical ratio between the sine of the angle of incidence and the sine of refraction?
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {[
                      { label: 'A', text: 'The ratio of refractive indices (n2 / n1)', selected: true },
                      { label: 'B', text: 'The sum of refractive indices (n1 + n2)', selected: false },
                      { label: 'C', text: 'Constant zero at boundary', selected: false },
                      { label: 'D', text: 'The product of refractive indices (n1 × n2)', selected: false },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all min-h-[44px] ${
                          opt.selected
                            ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            opt.selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <span className={`text-xs sm:text-sm ${opt.selected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Question Palette preview */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Question Palette</span>
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                      4 Answered
                    </span>
                  </div>

                  {/* Palette state pills */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> Answered</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" /> Unanswered</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" /> Review</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" /> Not Visited</span>
                  </div>

                  {/* Bubble grid */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const num = i + 1;
                      let bg = 'bg-slate-100 text-slate-600';
                      if (num <= 3) bg = 'bg-emerald-500 text-white font-bold';
                      else if (num === 4) bg = 'bg-blue-600 text-white font-bold ring-2 ring-blue-300';
                      else if (num === 5) bg = 'bg-amber-500 text-white font-bold';
                      else if (num === 6) bg = 'bg-purple-600 text-white font-bold';
                      return (
                        <div
                          key={num}
                          className={`h-7 rounded-lg flex items-center justify-center text-[11px] font-medium shadow-2xs ${bg}`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nalanda Four Interconnected Dimensions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <Badge variant="saffron" dot className="mb-3">
            Architectural Blueprint
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Four Interconnected Dimensions of Nalanda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            An integrated academic ecosystem where every topic leads naturally to practice, performance directly updates readiness, and educators publish verified mock series.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {[
            {
              dim: '01',
              title: 'Personal Learning & Testing',
              desc: 'Select a target exam, follow a structured progression, study topics in sequence, and take topic tests, sectionals, and full-length mocks.',
              tag: 'Learner Experience',
              tagVariant: 'navy' as const,
              icon: Compass,
              iconColor: 'bg-slate-900 text-white',
            },
            {
              dim: '02',
              title: 'Exam-Specific Syllabus Trees',
              desc: 'Detailed syllabus breakdown by subject, section, topic, and subtopic with prerequisites, weightage percentages, and connected resources.',
              tag: 'Syllabus Engine',
              tagVariant: 'saffron' as const,
              icon: BookOpen,
              iconColor: 'bg-amber-600 text-white',
            },
            {
              dim: '03',
              title: 'Open Test Platform',
              desc: 'Students, teachers, and creators build, discover, and attempt public, shared, unlisted, or private tests with question bank reuse.',
              tag: 'Test Studio',
              tagVariant: 'stone' as const,
              icon: Layers,
              iconColor: 'bg-slate-800 text-white',
            },
            {
              dim: '04',
              title: 'Educator Publishing Layer',
              desc: 'Verified educator profiles, published mock series, cohort analytics, and scalable data models ready for creator monetization.',
              tag: 'Academic Publishing',
              tagVariant: 'emerald' as const,
              icon: Award,
              iconColor: 'bg-emerald-700 text-white',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.dim}
                className="relative bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${item.iconColor} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-stone-200 select-none font-mono">
                      {item.dim}
                    </span>
                  </div>
                  <Badge variant={item.tagVariant} size="sm" className="mb-2">
                    {item.tag}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/80 rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Built for Exam Prep Excellence</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Comprehensive Platform Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Interactive Review Screen</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never publish an erroneous test. Full editable canvas allows modifying question text, changing option choices, and adding explanations.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Customizable Timers</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Set 30m, 60m, 90m, or custom duration. Features live visual warnings, auto-submit on expiry, and anti-tamper server verification.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Flexible Marking Schemes</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Supports global schemes (+4, -1, 0) or custom per-question marks with decimal support (+2.5, -0.66) and zero-cheating server calculation.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">CBT Question Palette</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Full national entrance exam style palette showing Not Visited, Unanswered, Answered, and Marked for Review states.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Progress Auto-Save</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every selection syncs in real-time. Browser refreshes or accidental connection drops seamlessly restore the test state without losing answers.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">AI Performance Insights</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Deep analytics with AI-generated breakdown of strengths, conceptual weaknesses, and pacing recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Final Academic CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-md border border-slate-800">
          <Badge variant="saffron" dot className="mb-4">
            Start Your Academic Journey
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Structure Your Preparation with Nalanda
          </h2>
          <p className="mt-3 sm:mt-4 text-stone-300 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Follow syllabus-aligned paths, take timed CBT mocks, review question solutions, and measure real exam readiness.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link href="/dashboard">
              <Button variant="saffron" size="lg" fullWidth>
                Enter Learner Workspace
              </Button>
            </Link>
            <Link href="/tests/create">
              <Button variant="secondary" size="lg" fullWidth>
                Launch Test Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
