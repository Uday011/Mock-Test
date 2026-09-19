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
  RotateCcw,
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

  // Warmup completion state
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
          {/* Authentic Mountain Peak Artwork */}
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
                68 days left
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
                      ? 'bg-[#1E3A34] text-[#4ADE80] border border-[#2E6857] shadow-sm'
                      : 'bg-[#292B30] text-white/60 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
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
              <span>Continue</span>
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
              Today's Plan
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
                  {/* Category colored dot */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${task.dotColor}`} />

                  {/* Badge + Title */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-ink">
                      {task.badge}
                    </span>
                    <span className="text-xs text-ink-muted truncate">
                      {task.title}
                    </span>
                  </div>
                </div>

                {/* Arrow Right chevron */}
                <div className="text-ink-muted group-hover:text-ink transition-colors pl-2 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. INSPIRATION / PHILOSOPHY SHOWCASE ROW */}
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
