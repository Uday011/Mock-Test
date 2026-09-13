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
} from 'lucide-react';

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
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-24">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <div className="h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-indigo-400 to-violet-300 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart MCQ Paper Parser & Digital Exam Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Turn Any MCQ Paper Into an{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Interactive Mock Test
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your question paper and answer key, set your timer and marking scheme, and practice in a real exam-like environment.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tests/create"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base group"
            >
              Create Your First Test
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleStartQuickDemo}
              disabled={loadingDemo}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base"
            >
              <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              {loadingDemo ? 'Launching Demo Exam...' : 'Take Sample Live Exam'}
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Multi-page PDF & DOCX Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Negative & Decimal Marking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5-State Question Palette</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero-cheating Server Scoring</span>
            </div>
          </div>
        </div>

        {/* Product Visual Mockup */}
        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-2 sm:p-4 overflow-hidden">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-6">
              {/* Fake Exam Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    Physics & Biology National Entrance Mock
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                    Single Choice
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-mono text-sm font-bold text-indigo-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>00:28:45</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm">
                    Submit Test
                  </span>
                </div>
              </div>

              {/* Fake Question + Palette Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                {/* Left: Question Area */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">Question 4 of 25</span>
                    <span className="font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +4.0 Correct / -1.0 Negative
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed">
                    According to Snell&apos;s Law of refraction, what is the exact mathematical ratio between the sine of the angle of incidence and the sine of refraction?
                  </p>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      { label: 'A', text: 'The ratio of refractive indices (n2 / n1)', selected: true },
                      { label: 'B', text: 'The sum of refractive indices (n1 + n2)', selected: false },
                      { label: 'C', text: 'Constant zero at boundary', selected: false },
                      { label: 'D', text: 'The product of refractive indices (n1 × n2)', selected: false },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          opt.selected
                            ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            opt.selected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <span className={`text-sm ${opt.selected ? 'font-semibold text-indigo-950' : 'text-slate-700'}`}>
                          {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Question Palette preview */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Question Palette</span>
                    <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      4 Answered
                    </span>
                  </div>

                  {/* Palette state pills */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Not Answered</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Marked Review</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Not Visited</span>
                  </div>

                  {/* Bubble grid */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const num = i + 1;
                      let bg = 'bg-slate-100 text-slate-600';
                      if (num <= 3) bg = 'bg-emerald-500 text-white font-bold';
                      else if (num === 4) bg = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400';
                      else if (num === 5) bg = 'bg-amber-500 text-white font-bold';
                      else if (num === 6) bg = 'bg-purple-600 text-white font-bold';
                      return (
                        <div
                          key={num}
                          className={`h-8 rounded-lg flex items-center justify-center text-xs shadow-xs ${bg}`}
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

      {/* How It Works Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            From Static Paper to Live Test in 4 Simple Steps
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Engineered to handle multi-column formats, non-standard numbering, single-line options, and diverse answer key layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Paper & Key',
              desc: 'Drag and drop your question paper (PDF, DOCX, TXT) and your answer sheet. The system validates both files.',
              icon: UploadCloud,
              color: 'bg-blue-500',
            },
            {
              step: '02',
              title: 'Extract & Lint',
              desc: 'Heuristic parser identifies questions, options, numbers, and correct keys while flagging formatting inconsistencies.',
              icon: Layers,
              color: 'bg-indigo-500',
            },
            {
              step: '03',
              title: 'Review & Configure',
              desc: 'Verify parsed items on the correction screen. Customize test timers, negative marking, and shuffle rules.',
              icon: Sliders,
              color: 'bg-purple-500',
            },
            {
              step: '04',
              title: 'Interactive Exam & Scores',
              desc: 'Candidates practice in a full exam interface with countdown timers, question palette, and instant detailed solutions.',
              icon: Award,
              color: 'bg-emerald-500',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl font-black text-slate-100 absolute top-4 right-4 select-none">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center mb-5 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Built for Exam Prep Excellence</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Comprehensive Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Interactive Review Screen</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never publish an erroneous test. Full editable canvas allows modifying question text, changing option choices, and adding explanations.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Customizable Timers</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Set 30m, 60m, 90m, or custom duration. Features live visual warnings, auto-submit on expiry, and anti-tamper server verification.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Flexible Marking Schemes</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Supports global schemes (+4, -1, 0) or custom per-question marks with decimal support (+2.5, -0.66) and zero-cheating server calculation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">5-State Question Palette</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard competitive exam palette showing Not Visited, Visited Unanswered, Answered, Marked for Review, and Answered & Marked.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Progress Auto-Save</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every selection syncs in real-time. Browser refreshes or accidental page closes seamlessly restore the test state without losing answers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Detailed Attempt History</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track progress over time. Retake tests without overwriting previous attempts, with question-by-question solution reviews and explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-8 sm:p-12 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to convert your test papers?
          </h2>
          <p className="mt-4 text-indigo-100 max-w-xl mx-auto text-base">
            Upload your first question paper and answer key now. Test out our instant parsing and take your mock exam in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tests/create"
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-4 bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold rounded-xl border border-indigo-400/30 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
