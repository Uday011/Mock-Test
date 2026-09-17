'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  FileCheck,
  Building2,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  BookMarked,
  ChevronRight,
  Check,
  FileText,
  Target,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import CalloutBlock from '@/components/ui/CalloutBlock';

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
    <div className="bg-[#F7F7F5] text-[#202124] min-h-screen selection:bg-[#EEF0FB] selection:text-[#4F46A5]">
      <div className="space-y-16 sm:space-y-24 pb-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (WORKSPACE SHOWCASE & LIVE CBT SIMULATOR) */}
        {/* ========================================================================= */}
        <section className="pt-10 sm:pt-16 md:pt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Top Minimal Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E6E6E3] text-xs text-[#787774] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46A5]" />
              <span className="font-medium text-[#202124]">Nalanda Learning Workspace &middot; Deliberate Practice, Measurable Progress</span>
            </div>

            {/* Editorial Headline */}
            <div className="space-y-3.5 max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-semibold tracking-tight text-[#202124] leading-[1.2]">
                Master competitive examinations through structured intelligence.
              </h1>
              <p className="text-sm sm:text-base text-[#787774] max-w-2xl mx-auto leading-relaxed font-normal">
                A calm, intelligent knowledge workspace unifying prerequisite-mapped syllabus trees, 100% authentic computer-based testing, mistake forensics, and spaced repetition.
              </p>
            </div>

            {/* Minimalist Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-medium">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>

              <button
                onClick={handleStartQuickDemo}
                disabled={loadingDemo}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-md border border-[#E6E6E3] bg-white hover:bg-[#F1F1EF] text-[#202124] text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 min-h-[34px]"
              >
                {loadingDemo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Launching CBT Simulator...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#787774]" />
                    <span>Try Sample Mock Exam</span>
                  </>
                )}
              </button>

              <Link href="/tests/create" className="w-full sm:w-auto">
                <Button variant="ghost" size="md" className="w-full sm:w-auto text-[#787774] hover:text-[#202124]">
                  Test Studio
                </Button>
              </Link>
            </div>

            {/* Interactive Live CBT Exam Sandbox Preview Document */}
            <div className="pt-6 sm:pt-8 max-w-3xl mx-auto text-left">
              <div className="rounded-md border border-[#E6E6E3] bg-white shadow-xs overflow-hidden">
                {/* Simulator Header Bar */}
                <div className="bg-[#F1F1EF] border-b border-[#E6E6E3] px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1B5E20]" />
                    <span className="font-medium text-[#202124] tracking-tight">
                      CBT Simulator &middot; SSC CGL Tier-I
                    </span>
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-white text-[#787774] text-[11px] border border-[#E6E6E3]">
                      100 Qs &middot; 200 Marks
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FDF6EC] text-[#B7791F] font-mono text-xs font-semibold border border-[#F6E3C7]">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-white text-[#787774] text-[11px] font-mono border border-[#E6E6E3]">
                      +2.0 / -0.50
                    </span>
                  </div>
                </div>

                {/* Section Switcher Tabs */}
                <div className="bg-white border-b border-[#E6E6E3] px-4 sm:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { id: 'Quant', label: 'Quantitative Aptitude' },
                    { id: 'Reasoning', label: 'General Intelligence' },
                    { id: 'English', label: 'English Language' },
                    { id: 'GA', label: 'General Awareness' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSection(sec.id);
                        setSelectedOption(null);
                        setIsAnswerRevealed(false);
                      }}
                      className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                        activeSection === sec.id
                          ? 'bg-[#EEF0FB] text-[#4F46A5] font-medium'
                          : 'text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF]'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                {/* Question Area */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-[#787774]">
                      Question 14 of 25 &middot; Geometry Circles
                    </span>
                    <span className="text-[11px] text-[#787774]">
                      Click an option to test instant evaluation:
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-normal text-[#202124] leading-relaxed">
                    In a circle with centre O, two chords <strong>AB</strong> and <strong>CD</strong> intersect internally at point <strong>P</strong>. If <strong>AP = 6 cm</strong>, <strong>PB = 4 cm</strong>, and <strong>CP = 3 cm</strong>, find the length of segment <strong>PD</strong>.
                  </p>

                  {/* 4 Clean Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { label: 'A', text: '7.0 cm', isCorrect: false },
                      { label: 'B', text: '8.0 cm', isCorrect: true },
                      { label: 'C', text: '9.0 cm', isCorrect: false },
                      { label: 'D', text: '10.5 cm', isCorrect: false },
                    ].map((opt) => {
                      const isSelected = selectedOption === opt.label;
                      let btnStyle = 'border-[#E6E6E3] bg-white hover:bg-[#F1F1EF] text-[#202124]';

                      if (isAnswerRevealed) {
                        if (opt.isCorrect) {
                          btnStyle = 'border-[#C8E6C9] bg-[#EDF7ED] text-[#1B5E20]';
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = 'border-[#FEE2E2] bg-[#FEF2F2] text-[#C53030]';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-[#4F46A5] bg-[#EEF0FB] text-[#4F46A5]';
                      }

                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setSelectedOption(opt.label);
                            setIsAnswerRevealed(true);
                          }}
                          className={`p-2.5 rounded-md border text-left flex items-center justify-between gap-2 text-xs font-normal transition-colors ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#F1F1EF] font-mono text-xs flex items-center justify-center text-[#787774] shrink-0">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isAnswerRevealed && opt.isCorrect && (
                            <span className="text-[#1B5E20] text-[11px] font-medium flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Correct (+2.0)
                            </span>
                          )}
                          {isAnswerRevealed && isSelected && !opt.isCorrect && (
                            <span className="text-[#C53030] text-[11px] font-medium">
                              Incorrect (-0.50)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Callout Block */}
                  {isAnswerRevealed && (
                    <CalloutBlock
                      variant="saffron"
                      icon={<Sparkles className="w-4 h-4 text-[#B7791F]" />}
                      title="Intersecting Chords Theorem Derivation"
                    >
                      <p className="text-xs leading-relaxed">
                        When two chords intersect internally, the products of their segments are equal:
                        <br />
                        <span className="font-mono font-medium pt-0.5 block">
                          AP &times; PB = CP &times; PD &rArr; 6 &times; 4 = 3 &times; PD &rArr; PD = 8 cm.
                        </span>
                      </p>
                      {selectedOption !== 'B' && (
                        <p className="text-[11px] text-[#C53030] pt-1 font-medium">
                          &bull; Automatically logged to Mistake Notebook under &ldquo;Calculation Slip&rdquo; for spaced review.
                        </p>
                      )}
                    </CalloutBlock>
                  )}
                </div>

                {/* Simulator Footer Dock */}
                <div className="bg-[#F1F1EF] border-t border-[#E6E6E3] px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#787774]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1B5E20]" />
                    <span>Autosave active &middot; 5-state question palette enabled</span>
                  </div>

                  <button
                    onClick={handleStartQuickDemo}
                    className="text-xs text-[#4F46A5] hover:underline font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Launch 100-Q Exam</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. STATS & OPERATIONAL PROOF METRICS (CLEAN BORDERED STRIP) */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-md border border-[#E6E6E3] bg-white">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-2xl sm:text-3xl font-semibold text-[#202124] font-sans">12+</span>
              <p className="text-xs font-medium text-[#787774]">Test Frameworks</p>
              <span className="text-[11px] text-[#787774] block">Full Mocks, PYQs, Drills</span>
            </div>

            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-2xl sm:text-3xl font-semibold text-[#1B5E20] font-sans">100%</span>
              <p className="text-xs font-medium text-[#787774]">CBT Simulation Fidelity</p>
              <span className="text-[11px] text-[#787774] block">Official TCS iON compliance</span>
            </div>

            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-2xl sm:text-3xl font-semibold text-[#B7791F] font-sans">5-Tier</span>
              <p className="text-xs font-medium text-[#787774]">Syllabus Depth</p>
              <span className="text-[11px] text-[#787774] block">Exam &rarr; Subject &rarr; Topic</span>
            </div>

            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-2xl sm:text-3xl font-semibold text-[#4F46A5] font-sans">3-Day</span>
              <p className="text-xs font-medium text-[#787774]">Active Recall Cadence</p>
              <span className="text-[11px] text-[#787774] block">Spaced repetition engine</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. THE 4 ARCHITECTURAL PILLARS (MODULAR CONTENT BLOCKS) */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
              Platform Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202124] tracking-tight">
              The Four Architectural Pillars of Nalanda
            </h2>
            <p className="text-xs sm:text-sm text-[#787774] leading-relaxed max-w-2xl">
              Every system is interconnected: learning informs testing, testing fuels mistake forensics, and forensics dictate spaced revision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1 */}
            <div className="rounded-md border border-[#E6E6E3] bg-white p-5 space-y-3 hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-[#EEF0FB] text-[#4F46A5] font-medium text-[11px]">
                  Pillar 01 &middot; Pedagogy
                </span>
                <span className="text-[11px] text-[#787774]">14 Units</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#202124] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4F46A5]" />
                Prerequisite-Mapped Knowledge Trees
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                Foundational concepts unlock complex multi-step problems in a directed syllabus graph, eliminating cognitive overload.
              </p>
              <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                <span className="text-[#787774]">Structured hierarchy</span>
                <Link href="/learn" className="text-[#4F46A5] hover:underline font-medium flex items-center gap-0.5">
                  Explore Syllabus <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-md border border-[#E6E6E3] bg-white p-5 space-y-3 hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-[#FDF6EC] text-[#B7791F] font-medium text-[11px]">
                  Pillar 02 &middot; Testing
                </span>
                <span className="text-[11px] text-[#787774]">TCS Standard</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#202124] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B7791F]" />
                High-Fidelity CBT Test Simulator
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                Realistic exam conditions featuring the official 5-state question palette, composite section switches, autosave, and negative marking discipline.
              </p>
              <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                <span className="text-[#787774]">Real time pressure</span>
                <Link href="/tests" className="text-[#4F46A5] hover:underline font-medium flex items-center gap-0.5">
                  Browse Tests <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-md border border-[#E6E6E3] bg-white p-5 space-y-3 hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#C53030] font-medium text-[11px]">
                  Pillar 03 &middot; Forensics
                </span>
                <span className="text-[11px] text-[#787774]">8 Categories</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#202124] flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[#C53030]" />
                Autonomous Mistake Notebook
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                Every incorrect pick is logged automatically with error classifications: calculation slips, conceptual gaps, and question misreads with blind retries.
              </p>
              <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                <span className="text-[#787774]">Continuous revision</span>
                <Link href="/mistakes" className="text-[#4F46A5] hover:underline font-medium flex items-center gap-0.5">
                  Open Notebook <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-md border border-[#E6E6E3] bg-white p-5 space-y-3 hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-[#EDF7ED] text-[#1B5E20] font-medium text-[11px]">
                  Pillar 04 &middot; Intelligence
                </span>
                <span className="text-[11px] text-[#787774]">Gemini 3.6</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#202124] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1B5E20]" />
                Scientific Spaced Repetition & Coach
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                Topic accuracy updates mastery across 6 stages. High scores extend recall intervals; weak areas trigger immediate remedial drills.
              </p>
              <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                <span className="text-[#787774]">Leitner intervals</span>
                <Link href="/dashboard" className="text-[#4F46A5] hover:underline font-medium flex items-center gap-0.5">
                  View Readiness <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SUPPORTED EXAM ECOSYSTEMS (DATABASE PREVIEW) */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-end justify-between border-b border-[#E6E6E3] pb-2.5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
                Exam Coverage
              </span>
              <h2 className="text-xl font-semibold text-[#202124] tracking-tight mt-0.5">
                National Exam Ecosystems
              </h2>
            </div>
            <Link href="/exams" className="text-xs font-medium text-[#4F46A5] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                title: 'SSC CGL 2026',
                subtitle: 'Staff Selection Commission',
                tag: 'Tier I & II',
                desc: '100-Q Mocks, 14 topic units, official 2023 papers, and speed drills.',
              },
              {
                title: 'Banking & Insurance',
                subtitle: 'IBPS PO / SBI PO / RBI',
                tag: 'Prelims + Mains',
                desc: 'Sectional quant speed tests, syllogisms, circular puzzles, financial awareness.',
              },
              {
                title: 'Railways Recruitment',
                subtitle: 'RRB NTPC & Group D',
                tag: 'CBT 1 & 2',
                desc: 'Applied physics, railway general awareness, fast arithmetic calculation drills.',
              },
              {
                title: 'Civil Services CSE',
                subtitle: 'UPSC Prelims & State PSCs',
                tag: 'GS Paper I & II',
                desc: 'Reading comprehension, logical deductions, data sufficiency, policy frameworks.',
              },
            ].map((ex, i) => (
              <div
                key={i}
                className="p-4 rounded-md border border-[#E6E6E3] bg-white space-y-2 hover:border-[#CBD5E1] transition-colors flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                      {ex.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#202124]">{ex.title}</h3>
                  <p className="text-[10px] text-[#787774]">{ex.subtitle}</p>
                  <p className="text-xs text-[#787774] leading-relaxed pt-0.5">{ex.desc}</p>
                </div>
                <div className="pt-2 border-t border-[#E6E6E3] mt-2">
                  <Link href="/tests" className="text-xs font-medium text-[#4F46A5] hover:underline flex items-center gap-1">
                    Start Mocks <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. OFFICIAL 5-STATE QUESTION PALETTE */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md border border-[#E6E6E3] bg-white p-5 sm:p-6 space-y-3.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
                TCS iON Examination Standards
              </span>
              <h2 className="text-base font-semibold text-[#202124]">
                Official 5-State Question Palette Protocol
              </h2>
              <p className="text-xs text-[#787774]">
                Nalanda trains candidates to navigate the exact 5-state color-coded palette used in national CBT examinations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div className="p-2.5 rounded-md bg-[#F1F1EF] border border-[#E6E6E3] flex items-center gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-[3px] bg-white text-[#787774] font-mono text-xs font-medium flex items-center justify-center shrink-0 border border-[#E6E6E3]">
                  01
                </span>
                <div>
                  <span className="font-medium text-[#202124] block text-xs">Not Visited</span>
                  <span className="text-[10px] text-[#787774]">Unopened</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#FFFBEB] border border-[#FEF3C7] flex items-center gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-[3px] bg-[#B7791F] text-white font-mono text-xs font-medium flex items-center justify-center shrink-0">
                  02
                </span>
                <div>
                  <span className="font-medium text-[#B7791F] block text-xs">Unanswered</span>
                  <span className="text-[10px] text-[#787774]">Visited, left blank</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#EDF7ED] border border-[#C8E6C9] flex items-center gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-[3px] bg-[#1B5E20] text-white font-mono text-xs font-medium flex items-center justify-center shrink-0">
                  03
                </span>
                <div>
                  <span className="font-medium text-[#1B5E20] block text-xs">Answered</span>
                  <span className="text-[10px] text-[#787774]">Saved in score</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#EEF0FB] border border-[#DCDDF7] flex items-center gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-[3px] bg-[#4F46A5] text-white font-mono text-xs font-medium flex items-center justify-center shrink-0">
                  04
                </span>
                <div>
                  <span className="font-medium text-[#4F46A5] block text-xs">Review Flag</span>
                  <span className="text-[10px] text-[#787774]">For later review</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#EEF0FB] border border-[#DCDDF7] flex items-center gap-2.5 text-xs col-span-2 sm:col-span-1">
                <span className="w-5 h-5 rounded-[3px] bg-[#4F46A5] text-white font-mono text-xs font-medium flex items-center justify-center shrink-0 relative">
                  05
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] absolute -top-0.5 -right-0.5" />
                </span>
                <div>
                  <span className="font-medium text-[#202124] block text-xs">Answered & Review</span>
                  <span className="text-[10px] text-[#1B5E20]">Evaluated</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. EDUCATOR & PUBLISHING STUDIO */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md border border-[#E6E6E3] bg-white p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F46A5] bg-[#EEF0FB] px-2 py-0.5 rounded border border-[#DCDDF7]">
                <Building2 className="w-3.5 h-3.5" /> Educator & Publishing Hub
              </span>
              <h2 className="text-lg sm:text-xl font-semibold text-[#202124] tracking-tight">
                Publish tests, ingest question papers, and run student cohorts
              </h2>
              <p className="text-xs sm:text-sm text-[#787774] leading-relaxed">
                Upload existing PDFs or DOCX files to automatically generate structured CBE assessments, manage curriculum series, and publish free or paid resources to the public library.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
              <Link href="/tests/create" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  <span>Open Test Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
              <Link href="/dashboard/educator" className="w-full">
                <Button variant="secondary" size="md" className="w-full text-[#787774] hover:text-[#202124]">
                  Educator Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. BOTTOM CALLOUT */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#202124] tracking-tight">
            Begin your deliberate exam preparation.
          </h2>
          <p className="text-xs sm:text-sm text-[#787774] leading-relaxed">
            Explore the SSC CGL syllabus tree, take official previous-year papers, and diagnose your conceptual blindspots in real time.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Link href="/onboarding">
              <Button variant="primary" size="md">
                <span>Start Free Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                Direct Workspace Access
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
