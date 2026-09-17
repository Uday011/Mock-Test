'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Award,
  ArrowRight,
  Sparkles,
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
  CheckCircle2,
  ShieldCheck,
  Zap,
  BookMarked,
  RotateCcw,
  Flame,
  ChevronRight,
  Info,
  Check,
  Flag,
  FileText,
} from 'lucide-react';
import KineticGrid from '@/components/ui/kinetic-grid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Live Interactive Hero Exam Simulator State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [activeSection, setActiveSection] = useState('Quant');
  const [timerSeconds, setTimerSeconds] = useState(3582); // ~59:42 mins

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    <KineticGrid globalColor="default" className="text-white selection:bg-blue-500/30 selection:text-white">
      <div className="space-y-24 sm:space-y-32 pb-24">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (INTERACTIVE KINETIC CANVAS & LIVE CBT SANDBOX) */}
        {/* ========================================================================= */}
        <section className="relative pt-12 sm:pt-20 md:pt-24 lg:pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Interactive Physics Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-blue-300 backdrop-blur-md shadow-2xs animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>NALANDA INTELLIGENCE ENGINE &middot; KINETIC CBT WORKSPACE</span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1] sm:leading-[1.1]">
                Master Any Competitive Exam Through{' '}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent underline decoration-blue-400/30 underline-offset-8">
                  Structural Intelligence
                </span>
              </h1>
              <p className="text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-normal">
                Ditch superficial question banks. Nalanda unifies prerequisite-mapped syllabus trees, 100% authentic TCS computer-based testing, automated mistake forensics, and scientific spaced repetition.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
                  <span>Explore Learning Paths & Mocks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button
                onClick={handleStartQuickDemo}
                disabled={loadingDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm backdrop-blur-sm transition-all flex items-center justify-center gap-2"
              >
                {loadingDemo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Launching CBT Simulator...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Take Sample Mock Exam</span>
                  </>
                )}
              </button>

              <Link href="/tests/create" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-stone-400 hover:text-white text-xs font-semibold transition-all">
                  Open Test Studio
                </button>
              </Link>
            </div>

            {/* Interactive Live CBT Exam Sandbox Preview Card */}
            <div className="pt-6 sm:pt-10 max-w-4xl mx-auto text-left">
              <div className="rounded-2xl border border-white/15 bg-[#1e1e22]/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/40">
                {/* Simulator Header Bar */}
                <div className="bg-[#121214] border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white tracking-wide font-mono">
                      LIVE CBT SIMULATOR &middot; SSC CGL TIER-I
                    </span>
                    <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/10 text-stone-300 font-mono text-[11px]">
                      100 Questions &middot; 200 Marks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-white/10 font-mono text-amber-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-mono font-bold text-[11px]">
                      Marking: +2.0 / -0.50
                    </span>
                  </div>
                </div>

                {/* Section Switcher Tabs */}
                <div className="bg-white/5 border-b border-white/10 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
                  {[
                    { id: 'Quant', label: 'Quantitative Aptitude (25)' },
                    { id: 'Reasoning', label: 'General Intelligence (25)' },
                    { id: 'English', label: 'English Comprehension (25)' },
                    { id: 'GA', label: 'General Awareness (25)' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSection(sec.id);
                        setSelectedOption(null);
                        setIsAnswerRevealed(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        activeSection === sec.id
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-stone-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                {/* Question Area */}
                <div className="p-5 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-white/10 text-white font-bold rounded font-mono">
                      Question 14 of 25 &middot; Geometry Circles
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      Click an option below to test instant evaluation:
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-stone-100 leading-relaxed">
                    In a circle with centre O, two chords <strong>AB</strong> and <strong>CD</strong> intersect internally at point <strong>P</strong>. If <strong>AP = 6 cm</strong>, <strong>PB = 4 cm</strong>, and <strong>CP = 3 cm</strong>, find the length of segment <strong>PD</strong>.
                  </p>

                  {/* 4 Interactive Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      { label: 'A', text: '7.0 cm', isCorrect: false },
                      { label: 'B', text: '8.0 cm', isCorrect: true },
                      { label: 'C', text: '9.0 cm', isCorrect: false },
                      { label: 'D', text: '10.5 cm', isCorrect: false },
                    ].map((opt) => {
                      const isSelected = selectedOption === opt.label;
                      let btnStyle = 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-stone-200';

                      if (isAnswerRevealed) {
                        if (opt.isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30';
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-blue-500 bg-blue-500/20 text-white ring-2 ring-blue-500/30';
                      }

                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setSelectedOption(opt.label);
                            setIsAnswerRevealed(true);
                          }}
                          className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-all ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-white/10 font-mono font-bold flex items-center justify-center text-xs text-white shrink-0">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isAnswerRevealed && opt.isCorrect && (
                            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Correct (+2.0)
                            </span>
                          )}
                          {isAnswerRevealed && isSelected && !opt.isCorrect && (
                            <span className="text-rose-400 font-bold text-xs">
                              Incorrect (-0.50)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Banner */}
                  {isAnswerRevealed && (
                    <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 space-y-1 animate-in fade-in zoom-in-95">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Theorem & Forensic Explanation:
                      </div>
                      <p className="leading-relaxed text-stone-300">
                        By the <strong>Intersecting Chords Theorem</strong>, when two chords intersect internally, the products of their segments are equal:
                        <br />
                        <span className="font-mono text-amber-300 font-semibold">
                          AP &times; PB = CP &times; PD &rArr; 6 &times; 4 = 3 &times; PD &rArr; 24 = 3 &times; PD &rArr; PD = 8 cm.
                        </span>
                      </p>
                      {selectedOption !== 'B' && (
                        <p className="text-amber-400 text-[11px] font-semibold pt-1">
                          &bull; This error was automatically added to your Mistake Notebook with category: Calculation Slip.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulator Footer Dock */}
                <div className="bg-[#121214] border-t border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-stone-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Autosave Active
                    </span>
                    <span className="hidden sm:inline">&middot;</span>
                    <span className="hidden sm:inline">5-State Question Palette Enabled</span>
                  </div>

                  <button
                    onClick={handleStartQuickDemo}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Launch Full 100-Q Exam</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. OPERATIONAL PROOF METRICS STRIP */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-white">12+</span>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Test Frameworks</p>
              <span className="text-[11px] text-stone-500 block">Full Mocks, PYQs, Sectional & Topic Drills</span>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-blue-400">100%</span>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">CBT Fidelity</p>
              <span className="text-[11px] text-stone-500 block">Identical to TCS iON official test engines</span>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400">5-Tier</span>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Syllabus Depth</p>
              <span className="text-[11px] text-stone-500 block">Exam &rarr; Subject &rarr; Section &rarr; Topic &rarr; Subtopic</span>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">3-Day</span>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Active Recall</p>
              <span className="text-[11px] text-stone-500 block">Automated spaced repetition scheduling</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. THE 4 ARCHITECTURAL PILLARS (ENGINES OF NALANDA) */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              The Four Architectural Pillars of Nalanda
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Every feature on Nalanda is interconnected. Learning informs testing, testing fuels mistake forensics, and forensics dictate spaced revision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: Syllabus Hierarchy */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 sm:p-8 space-y-5 transition-all backdrop-blur-sm">
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                  alt="Syllabus Dependency Graph"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-mono font-bold uppercase">
                    Pillar 01 &middot; Pedagogy
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Prerequisite-Mapped Knowledge Trees
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Avoid cognitive overload. Topics are mapped in a directed acyclic graph where foundational concepts (Number Systems, Reciprocal Multipliers) unlock advanced applications (Profit-Loss, Alligation).
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono">14 Curriculum Units Active</span>
                <Link href="/learn" className="text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300">
                  Explore Syllabus <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: CBT Engine */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 sm:p-8 space-y-5 transition-all backdrop-blur-sm">
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
                  alt="CBT Simulator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded bg-amber-600 text-white text-[10px] font-mono font-bold uppercase">
                    Pillar 02 &middot; Testing
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  High-Fidelity Computer-Based Test Simulator
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Real exam pressure requires real simulation. Features the authentic 5-state question palette, composite section switching, debounced autosave resilience, negative marking, and pre-submit auditing.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono">TCS iON Standard Compliant</span>
                <Link href="/tests" className="text-amber-400 font-bold flex items-center gap-1 hover:text-amber-300">
                  Browse Tests <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Mistake Notebook */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 sm:p-8 space-y-5 transition-all backdrop-blur-sm">
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
                  alt="Mistake Forensics"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded bg-rose-600 text-white text-[10px] font-mono font-bold uppercase">
                    Pillar 03 &middot; Forensics
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-rose-400" />
                  Autonomous Mistake Notebook & Tagging
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Never repeat an error. Every incorrect answer is automatically captured from CBT tests and categorized by cognitive failure: calculation slip, conceptual gap, or examiner trap.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono">1-Click Revision Drill</span>
                <Link href="/mistakes" className="text-rose-400 font-bold flex items-center gap-1 hover:text-rose-300">
                  Open Notebook <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 4: Spaced Repetition */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 sm:p-8 space-y-5 transition-all backdrop-blur-sm">
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                  alt="AI Spaced Repetition"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase">
                    Pillar 04 &middot; Intelligence
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Scientific Spaced Repetition & AI Coach
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Powered by Gemini 3.6 Flash. Test attempts dynamically update syllabus topic mastery. Scoring &ge; 75% schedules spaced review in 3 days; lower scores schedule immediate reinforcement drills.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono">Leitner Memory Curves</span>
                <Link href="/dashboard" className="text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-300">
                  View Readiness <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SUPPORTED EXAM ECOSYSTEM */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Exam Coverage
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                National Exam Ecosystems Supported
              </h2>
            </div>

            <Link href="/exams" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All Target Exams <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: 'SSC CGL 2026',
                subtitle: 'Staff Selection Commission',
                badge: 'Flagship Blueprint',
                tag: 'Tier I & II',
                desc: '100-Q Mocks, 14 topic units, official 2023 shift papers, and speed drills.',
                color: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                title: 'Banking & Insurance',
                subtitle: 'IBPS PO / SBI PO / RBI',
                badge: 'Speed Drills',
                tag: 'Prelims + Mains',
                desc: 'Sectional quantitative speed tests, syllogisms, circular puzzles, and financial awareness.',
                color: 'border-sky-500/30 hover:border-sky-500/60',
              },
              {
                title: 'Railways Recruitment',
                subtitle: 'RRB NTPC & Group D',
                badge: 'General Science',
                tag: 'CBT 1 & 2',
                desc: 'Applied physics, railway general awareness, and arithmetic fast calculation drills.',
                color: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                title: 'Civil Services CSE',
                subtitle: 'UPSC Prelims & State PSCs',
                badge: 'CSAT Analytics',
                tag: 'GS Paper I & II',
                desc: 'Reading comprehension, logical deductions, data sufficiency, and policy frameworks.',
                color: 'border-purple-500/30 hover:border-purple-500/60',
              },
            ].map((ex, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl bg-white/5 border ${ex.color} space-y-4 backdrop-blur-sm transition-all hover:bg-white/10`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                    {ex.tag}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">
                    {ex.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-white">{ex.title}</h3>
                  <p className="text-xs text-stone-400">{ex.subtitle}</p>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">{ex.desc}</p>

                <div className="pt-3 border-t border-white/10">
                  <Link href="/tests" className="text-xs font-bold text-white hover:text-blue-400 flex items-center gap-1">
                    Start Mock Tests <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. OFFICIAL 5-STATE PALETTE INTERACTIVE SHOWCASE */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10 space-y-6 backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                TCS iON Examination Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Official 5-State Question Palette Protocol
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Exam tension causes avoidable mistakes. Nalanda trains candidates to navigate the exact 5-state palette used in Indian government examinations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-stone-700 text-stone-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  01
                </span>
                <div>
                  <span className="font-bold text-xs text-white block">Not Visited</span>
                  <span className="text-[11px] text-stone-400">Question not opened yet</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                  02
                </span>
                <div>
                  <span className="font-bold text-xs text-amber-300 block">Unanswered</span>
                  <span className="text-[11px] text-stone-400">Visited but left blank</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                  03
                </span>
                <div>
                  <span className="font-bold text-xs text-emerald-300 block">Answered</span>
                  <span className="text-[11px] text-stone-400">Option chosen & saved</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                  04
                </span>
                <div>
                  <span className="font-bold text-xs text-purple-300 block">Review Flag</span>
                  <span className="text-[11px] text-stone-400">Flagged for later review</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs relative shadow-xs">
                  05
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-stone-900" />
                </span>
                <div>
                  <span className="font-bold text-xs text-blue-300 block">Answered & Review</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">Will be evaluated</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. EDUCATOR & INSTITUTIONAL PUBLISHING STUDIO */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 via-[#18181b] to-blue-950/40 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/20">
                <Building2 className="w-3.5 h-3.5" /> EDUCATOR & INSTITUTE STUDIO
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Publish, Ingest Question Papers, and Run Institutional Batches
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                Nalanda offers a full suite for coaching institutes and educators. Upload existing exam PDFs or DOCX files to automatically generate structured CBE tests via Gemini AI, manage student batches, and publish to the public library.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Auto-Extraction
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Teacher Collaboration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Student Batch Forensics
                </span>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-3">
              <Link href="/tests/create">
                <button className="w-full py-3.5 px-6 rounded-xl bg-white text-stone-950 hover:bg-stone-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                  <span>Open Test Studio & Ingest PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard/educator">
                <button className="w-full py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all flex items-center justify-center gap-2">
                  <span>Educator Batch Dashboard</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. HIGH-CONVERSION BOTTOM CTA */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="p-8 sm:p-14 rounded-3xl border border-white/15 bg-radial from-blue-900/40 via-stone-900/60 to-[#161618] shadow-2xl space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-bold border border-white/10">
              ZERO-BARRIER ACCESS
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight max-w-2xl mx-auto">
              Begin Your Systematic Exam Preparation Today
            </h2>
            <p className="text-xs sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
              Explore the SSC CGL syllabus tree, take official previous-year papers, and diagnose your conceptual blindspots in real time.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/onboarding">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2">
                  <span>Start Free Exam Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all">
                  Instant Guest Access
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </KineticGrid>
  );
}
