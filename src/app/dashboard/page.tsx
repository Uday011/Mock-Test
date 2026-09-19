'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Brain,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DailyWarmupModals } from '@/components/dashboard/DailyWarmupModals';

interface WarmupState {
  read: boolean;
  think: boolean;
  calculate: boolean;
}

interface PlanTask {
  id: string;
  subject: string;
  title: string;
  durationMinutes: number;
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

  // Warmup completion state
  const [warmupState, setWarmupState] = useState<WarmupState>({
    read: false,
    think: false,
    calculate: false,
  });

  // Daily plan tasks
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([
    {
      id: 'task-qa',
      subject: 'QA',
      title: 'Arithmetic — 30 questions',
      durationMinutes: 35,
      completed: false,
      href: '/question-bank?section=QA&topic=Arithmetic',
    },
    {
      id: 'task-dilr',
      subject: 'DILR',
      title: '2 sets (Arrangements & Selection)',
      durationMinutes: 40,
      completed: false,
      href: '/question-bank?section=DILR&topic=Arrangements',
    },
    {
      id: 'task-varc',
      subject: 'VARC',
      title: '2 RC passages (Inference & Tone)',
      durationMinutes: 35,
      completed: false,
      href: '/question-bank?section=VARC&topic=Reading+Comprehension',
    },
    {
      id: 'task-revision',
      subject: 'REVISION',
      title: '10 mistake questions',
      durationMinutes: 15,
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

    // Restore today's warm-up and plan states from localStorage
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

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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

  const daysRemaining = data?.daysRemaining || 436;
  const currentFocus = data?.currentFocus || {
    subject: 'DILR',
    topic: 'Arrangements',
    accuracy: 54,
    mistakesCount: 12,
    totalRecent: 30,
    recommendation: 'Practice 2 medium-difficulty arrangement sets.',
    practiceUrl: '/question-bank?section=DILR&topic=Arrangements',
  };
  const sectionAcc = data?.stats?.sectionAccuracy || {
    varc: 78,
    dilr: 61,
    qa: 69,
    overall: 69,
  };
  const streakDays = data?.stats?.streakDays || 8;
  const weeklyHours = data?.stats?.weeklyHours || 12.4;

  const completedWarmupCount =
    (warmupState.read ? 1 : 0) + (warmupState.think ? 1 : 0) + (warmupState.calculate ? 1 : 0);
  const isBrainWarmedUp = completedWarmupCount === 3;

  const completedPlanCount = planTasks.filter((t) => t.completed).length;
  const completedMinutes = planTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + t.durationMinutes, 0);

  const nextUncompletedTask = planTasks.find((t) => !t.completed) || planTasks[0];

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-4xl mx-auto space-y-7 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER & GREETING */}
        {/* ========================================================= */}
        <div className="border-b border-line pb-5 pt-1 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-ink-muted mb-1">
              <span className="font-semibold text-accent">ExamCraft</span>
              <span>·</span>
              <span>Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Aspirant'}.
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Let's get your brain warmed up.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-surface px-3 py-1.5 rounded-full border border-line">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-ink">CAT 2026</span>
            <span className="text-[11px] text-ink-muted">·</span>
            <span className="text-xs font-mono font-medium text-ink-muted">
              {daysRemaining} days remaining
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. DAILY WARM-UP — HERO SECTION */}
        {/* ========================================================= */}
        <section className="bg-surface border border-line rounded-hero p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-ink rounded-xs" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Daily Warm-Up
                </h2>
                <span className="text-xs text-ink-muted">
                  ({completedWarmupCount} / 3 completed)
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                15–20 minutes to get your brain switched on.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[
                { key: 'read', label: 'Read', done: warmupState.read },
                { key: 'think', label: 'Think', done: warmupState.think },
                { key: 'calculate', label: 'Calculate', done: warmupState.calculate },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    item.done
                      ? 'bg-green/15 border-green/30 text-green'
                      : 'bg-canvas border-line text-ink-muted'
                  }`}
                >
                  {item.done && <Check className="w-3 h-3 text-green" />}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* If Brain Warmed Up: Show Signature Transition Banner */}
          {isBrainWarmedUp ? (
            <div className="p-4 sm:p-5 rounded-card bg-accent/8 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Brain Warmed Up
                  </span>
                </div>
                <p className="text-sm font-semibold text-ink">
                  You're ready for today's CAT preparation.
                </p>
                <div className="flex items-center gap-3 text-xs text-ink-muted pt-0.5">
                  <span className="flex items-center gap-1 text-green">
                    <Check className="w-3.5 h-3.5" /> Read
                  </span>
                  <span className="flex items-center gap-1 text-green">
                    <Check className="w-3.5 h-3.5" /> Think
                  </span>
                  <span className="flex items-center gap-1 text-green">
                    <Check className="w-3.5 h-3.5" /> Calculate
                  </span>
                </div>
              </div>

              <Link href={nextUncompletedTask.href}>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto shadow-sm active:scale-98"
                >
                  <span>Start Today's Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            /* 3 Activities Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Activity A: READ */}
              <div
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  warmupState.read
                    ? 'border-green/30 bg-green/5'
                    : 'border-line bg-surface hover:border-accent/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#4F46A5] bg-[#EEF0FB] px-2 py-0.5 rounded">
                      Read
                    </span>
                    <span className="text-[11px] font-mono text-[#787774]">7 min</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">
                      Today's AEON Article
                    </h3>
                    <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                      Build reading comprehension and inference skills.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('read')}
                  className={`w-full py-2.5 px-3 min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98 ${
                    warmupState.read
                      ? 'bg-[#E8F5E9] text-[#1B5E20]'
                      : 'bg-[#202124] hover:bg-[#37352F] text-white'
                  }`}
                >
                  {warmupState.read ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Completed
                    </>
                  ) : (
                    <>
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Activity B: THINK */}
              <div
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  warmupState.think
                    ? 'border-[#C8E6C9] bg-[#F7FBF7]'
                    : 'border-[#E6E6E3] bg-white hover:border-[#B7791F]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7791F] bg-[#FDF6EC] px-2 py-0.5 rounded">
                      Think
                    </span>
                    <span className="text-[11px] font-mono text-[#787774]">~5 min</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">
                      Today's Brain Puzzle
                    </h3>
                    <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                      Activate logical reasoning with Sudoku logic.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('think')}
                  className={`w-full py-2.5 px-3 min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98 ${
                    warmupState.think
                      ? 'bg-[#E8F5E9] text-[#1B5E20]'
                      : 'bg-[#202124] hover:bg-[#37352F] text-white'
                  }`}
                >
                  {warmupState.think ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Completed
                    </>
                  ) : (
                    <>
                      <span>Solve Puzzle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Activity C: CALCULATE */}
              <div
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  warmupState.calculate
                    ? 'border-[#C8E6C9] bg-[#F7FBF7]'
                    : 'border-[#E6E6E3] bg-white hover:border-[#1B5E20]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B5E20] bg-[#EDF7ED] px-2 py-0.5 rounded">
                      Calculate
                    </span>
                    <span className="text-[11px] font-mono text-[#787774]">5 Qs</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">
                      Smart Maths
                    </h3>
                    <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                      Mental maths & numerical agility speed quiz.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('calculate')}
                  className={`w-full py-2.5 px-3 min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98 ${
                    warmupState.calculate
                      ? 'bg-[#E8F5E9] text-[#1B5E20]'
                      : 'bg-[#202124] hover:bg-[#37352F] text-white'
                  }`}
                >
                  {warmupState.calculate ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Completed
                    </>
                  ) : (
                    <>
                      <span>Start Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* ROW 2: TODAY'S CAT PLAN & CURRENT FOCUS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* TODAY'S CAT PLAN */}
          <section className="bg-white border border-[#E6E6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#202124] rounded-xs" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                      Today's CAT Plan
                    </h2>
                  </div>
                  <p className="text-xs text-[#787774] mt-0.5">
                    {completedPlanCount} / {planTasks.length} completed · Estimated time: 2h 25m
                  </p>
                </div>
                {completedMinutes > 0 && (
                  <span className="text-[11px] font-mono text-[#4F46A5] bg-[#EEF0FB] px-2 py-0.5 rounded font-semibold">
                    {completedMinutes}m done
                  </span>
                )}
              </div>

              {/* Task list */}
              <div className="space-y-2 pt-3">
                {planTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      task.completed
                        ? 'border-[#E6E6E3] bg-[#FCFBF9] opacity-75'
                        : 'border-[#E6E6E3] hover:border-[#202124] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          task.completed
                            ? 'bg-[#1B5E20] border-[#1B5E20] text-white'
                            : 'border-[#D3D3CE] bg-white hover:border-[#202124]'
                        }`}
                        aria-label="Toggle task completion"
                      >
                        {task.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#202124]">
                            {task.subject}
                          </span>
                          <span
                            className={`text-xs font-medium truncate ${
                              task.completed ? 'line-through text-[#787774]' : 'text-[#202124]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#787774] font-mono">
                          {task.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <Link
                      href={task.href}
                      className="p-1.5 text-[#787774] hover:text-[#4F46A5] rounded-lg transition-colors shrink-0"
                      title="Launch task"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Primary CTA */}
            <div className="pt-2">
              <Link href={nextUncompletedTask.href}>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center min-h-[42px]"
                >
                  <span>Start Today's Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* CURRENT FOCUS / WEAK AREA */}
          <section className="bg-white border border-[#E6E6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#F1F1EF]">
                <span className="w-2 h-2 bg-[#C53030] rounded-xs" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                  Your Current Focus
                </h2>
              </div>

              <div className="pt-3 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#4F46A5]">
                    {currentFocus.subject} · {currentFocus.topic}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-[#787774] mt-1">
                    <span className="font-mono text-rose-600 font-semibold">
                      {currentFocus.accuracy}% accuracy
                    </span>
                    <span>•</span>
                    <span>{currentFocus.mistakesCount} mistakes in last {currentFocus.totalRecent} questions</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#37352F] leading-relaxed">
                  <span className="font-semibold text-[#202124]">Recommended:</span>{' '}
                  {currentFocus.recommendation}
                </div>
              </div>
            </div>

            {/* 1-Click Action to Practice pre-filtered */}
            <div className="pt-2">
              <Link href={currentFocus.practiceUrl}>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#202124] hover:bg-[#37352F] text-white text-xs font-semibold transition-all active:scale-98">
                  <span>Practice This Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: COMPACT PROGRESS & STUDY CONSISTENCY */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* COMPACT PREPARATION PROGRESS */}
          <section className="bg-white border border-[#E6E6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#202124] rounded-xs" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                    Preparation Progress
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-[#202124]">
                  Overall: {sectionAcc.overall}%
                </span>
              </div>

              {/* Progress bars without giant charts */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#787774] mb-1">
                    <span className="font-semibold text-[#202124]">VARC</span>
                    <span className="font-mono font-medium">{sectionAcc.varc}%</span>
                  </div>
                  <ProgressBar value={sectionAcc.varc} max={100} size="sm" variant="indigo" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[#787774] mb-1">
                    <span className="font-semibold text-[#202124]">DILR</span>
                    <span className="font-mono font-medium">{sectionAcc.dilr}%</span>
                  </div>
                  <ProgressBar value={sectionAcc.dilr} max={100} size="sm" variant="gold" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[#787774] mb-1">
                    <span className="font-semibold text-[#202124]">QA</span>
                    <span className="font-mono font-medium">{sectionAcc.qa}%</span>
                  </div>
                  <ProgressBar value={sectionAcc.qa} max={100} size="sm" variant="green" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/performance"
                className="text-xs font-medium text-[#4F46A5] hover:underline flex items-center gap-1"
              >
                View Full Analysis &rarr;
              </Link>
            </div>
          </section>

          {/* STUDY CONSISTENCY */}
          <section className="bg-white border border-[#E6E6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-[#F1F1EF]">
                <span className="w-2 h-2 bg-[#B7791F] rounded-xs" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                  Study Consistency
                </h2>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#B7791F] flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#202124]">
                      {streakDays} day preparation streak
                    </div>
                    <p className="text-xs text-[#787774]">
                      Consistent daily practice accelerates test readiness
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#FCFBF9] border border-[#E6E6E3] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#787774]">Studied this week</span>
                  <span className="font-mono font-bold text-[#202124]">{weeklyHours} hours</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/tests?type=sectional"
                className="text-xs font-medium text-[#787774] hover:text-[#202124] flex items-center gap-1"
              >
                Schedule Next Sectional Mock &rarr;
              </Link>
            </div>
          </section>
        </div>

      </div>

      {/* Interactive Warm-Up Modals (Read, Think, Calculate) */}
      <DailyWarmupModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onCompleteActivity={handleCompleteActivity}
      />
    </AppShell>
  );
}
