'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Brain,
  Calculator,
  ArrowRight,
  Check,
  Calendar,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Flame,
  ArrowUpRight,
  Plus,
  FileCheck,
  Clock,
  ListTodo,
  BookMarked,
  Layers,
  HelpCircle,
  Zap,
  FileUp,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { DailyWarmupModals } from '@/components/dashboard/DailyWarmupModals';

interface WarmupState {
  read: boolean;
  think: boolean;
  calculate: boolean;
}

interface PlanTask {
  id: string;
  dotColor: string;
  badge: string;
  title: string;
  duration: string;
  completed: boolean;
  href: string;
}

export default function ExamCraftDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Active warm-up modal
  const [activeModal, setActiveModal] = useState<'read' | 'think' | 'calculate' | null>(null);

  // Warmup completion state (persisted per day)
  const [warmupState, setWarmupState] = useState<WarmupState>({
    read: true,
    think: true,
    calculate: false,
  });

  // Daily plan tasks matching North Star image exactly
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([
    {
      id: 'task-qa',
      dotColor: 'bg-[#E07A2B]',
      badge: 'QA',
      title: 'Arithmetic — 30 questions',
      duration: '35m',
      completed: false,
      href: '/question-bank?section=QA&topic=Arithmetic',
    },
    {
      id: 'task-dilr',
      dotColor: 'bg-[#6E62E5]',
      badge: 'DILR',
      title: '2 Sets',
      duration: '40m',
      completed: false,
      href: '/question-bank?section=DILR&topic=Arrangements',
    },
    {
      id: 'task-varc',
      dotColor: 'bg-[#3B82F6]',
      badge: 'VARC',
      title: '2 RC Passages',
      duration: '35m',
      completed: false,
      href: '/question-bank?section=VARC&topic=Reading+Comprehension',
    },
    {
      id: 'task-revision',
      dotColor: 'bg-[#2E7D62]',
      badge: 'Revision',
      title: 'Review 10 mistakes',
      duration: '15m',
      completed: false,
      href: '/mistakes',
    },
  ]);

  // Load dashboard data and restore persistent state
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((authData) => {
        if (authData.user) setUser(authData.user);
      })
      .catch(() => {});

    fetch('/api/dashboard/overview')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));

    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const savedWarmup = localStorage.getItem(`examcraft_warmup_${todayKey}`);
      if (savedWarmup) setWarmupState(JSON.parse(savedWarmup));

      const savedPlan = localStorage.getItem(`examcraft_plan_${todayKey}`);
      if (savedPlan) setPlanTasks(JSON.parse(savedPlan));
    } catch {}
  }, []);

  const handleCompleteActivity = (activity: 'read' | 'think' | 'calculate') => {
    const todayKey = new Date().toISOString().slice(0, 10);
    setWarmupState((prev) => {
      const next = { ...prev, [activity]: true };
      localStorage.setItem(`examcraft_warmup_${todayKey}`, JSON.stringify(next));
      return next;
    });
  };

  const handleToggleTask = (taskId: string) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    setPlanTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      localStorage.setItem(`examcraft_plan_${todayKey}`, JSON.stringify(next));
      return next;
    });
  };

  const completedWarmupCount =
    (warmupState.read ? 1 : 0) + (warmupState.think ? 1 : 0) + (warmupState.calculate ? 1 : 0);

  const completedPlanCount = planTasks.filter((t) => t.completed).length;

  const handleContinueWarmup = () => {
    if (!warmupState.read) {
      setActiveModal('read');
    } else if (!warmupState.think) {
      setActiveModal('think');
    } else if (!warmupState.calculate) {
      setActiveModal('calculate');
    } else {
      router.push('/question-bank');
    }
  };

  // Readiness and stats
  const readinessIndex = data?.stats?.readinessIndex ?? 74;
  const predictedScore = data?.stats?.predictedScore ?? 118;
  const maxScore = data?.stats?.maxScore ?? 198;
  const accuracyRate = data?.stats?.accuracyRate ?? 69;
  const daysRemaining = data?.daysRemaining ?? 68;

  // Sectional accuracies
  const varcAccuracy = data?.stats?.sectionAccuracy?.varc ?? 78;
  const dilrAccuracy = data?.stats?.sectionAccuracy?.dilr ?? 61;
  const qaAccuracy = data?.stats?.sectionAccuracy?.qa ?? 69;

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-28 space-y-3">
          <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink-muted font-mono tracking-wide">
            Loading ExamCraft Command Center...
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="w-full space-y-5 pb-16 select-none">
        
        {/* ========================================================================= */}
        {/* 1. MOBILE REFINED VIEW (< md): VALUE-FIRST 3-THUMB ARCHITECTURE          */}
        {/* ========================================================================= */}
        <div className="md:hidden space-y-4">
          
          {/* SCREEN 1A: COMMAND STRIP STATUS BAR */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div>
              <span className="text-[11px] text-ink-muted block font-normal">Good morning,</span>
              <h1 className="text-xl font-bold text-ink tracking-tight">
                {user?.name?.split(' ')[0] || 'Uday'}.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary border border-line text-[11px] font-semibold text-ink shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-[#E07A2B]" />
                <span>8d</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary border border-line text-[11px] font-medium text-ink shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>{daysRemaining}d to CAT</span>
              </div>
            </div>
          </div>

          {/* SCREEN 1B: COMPACT WARM-UP (HORIZONTAL SNAP CAROUSEL) */}
          <section className="rounded-hero border border-line bg-surface p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-ink">Daily Warm-up</h2>
                  <span className="text-[10px] text-ink-muted font-normal">15 mins logic activation</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium text-ink-muted">
                  {completedWarmupCount}/3
                </span>
                <button
                  onClick={handleContinueWarmup}
                  className="px-2.5 py-1 rounded-full bg-accent text-white text-[10px] font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1"
                >
                  <span>{completedWarmupCount === 3 ? 'Review' : 'Continue'}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Snap Scroll Cards */}
            <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1 -mx-1 px-1">
              {/* Mobile Card 01: Read */}
              <div className="w-[78vw] shrink-0 snap-start p-3.5 rounded-card border border-line bg-surface flex flex-col justify-between space-y-2.5 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent/10 text-accent font-mono">
                      01
                    </span>
                    {warmupState.read ? (
                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-line" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-ink">Read • AEON Essay</h3>
                  <p className="text-[11px] text-ink leading-snug font-medium line-clamp-2">
                    Why do humans struggle to make rational decisions?
                  </p>
                  <span className="text-[10px] text-ink-muted font-mono block">~7 mins • Inferences</span>
                </div>
                <button
                  onClick={() => setActiveModal('read')}
                  className="w-full py-1.5 rounded-btn bg-secondary border border-line text-ink text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Mobile Card 02: Think (9x9 Sudoku) */}
              <div className="w-[78vw] shrink-0 snap-start p-3.5 rounded-card border border-line bg-surface flex flex-col justify-between space-y-2.5 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FDF6EC] text-[#B7791F] font-mono">
                      02
                    </span>
                    {warmupState.think ? (
                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-line" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-ink">Think • 9×9 Sudoku</h3>
                  <p className="text-[11px] text-ink leading-snug font-medium line-clamp-2">
                    Classical 9×9 Sudoku logic puzzle for CAT analytical activation.
                  </p>
                  <span className="text-[10px] text-ink-muted font-mono block">~5 mins • DILR Grid</span>
                </div>
                <button
                  onClick={() => setActiveModal('think')}
                  className="w-full py-1.5 rounded-btn bg-secondary border border-line text-ink text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Solve Sudoku</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Mobile Card 03: Calculate */}
              <div className="w-[78vw] shrink-0 snap-start p-3.5 rounded-card border border-line bg-surface flex flex-col justify-between space-y-2.5 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#EDF7ED] text-[#1B5E20] font-mono">
                      03
                    </span>
                    {warmupState.calculate ? (
                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-line" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-ink">Calculate • Smart Maths</h3>
                  <p className="text-[11px] text-ink leading-snug font-medium line-clamp-2">
                    5 speed drills on fractions, squares, ratios, and roots.
                  </p>
                  <span className="text-[10px] text-ink-muted font-mono block">~5 mins • 5 Qs Speed</span>
                </div>
                <button
                  onClick={() => setActiveModal('calculate')}
                  className="w-full py-1.5 rounded-btn bg-secondary border border-line text-ink text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </section>

          {/* SCREEN 2A: TODAY'S CAT PLAN (PRIMARY ACTION HERO) */}
          <section className="rounded-hero border border-line bg-surface p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-ink flex items-center justify-center">
                  <ListTodo className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-ink">Today&apos;s Plan</h2>
                  <span className="text-[10px] text-ink-muted font-normal">2h 25m total target</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-ink-muted">
                  {completedPlanCount}/{planTasks.length}
                </span>
                <button
                  onClick={() => {
                    const firstIncomplete = planTasks.find((t) => !t.completed);
                    if (firstIncomplete) router.push(firstIncomplete.href);
                  }}
                  className="px-2.5 py-1 rounded-full bg-secondary text-ink text-[10px] font-semibold border border-line flex items-center gap-1"
                >
                  <span>Start</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {planTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="group flex items-center justify-between p-3 rounded-card border border-line bg-surface hover:bg-secondary/40 cursor-pointer transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      task.completed ? 'bg-accent border-accent text-white' : 'border-line bg-surface'
                    }`}>
                      {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.dotColor}`} />

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-ink shrink-0">
                        {task.badge}
                      </span>
                      <span className={`text-xs truncate ${task.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
                        {task.title}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-ink-muted shrink-0 pl-2">
                    {task.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SCREEN 2B: PRIORITY FOCUS (DIRECT WEAK-AREA ACTION CARD) */}
          <section className="rounded-hero border border-line bg-surface p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6E62E5]/15 text-[#6E62E5] flex items-center justify-center">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-ink">Priority Focus Area</h2>
              </div>
              <span className="text-[10px] font-bold text-[#6E62E5] uppercase tracking-wider">
                DILR
              </span>
            </div>

            <div className="p-3 rounded-card bg-secondary/50 border border-line space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-ink">Linear & Circular Arrangements</h3>
                  <p className="text-[11px] text-ink-muted">12 errors in last 30 questions</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block uppercase font-medium">Accuracy</span>
                  <span className="text-xs font-bold font-mono text-coral">54%</span>
                </div>
              </div>

              <Link
                href="/question-bank?section=DILR&topic=Arrangements"
                className="w-full py-2.5 rounded-btn bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Practice Focus Area (10 Qs)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* SCREEN 3A: PERFORMANCE SNAPSHOT CARD */}
          <section className="rounded-hero border border-line bg-surface p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-ink">Performance Snapshot</h2>
              </div>
              <Link
                href="/performance"
                className="text-[11px] text-accent font-medium hover:underline flex items-center gap-0.5"
              >
                <span>Full Analysis</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-card bg-secondary/40 border border-line">
                <span className="text-[10px] text-ink-muted block uppercase font-semibold">Readiness Index</span>
                <span className="text-base font-bold font-mono text-ink">{readinessIndex}%</span>
                <span className="text-[10px] text-accent font-medium block">Competitive</span>
              </div>
              <div className="p-2.5 rounded-card bg-secondary/40 border border-line">
                <span className="text-[10px] text-ink-muted block uppercase font-semibold">Predicted Percentile</span>
                <span className="text-base font-bold font-mono text-accent">98.4 %ile</span>
                <span className="text-[10px] text-ink-muted font-mono block">{predictedScore}m / 198m</span>
              </div>
            </div>

            {/* Compact Sectional Bars */}
            <div className="space-y-2 pt-1 border-t border-line">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">VARC</span>
                  <span className="font-mono text-ink font-semibold">{varcAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: `${varcAccuracy}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">DILR</span>
                  <span className="font-mono text-ink font-semibold">{dilrAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#6E62E5] h-1.5 rounded-full" style={{ width: `${dilrAccuracy}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">QA</span>
                  <span className="font-mono text-ink font-semibold">{qaAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#E07A2B] h-1.5 rounded-full" style={{ width: `${qaAccuracy}%` }} />
                </div>
              </div>
            </div>
          </section>

          {/* SCREEN 3B: QUICK ACCESS 2x2 TILES */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider px-1">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/tests/create"
                className="p-3 rounded-card border border-line bg-surface hover:bg-secondary flex flex-col justify-between space-y-2 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-ink text-xs">PDF to Mock</div>
                  <div className="text-[10px] text-ink-muted">Instant AI Paper Convert</div>
                </div>
              </Link>

              <Link
                href="/tests"
                className="p-3 rounded-card border border-line bg-surface hover:bg-secondary flex flex-col justify-between space-y-2 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-ink text-xs">Full Mock</div>
                  <div className="text-[10px] text-ink-muted">Simulate CAT Slot</div>
                </div>
              </Link>

              <Link
                href="/question-bank"
                className="p-3 rounded-card border border-line bg-surface hover:bg-secondary flex flex-col justify-between space-y-2 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-ink text-xs">Practice Bank</div>
                  <div className="text-[10px] text-ink-muted">Topic Diagnostic Drills</div>
                </div>
              </Link>

              <Link
                href="/mistakes"
                className="p-3 rounded-card border border-line bg-surface hover:bg-secondary flex flex-col justify-between space-y-2 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-ink text-xs">Error Notebook</div>
                  <div className="text-[10px] text-ink-muted">Spaced Repetition</div>
                </div>
              </Link>
            </div>
          </section>

        </div>

        {/* ========================================================================= */}
        {/* 2. DESKTOP VIEW (>= md): FULL 2-COLUMN GRID MATCHING REFERENCE IMAGE     */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-5">
          
          {/* ======================================================= */}
          {/* LEFT COLUMN (Main: 8 Cols)                             */}
          {/* ======================================================= */}
          <div className="md:col-span-8 space-y-5">
            
            {/* 1. HERO BANNER CARD (Greeting + Mountain Art) */}
            <div className="relative overflow-hidden rounded-hero border border-line bg-surface p-6 sm:p-7 min-h-[170px] flex flex-col justify-between shadow-xs">
              {/* Right Mountain Landscape Background with Gradient Mask */}
              <div 
                className="absolute top-0 right-0 bottom-0 w-1/2 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--color-surface, #ffffff) 0%, rgba(255,255,255,0.2) 25%, transparent 55%), linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80')`,
                }}
              >
                <div className="absolute top-5 right-6 max-w-[190px] text-right">
                  <p className="text-xs text-white/95 font-medium leading-snug drop-shadow-md">
                    &ldquo;A calm mind solves harder questions.&rdquo;
                  </p>
                </div>
              </div>

              {/* Left Content */}
              <div className="relative z-10 max-w-md space-y-3.5">
                <div>
                  <span className="text-xs text-ink-muted block font-normal">
                    Good morning,
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                    {user?.name?.split(' ')[0] || 'Uday'}.
                  </h1>
                  <p className="text-xs text-ink-muted mt-1 font-normal">
                    Discipline today. A stronger you tomorrow.
                  </p>
                </div>

                {/* Badges and Handwritten Quote Row */}
                <div className="flex items-center gap-3 pt-0.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-line text-xs font-semibold text-ink shadow-2xs">
                    <Target className="w-3.5 h-3.5 text-accent" />
                    <span>CAT 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-line text-xs font-medium text-ink-muted shadow-2xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{daysRemaining} days left</span>
                  </div>
                  <span className="font-serif italic text-xs text-ink-muted ml-2">
                    Small steps compound.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DAILY WARM-UP CARD (3 Cards in a Row: Read, Think, Calculate) */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-4 shadow-xs">
              {/* Header Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink tracking-tight">
                      Daily Warm-up
                    </h2>
                    <span className="text-[11px] text-ink-muted block font-normal">
                      15 minutes to get your brain in the zone.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-ink-muted">
                      {completedWarmupCount} / 3 completed
                    </span>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden border border-line/60">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${(completedWarmupCount / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleContinueWarmup}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors shadow-2xs"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3 Activity Cards Grid */}
              <div className="grid grid-cols-3 gap-3.5 pt-1">
                {/* Card 01: Read */}
                <div className="p-4 rounded-card border border-line bg-surface hover:border-line/80 flex flex-col justify-between space-y-3.5 shadow-2xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent font-mono">
                        01
                      </span>
                      {warmupState.read ? (
                        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-line" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-ink">Read</h3>
                      <p className="text-[11px] text-ink-muted">Today&apos;s AEON Article</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                      <Clock className="w-3 h-3 text-accent" />
                      <span>~ 7 min</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="h-16 rounded-lg bg-cover bg-center overflow-hidden border border-line"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80')`,
                        }}
                      />
                      <p className="text-[11px] font-semibold text-ink leading-snug line-clamp-2">
                        Why do humans struggle to make rational decisions?
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        Reading
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        Inference
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        VARC
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('read')}
                    className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 02: Think (9x9 Classical Sudoku) */}
                <div className="p-4 rounded-card border border-line bg-surface hover:border-line/80 flex flex-col justify-between space-y-3.5 shadow-2xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FDF6EC] text-[#B7791F] font-mono">
                        02
                      </span>
                      {warmupState.think ? (
                        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-line" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-ink">Think</h3>
                      <p className="text-[11px] text-ink-muted">Today&apos;s Puzzle</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                      <Clock className="w-3 h-3 text-[#B7791F]" />
                      <span>~ 5 min</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="h-16 rounded-lg bg-cover bg-center overflow-hidden border border-line"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=400&q=80')`,
                        }}
                      />
                      <p className="text-[11px] font-semibold text-ink leading-snug line-clamp-2">
                        9×9 Classical Sudoku Logic
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        Logic
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        Sudoku
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted font-medium">
                        DILR
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('think')}
                    className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Puzzle</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 03: Calculate */}
                <div className="p-4 rounded-card border border-line bg-surface hover:border-line/80 flex flex-col justify-between space-y-3.5 shadow-2xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDF7ED] text-[#1B5E20] font-mono">
                        03
                      </span>
                      {warmupState.calculate ? (
                        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-line" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-ink">Calculate</h3>
                      <p className="text-[11px] text-ink-muted">Smart Maths Quiz</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                      <Clock className="w-3 h-3 text-[#1B5E20]" />
                      <span>~ 5 min</span>
                    </div>

                    <div className="space-y-1 pt-1 text-[11px] text-ink-muted leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#1B5E20]" />
                        <span>5 quick speed questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#1B5E20]" />
                        <span>Mental arithmetic & fractions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#1B5E20]" />
                        <span>Algebraic identities</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#1B5E20]" />
                        <span>CAT-style questions</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('calculate')}
                    className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Start Quiz</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. TODAY'S CAT PLAN */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary text-ink flex items-center justify-center">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink tracking-tight">
                      Today&apos;s CAT Plan
                    </h2>
                    <span className="text-[11px] text-ink-muted block font-normal">
                      2h 25m • 4 tasks
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-ink-muted">
                    {completedPlanCount} / {planTasks.length} completed
                  </span>
                  <button
                    onClick={() => {
                      const firstIncomplete = planTasks.find((t) => !t.completed);
                      if (firstIncomplete) router.push(firstIncomplete.href);
                    }}
                    className="px-3 py-1.5 rounded-full border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>Start Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {planTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="group flex items-center justify-between p-3.5 rounded-card border border-line bg-surface hover:border-line/80 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-accent border-accent text-white' : 'border-line bg-surface'
                      }`}>
                        {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>

                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${task.dotColor}`} />

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-ink">
                          {task.badge}
                        </span>
                        <span className={`text-xs truncate ${task.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-ink-muted pl-2 shrink-0">
                      <span className="text-[11px] font-mono">{task.duration}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:text-ink transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. BOTTOM 3 ACTION CARDS */}
            <div className="grid grid-cols-3 gap-3.5">
              <div className="p-4 rounded-card border border-line bg-surface flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-ink">Create a Custom Test</h3>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Convert PDF to mock, mix topics, set timer, and practice your way.
                  </p>
                </div>
                <Link
                  href="/tests/create"
                  className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                >
                  <span>Create Test</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-card border border-line bg-surface flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-ink">Take a Mock</h3>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Simulate the real CAT experience with full sectional timings.
                  </p>
                </div>
                <Link
                  href="/tests"
                  className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                >
                  <span>Go to Mocks</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-card border border-line bg-surface flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-ink">Review Mistakes</h3>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Turn repeated errors into mastery with spaced repetition review.
                  </p>
                </div>
                <Link
                  href="/mistakes"
                  className="w-full py-2 rounded-btn border border-line bg-secondary hover:bg-line text-xs font-semibold text-ink transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Notebook</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN (Sidebar: 4 Cols)                         */}
          {/* ======================================================= */}
          <div className="md:col-span-4 space-y-5">
            
            {/* 1. YOUR PROGRESS CARD */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <BookMarked className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-ink">Your Progress</h2>
                </div>
                <Link
                  href="/performance"
                  className="text-xs text-accent font-medium hover:underline flex items-center gap-0.5"
                >
                  <span>View Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-ink-muted">VARC</span>
                    <span className="font-mono text-ink font-semibold">{varcAccuracy}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                    <div className="bg-[#3B82F6] h-2 rounded-full transition-all duration-700" style={{ width: `${varcAccuracy}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-ink-muted">DILR</span>
                    <span className="font-mono text-ink font-semibold">{dilrAccuracy}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                    <div className="bg-[#6E62E5] h-2 rounded-full transition-all duration-700" style={{ width: `${dilrAccuracy}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-ink-muted">QA</span>
                    <span className="font-mono text-ink font-semibold">{qaAccuracy}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                    <div className="bg-[#E07A2B] h-2 rounded-full transition-all duration-700" style={{ width: `${qaAccuracy}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                <span className="text-ink-muted">Overall Practice Accuracy</span>
                <span className="font-bold font-mono text-ink">{accuracyRate}%</span>
              </div>

              <div className="p-2.5 rounded-card bg-secondary/50 border border-line flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-ink-muted block uppercase font-bold">Predicted Target</span>
                  <span className="text-accent font-bold font-mono">98.4 %ile ({predictedScore}m)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block uppercase font-bold">Readiness Index</span>
                  <span className="font-bold font-mono text-ink">{readinessIndex}%</span>
                </div>
              </div>
            </section>

            {/* 2. 8 DAY STREAK CARD */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Flame className="w-4 h-4 text-[#E07A2B]" />
                    <span>8 day streak</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-ink-muted">{day}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          idx < 5 ? 'bg-accent ring-2 ring-accent/20' : 'bg-secondary border border-line'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right max-w-[130px] space-y-1">
                  <p className="text-[11px] text-ink-muted leading-tight">
                    Consistency today creates freedom tomorrow.
                  </p>
                  <svg className="w-20 h-6 ml-auto" viewBox="0 0 80 24">
                    <path
                      d="M 2 20 Q 25 18, 40 10 T 78 4"
                      fill="none"
                      stroke="#2E7D62"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </section>

            {/* 3. CURRENT FOCUS CARD */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#6E62E5]/10 text-[#6E62E5] flex items-center justify-center">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-ink">Current Focus</h2>
                </div>
                <Link
                  href="/learn"
                  className="text-xs text-accent font-medium hover:underline"
                >
                  Change
                </Link>
              </div>

              <div className="flex items-center justify-between p-3 rounded-card bg-secondary/50 border border-line">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6E62E5]/15 text-[#6E62E5] flex items-center justify-center font-bold text-xs">
                    DI
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#6E62E5] uppercase tracking-wider block">
                      DILR
                    </span>
                    <span className="text-xs font-bold text-ink">
                      Arrangements
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-btn bg-secondary border border-line">
                  <span className="text-[10px] text-ink-muted block">Accuracy</span>
                  <span className="text-sm font-bold font-mono text-ink">54%</span>
                </div>
                <div className="p-2.5 rounded-btn bg-secondary border border-line">
                  <span className="text-[10px] text-ink-muted block">Mistakes</span>
                  <span className="text-xs font-medium text-ink-muted">12 in last 30</span>
                </div>
              </div>

              <Link
                href="/question-bank?section=DILR&topic=Arrangements"
                className="w-full py-2.5 rounded-btn bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span>Practice Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>

            {/* 4. QUICK LINKS CARD */}
            <section className="rounded-hero border border-line bg-surface p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider">
                Quick Links
              </h2>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/question-bank"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <Target className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate text-[11px] font-medium">Practice Weak Areas</span>
                </Link>

                <Link
                  href="/mistakes"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <BookMarked className="w-3.5 h-3.5 text-lavender shrink-0" />
                  <span className="truncate text-[11px] font-medium">Review Mistakes</span>
                </Link>

                <Link
                  href="/tests"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate text-[11px] font-medium">Take a Mock</span>
                </Link>

                <Link
                  href="/tests/create"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate text-[11px] font-medium">Create Test</span>
                </Link>

                <Link
                  href="/learn"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate text-[11px] font-medium">Study Calendar</span>
                </Link>

                <Link
                  href="/tests"
                  className="p-2.5 rounded-card border border-line bg-surface hover:bg-secondary flex items-center gap-1.5 text-ink transition-colors shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate text-[11px] font-medium">PYQs</span>
                </Link>
              </div>
            </section>

            {/* 5. AMBIENT INSPIRATION QUOTE CARD */}
            <div className="p-4 rounded-hero border border-line bg-surface space-y-2 relative overflow-hidden shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-accent/5 absolute -right-4 -bottom-4 pointer-events-none" />
              <span className="text-base text-ink-muted font-serif">“</span>
              <p className="text-xs font-medium text-ink leading-relaxed">
                Better questions create a better you.
              </p>
              <span className="text-[10px] text-ink-muted font-mono block">
                — ExamCraft
              </span>
            </div>

          </div>

        </div>

        {/* Daily Warmup Modals (9x9 Sudoku, AEON Read, Calculate Quiz) */}
        <DailyWarmupModals
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          onCompleteActivity={(act) => {
            handleCompleteActivity(act);
            setActiveModal(null);
          }}
        />

      </div>
    </AppShell>
  );
}
