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
  Bell,
  Compass,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DailyWarmupModals } from '@/components/dashboard/DailyWarmupModals';

interface WarmupState {
  read: boolean;
  think: boolean;
  calculate: boolean;
}

interface PlanTask {
  id: string;
  subject: string;
  dotColor: string;
  title: string;
  sub: string;
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
    read: true,
    think: true,
    calculate: false,
  });

  // Daily plan tasks matching North Star
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([
    {
      id: 'task-qa',
      subject: 'QA: Arithmetic',
      dotColor: 'bg-coral',
      title: 'QA: Arithmetic',
      sub: '30 questions',
      durationMinutes: 35,
      completed: false,
      href: '/question-bank?section=QA&topic=Arithmetic',
    },
    {
      id: 'task-dilr',
      subject: 'DILR: 2 Sets',
      dotColor: 'bg-lavender',
      title: 'DILR: 2 Sets',
      sub: 'Arrangements',
      durationMinutes: 40,
      completed: false,
      href: '/question-bank?section=DILR&topic=Arrangements',
    },
    {
      id: 'task-varc',
      subject: 'VARC: 2 RC Passages',
      dotColor: 'bg-accent',
      title: 'VARC: 2 RC Passages',
      sub: 'Philosophy & Economics',
      durationMinutes: 35,
      completed: false,
      href: '/question-bank?section=VARC&topic=Reading+Comprehension',
    },
    {
      id: 'task-revision',
      subject: 'Revision: Review 10 mistakes',
      dotColor: 'bg-gold',
      title: 'Revision',
      sub: 'Review 10 mistakes',
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

  const completedWarmupCount =
    (warmupState.read ? 1 : 0) + (warmupState.think ? 1 : 0) + (warmupState.calculate ? 1 : 0);
  const isBrainWarmedUp = completedWarmupCount === 3;

  const completedPlanCount = planTasks.filter((t) => t.completed).length;

  // Find next incomplete warmup item
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

  const daysRemaining = 68; // Matching North Star reference pill

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-2xl mx-auto space-y-5 pb-16 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER & GREETING */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-semibold text-ink tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Uday'}.
            </h1>
            <p className="text-xs text-ink-muted mt-1 font-normal">
              Small steps compound into big results.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-full border border-line bg-surface hover:bg-secondary flex items-center justify-center text-ink-muted hover:text-ink transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full bg-ink text-canvas font-semibold text-xs flex items-center justify-center shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MOUNTAIN PEAK HERO BANNER */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-hero h-44 sm:h-48 border border-line bg-[#16181D] text-white shadow-xs">
          {/* Stylized Mountain Peaks SVG */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Sky Gradient */}
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E222D" />
                <stop offset="60%" stopColor="#171922" />
                <stop offset="100%" stopColor="#0F1014" />
              </linearGradient>
              <linearGradient id="peakBack" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#303545" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#161820" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="peakMid" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#41475A" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#181A22" />
              </linearGradient>
              <linearGradient id="peakFront" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#252936" />
                <stop offset="100%" stopColor="#0E0F13" />
              </linearGradient>
            </defs>

            <rect width="600" height="200" fill="url(#skyGrad)" />

            {/* Back Mountain Ridges */}
            <path
              d="M0 200 L60 130 L160 85 L250 145 L340 70 L440 125 L530 65 L600 110 L600 200 Z"
              fill="url(#peakBack)"
            />
            {/* Mid Mountain Ridges */}
            <path
              d="M0 200 L90 140 L190 95 L290 160 L380 100 L490 150 L600 105 L600 200 Z"
              fill="url(#peakMid)"
            />
            {/* Front Peak with Sharp Highlight */}
            <path
              d="M0 200 L110 165 L210 115 L310 180 L420 120 L520 170 L600 130 L600 200 Z"
              fill="url(#peakFront)"
            />
            {/* Subtle atmospheric mist */}
            <rect y="170" width="600" height="30" fill="black" opacity="0.3" filter="blur(8px)" />
          </svg>

          {/* Target Countdown Pill */}
          <div className="absolute top-4 right-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-medium tracking-wide">
              <span>CAT 2026</span>
              <span className="text-white/40">|</span>
              <span>{daysRemaining} days left</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DAILY WARM-UP CARD */}
        {/* ========================================================= */}
        <section className="bg-[#151617] text-white border border-[#292B2E] rounded-hero p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Daily Warm-up
                </h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  {completedWarmupCount} of 3 completed
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5 font-normal">
                15–20 min to activate your brain
              </p>
            </div>
          </div>

          {/* 3 Circular Activity Pills & Continue Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Read Pill */}
              <button
                onClick={() => setActiveModal('read')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  warmupState.read
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    warmupState.read ? 'bg-white text-black' : 'border border-white/40'
                  }`}
                >
                  {warmupState.read ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '1'}
                </div>
                <span>Read</span>
              </button>

              {/* Think Pill */}
              <button
                onClick={() => setActiveModal('think')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  warmupState.think
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    warmupState.think ? 'bg-white text-black' : 'border border-white/40'
                  }`}
                >
                  {warmupState.think ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '2'}
                </div>
                <span>Think</span>
              </button>

              {/* Calculate Pill */}
              <button
                onClick={() => setActiveModal('calculate')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  warmupState.calculate
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    warmupState.calculate ? 'bg-white text-black' : 'border border-white/40'
                  }`}
                >
                  {warmupState.calculate ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '3'}
                </div>
                <span>Calculate</span>
              </button>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinueWarmup}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 active:scale-98 transition-all shrink-0 self-end sm:self-auto"
            >
              <span>{isBrainWarmedUp ? 'Practice →' : 'Continue →'}</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. TODAY'S PLAN */}
        {/* ========================================================= */}
        <section className="bg-surface border border-line rounded-hero p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold text-ink tracking-tight">
              Today's Plan
            </h2>
            <span className="text-[11px] font-mono text-ink-muted">
              {completedPlanCount}/{planTasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {planTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-card border border-line bg-surface hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${task.dotColor}`} />

                  <div className="min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        task.completed ? 'line-through text-ink-muted' : 'text-ink'
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.sub && (
                      <div className="text-[11px] text-ink-muted truncate">
                        {task.sub}
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox toggle button */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  aria-label={`Mark ${task.title} complete`}
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ml-3 ${
                    task.completed
                      ? 'bg-ink border-ink text-canvas'
                      : 'border-line hover:border-ink/50 bg-transparent'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MODALS FOR WARMUP (READ, THINK, CALCULATE) */}
        {/* ========================================================= */}
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
