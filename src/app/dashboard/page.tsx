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
  Bell,
  Calendar,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { DailyWarmupModals } from '@/components/dashboard/DailyWarmupModals';
import { useTheme } from '@/components/theme/ThemeProvider';

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
  completed: boolean;
  href: string;
}

export default function ExamCraftDashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Active warm-up modal
  const [activeModal, setActiveModal] = useState<'read' | 'think' | 'calculate' | null>(null);

  // Warmup completion state (persisted per day)
  const [warmupState, setWarmupState] = useState<WarmupState>({
    read: false,
    think: false,
    calculate: false,
  });

  // Daily plan tasks matching North Star image exactly
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([
    {
      id: 'task-qa',
      dotColor: 'bg-[#E07A2B]',
      badge: 'QA',
      title: 'Arithmetic — 30 questions',
      completed: false,
      href: '/question-bank?section=QA&topic=Arithmetic',
    },
    {
      id: 'task-dilr',
      dotColor: 'bg-[#6E62E5]',
      badge: 'DILR',
      title: '2 Sets',
      completed: false,
      href: '/question-bank?section=DILR&topic=Arrangements',
    },
    {
      id: 'task-varc',
      dotColor: 'bg-[#3B82F6]',
      badge: 'VARC',
      title: '2 RC Passages',
      completed: false,
      href: '/question-bank?section=VARC&topic=Reading+Comprehension',
    },
    {
      id: 'task-revision',
      dotColor: 'bg-[#2E7D62]',
      badge: 'Revision',
      title: 'Review 10 mistakes',
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

  // Readiness and percentile calculations
  const readinessIndex = data?.stats?.readinessIndex ?? 74;
  const predictedScore = data?.stats?.predictedScore ?? 118;
  const maxScore = data?.stats?.maxScore ?? 198;
  const accuracyRate = data?.stats?.accuracyRate ?? 78;
  const syllabusProgress = data?.stats?.syllabusProgress ?? 42;
  const daysRemaining = data?.daysRemaining ?? 68;

  // Sectional accuracies
  const varcAccuracy = data?.stats?.sectionAccuracy?.varc ?? 78;
  const dilrAccuracy = data?.stats?.sectionAccuracy?.dilr ?? 61;
  const qaAccuracy = data?.stats?.sectionAccuracy?.qa ?? 69;

  // Derive predicted percentile
  const predictedPercentile = '98.4';
  const targetGapMarks = 12;

  // Strong and weak topics
  const strongTopics = [
    { name: 'Arithmetic & Percentages', subject: 'QA', accuracy: 88, status: 'Mastered', count: '142 Practiced' },
    { name: 'Reading Comprehension', subject: 'VARC', accuracy: 82, status: 'Proficient', count: '64 Sets' },
    { name: 'Algebra & Linear Equations', subject: 'QA', accuracy: 84, status: 'Proficient', count: '98 Practiced' },
  ];

  const weakTopics = [
    { name: 'Linear & Circular Arrangements', subject: 'DILR', accuracy: 52, status: 'Needs Focus', count: '12 Mistakes', href: '/question-bank?section=DILR&topic=Arrangements' },
    { name: 'Games & Tournaments', subject: 'DILR', accuracy: 48, status: 'Needs Focus', count: '9 Mistakes', href: '/question-bank?section=DILR&topic=Games' },
    { name: 'Coordinate Geometry', subject: 'QA', accuracy: 55, status: 'Revising', count: '14 Mistakes', href: '/question-bank?section=QA&topic=Geometry' },
  ];

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
      <div className="max-w-xl mx-auto space-y-6 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER & GREETING */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <span className="text-xs text-ink-muted block font-normal">
              Good morning,
            </span>
            <h1 className="text-3xl font-bold text-ink tracking-tight">
              {user?.name?.split(' ')[0] || 'Uday'}.
            </h1>
            <p className="text-xs text-ink-muted mt-1 font-normal">
              Small steps compound into big results.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              aria-label="Notifications"
              className="w-10 h-10 rounded-full border border-line bg-surface hover:bg-secondary flex items-center justify-center text-ink-muted hover:text-ink transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-secondary border border-line text-ink font-semibold text-xs flex items-center justify-center shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MOUNTAIN PEAK HERO CARD */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-hero h-44 sm:h-48 border border-line shadow-xs group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />

          {/* Floating Pill at Bottom of Card */}
          <div className="absolute bottom-3.5 inset-x-3.5 z-10">
            <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/30 dark:border-zinc-800 text-ink text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-2 text-ink">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                <span>CAT 2026</span>
              </div>
              <span className="text-xs text-ink-muted font-medium">
                {daysRemaining} days left
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DAILY WARM-UP CARD */}
        {/* ========================================================= */}
        <section className="bg-[#191A1D] text-white border border-zinc-800/80 rounded-hero p-5 space-y-4 shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Daily Warm-up
                </h2>
                <span className="text-[11px] text-white/50 block font-normal">
                  {completedWarmupCount} of 3 completed
                </span>
              </div>
            </div>

            <button
              onClick={handleContinueWarmup}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Connected Activity Circles with Labels Below */}
          <div className="pt-2 pb-1">
            <div className="flex items-center justify-between max-w-xs mx-auto relative px-2">
              {/* Connector Line between Circle 1 and Circle 2 */}
              <div
                className={`absolute top-6 left-12 right-12 h-0.5 z-0 ${
                  warmupState.read && warmupState.think ? 'bg-[#2E7D62]' : 'bg-white/15'
                }`}
              />

              {/* Activity 1: Read */}
              <div className="flex flex-col items-center z-10">
                <button
                  onClick={() => setActiveModal('read')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    warmupState.read
                      ? 'bg-[#2E7D62] text-white border border-[#357A64] shadow-sm'
                      : 'bg-[#292B30] text-white/60 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {warmupState.read ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </button>
                <span className="text-[11px] text-white/80 font-medium mt-1.5">
                  Read
                </span>
              </div>

              {/* Activity 2: Think */}
              <div className="flex flex-col items-center z-10">
                <button
                  onClick={() => setActiveModal('think')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    warmupState.think
                      ? 'bg-[#2E7D62] text-white border border-[#357A64] shadow-sm'
                      : 'bg-[#292B30] text-white/60 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {warmupState.think ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Brain className="w-5 h-5" />
                  )}
                </button>
                <span className="text-[11px] text-white/80 font-medium mt-1.5">
                  Think
                </span>
              </div>

              {/* Activity 3: Calculate */}
              <div className="flex flex-col items-center z-10">
                <button
                  onClick={() => setActiveModal('calculate')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    warmupState.calculate
                      ? 'bg-[#2E7D62] text-white border border-[#357A64] shadow-sm'
                      : 'bg-[#292B30] text-white/60 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {warmupState.calculate ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Calculator className="w-5 h-5" />
                  )}
                </button>
                <span className="text-[11px] text-white/50 font-medium mt-1.5">
                  Calculate
                </span>
              </div>
            </div>
          </div>

          {/* Continue Wide Pill Button */}
          <div className="pt-1">
            <button
              onClick={handleContinueWarmup}
              className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{completedWarmupCount === 3 ? 'Practice Question Bank' : 'Continue Warm-up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. TODAY'S PLAN */}
        {/* ========================================================= */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink tracking-tight">
              Today&apos;s Plan
            </h2>
            <span className="text-xs font-mono text-ink-muted">
              {completedPlanCount} / {planTasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {planTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className="group flex items-center justify-between p-3.5 rounded-card border border-line bg-surface hover:border-line/80 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${task.dotColor}`} />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-ink">
                      {task.badge}
                    </span>
                    <span className="text-xs text-ink-muted truncate">
                      {task.title}
                    </span>
                  </div>
                </div>

                <div className="text-ink-muted group-hover:text-ink transition-colors pl-2 shrink-0">
                  {task.completed ? (
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. CURRENT PROGRESS & EXAM READINESS INDEX */}
        {/* ========================================================= */}
        <section className="rounded-hero border border-line bg-surface p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Exam Readiness Index
                </h2>
                <span className="text-[11px] text-ink-muted block font-normal">
                  Multi-factor preparedness score
                </span>
              </div>
            </div>
            <Link
              href="/performance"
              className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Readiness Gauge & Quick Stats Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-1">
            {/* SVG Circular Readiness Gauge */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-secondary stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-accent stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - readinessIndex / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-ink tracking-tight">
                  {readinessIndex}%
                </span>
                <span className="text-[10px] text-accent uppercase font-bold tracking-wider">
                  Readiness
                </span>
              </div>
            </div>

            {/* Metric Overview Grid */}
            <div className="w-full grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-card border border-line bg-secondary/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-muted">Syllabus Covered</span>
                <div className="text-base font-bold font-mono text-ink">{syllabusProgress}%</div>
                <div className="w-full bg-line rounded-full h-1.5 mt-1 overflow-hidden">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: `${syllabusProgress}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-card border border-line bg-secondary/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-muted">Overall Accuracy</span>
                <div className="text-base font-bold font-mono text-ink">{accuracyRate}%</div>
                <div className="w-full bg-line rounded-full h-1.5 mt-1 overflow-hidden">
                  <div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: `${accuracyRate}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-card border border-line bg-secondary/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-muted">Prep Consistency</span>
                <div className="text-base font-bold font-mono text-ink">8 Days Streak</div>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal Rhythm</span>
              </div>

              <div className="p-3 rounded-card border border-line bg-secondary/30 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-ink-muted">Mistakes Cleared</span>
                <div className="text-base font-bold font-mono text-ink">76% Fixed</div>
                <span className="text-[10px] text-accent font-medium">Spaced Revision</span>
              </div>
            </div>
          </div>

          {/* Sectional Accuracy Progress Bars */}
          <div className="space-y-2.5 pt-2 border-t border-line">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              Sectional Accuracy Breakdown
            </span>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-ink">VARC (Verbal Ability & Reading)</span>
                  <span className="font-mono text-ink font-semibold">{varcAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                  <div className="bg-[#3B82F6] h-2 rounded-full transition-all duration-700" style={{ width: `${varcAccuracy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-ink">DILR (Data Interpretation & Reasoning)</span>
                  <span className="font-mono text-ink font-semibold">{dilrAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                  <div className="bg-[#6E62E5] h-2 rounded-full transition-all duration-700" style={{ width: `${dilrAccuracy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-ink">QA (Quantitative Aptitude)</span>
                  <span className="font-mono text-ink font-semibold">{qaAccuracy}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-line/40">
                  <div className="bg-[#E07A2B] h-2 rounded-full transition-all duration-700" style={{ width: `${qaAccuracy}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. PERCENTILE PREDICTOR & SCORE TRAJECTORY */}
        {/* ========================================================= */}
        <section className="rounded-hero border border-line bg-surface p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Percentile Predictor
                </h2>
                <span className="text-[11px] text-ink-muted block font-normal">
                  Based on sectional accuracy & mock calibration
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full text-accent font-mono text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{predictedPercentile} %ile</span>
            </div>
          </div>

          {/* Visual Percentile Distribution Bell Curve */}
          <div className="p-3 bg-secondary/30 rounded-card border border-line space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Projected Score: <strong className="text-ink font-mono">{predictedScore} / {maxScore}</strong></span>
              <span className="text-accent font-medium">Target Gap: +{targetGapMarks} marks for 99.5 %ile</span>
            </div>

            <div className="relative py-2">
              <svg className="w-full h-20 overflow-visible" viewBox="0 0 320 70">
                <defs>
                  <linearGradient id="percentileGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D62" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2E7D62" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Bell curve filled polygon */}
                <path
                  d="M 10 65 Q 100 65, 140 40 T 210 15 T 265 52 T 310 65 L 310 65 L 10 65 Z"
                  fill="url(#percentileGradient)"
                />
                {/* Bell curve stroke */}
                <path
                  d="M 10 65 Q 100 65, 140 40 T 210 15 T 265 52 T 310 65"
                  fill="none"
                  stroke="#2E7D62"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Dotted indicator line for user's predicted score */}
                <line x1="250" y1="28" x2="250" y2="65" stroke="#2E7D62" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Marker point */}
                <circle cx="250" cy="28" r="4.5" className="fill-accent stroke-surface stroke-2" />
                {/* Text tag */}
                <text x="250" y="16" textAnchor="middle" className="text-[10px] font-mono font-bold fill-ink">
                  You: 98.4 %ile
                </text>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-ink-muted pt-1 border-t border-line/60">
              <span>50 %ile (52m)</span>
              <span>80 %ile (84m)</span>
              <span>90 %ile (96m)</span>
              <span className="font-bold text-accent">98.4 %ile (118m)</span>
              <span>99.5 %ile (130m)</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. STRONG & WEAK AREAS */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink tracking-tight">
              Topic Mastery: Strong & Weak Areas
            </h2>
            <Link
              href="/question-bank"
              className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
            >
              <span>Practice All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Strong Topics Card */}
            <div className="p-4 rounded-card border border-line bg-surface space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Top Strong Areas
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {strongTopics.map((topic, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-secondary text-ink-muted">
                          {topic.subject}
                        </span>
                        <span className="font-medium text-ink truncate text-[11px]">
                          {topic.name}
                        </span>
                      </div>
                      <span className="font-mono text-accent font-bold text-[11px] shrink-0">
                        {topic.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-accent h-1.5 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-ink-muted">
                      <span>{topic.count}</span>
                      <span className="text-accent font-medium">{topic.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics Card */}
            <div className="p-4 rounded-card border border-line bg-surface space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-coral uppercase tracking-wider">
                  Weak Topics Requiring Drills
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {weakTopics.map((topic, idx) => (
                  <Link
                    key={idx}
                    href={topic.href}
                    className="block p-2 rounded-btn hover:bg-secondary/60 transition-colors border border-transparent hover:border-line group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-coral/10 text-coral">
                          {topic.subject}
                        </span>
                        <span className="font-medium text-ink truncate text-[11px] group-hover:text-accent">
                          {topic.name}
                        </span>
                      </div>
                      <span className="font-mono text-coral font-bold text-[11px] shrink-0">
                        {topic.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className="bg-coral h-1.5 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-ink-muted mt-1">
                      <span className="text-coral">{topic.count}</span>
                      <span className="text-accent font-medium group-hover:underline flex items-center gap-0.5">
                        Practice <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. INSPIRATION / PHILOSOPHY SHOWCASE ROW */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-line space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Theme Card */}
            <div className="p-4 rounded-hero border border-line bg-surface flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-center p-1 rounded-full bg-secondary border border-line/60">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    theme === 'light' ? 'bg-surface text-ink shadow-xs font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    theme === 'dark' ? 'bg-surface text-ink shadow-xs font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    theme === 'system' ? 'bg-surface text-ink shadow-xs font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
              <p className="text-xs text-ink-muted text-center">
                Your experience, your way.
              </p>
            </div>

            {/* Quote Card */}
            <div className="p-4 rounded-hero border border-line bg-surface flex flex-col justify-between space-y-2">
              <span className="text-base text-ink-muted font-serif">“</span>
              <p className="text-xs font-medium text-ink leading-relaxed">
                Better questions create a better you.
              </p>
              <span className="text-[11px] text-ink-muted font-mono block">
                — ExamCraft
              </span>
            </div>
          </div>
        </div>

        {/* Daily Warmup Modals */}
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
