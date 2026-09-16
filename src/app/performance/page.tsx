'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  BarChart3,
  BookOpen,
  HelpCircle,
  Compass,
  Sparkles,
  ChevronRight,
  Layers,
  CheckCircle,
  XCircle,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function PerformanceAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'readiness' | 'trends' | 'mastery' | 'history'>('readiness');

  useEffect(() => {
    fetch('/api/performance')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-stone-500 font-mono flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing Forensic Performance Diagnostics & Readiness Curves...</span>
        </div>
      </AppShell>
    );
  }

  const exam = data?.exam || { title: 'SSC CGL 2026' };
  const stats = data?.stats || {};
  const readiness = data?.readiness || {};
  const triad = readiness?.triad || {};
  const factors = readiness?.contributingFactors || [];
  const bottlenecks = readiness?.areasHoldingBack || [];
  const recommendations = data?.recommendations || [];
  const scoreTrends = data?.scoreTrends || [];
  const subjects = data?.subjects || [];
  const topicMastery = data?.topicMastery || { distribution: {}, strongTopics: [], weakTopics: [], neglectedTopics: [] };
  const attempts = data?.attempts || [];
  const mistakeMetrics = data?.mistakeMetrics || {};

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Performance Analytics & Readiness' },
      ]}
    >
      <PageHeader
        title="Performance & Examination Readiness"
        description="Comprehensive diagnostic intelligence: score trajectories, accuracy calibration, speed pacing, topic mastery lifecycle, and the Nalanda Readiness Index."
        badge={
          <Badge variant="emerald" size="md" dot>
            Readiness Index: {readiness.index || 74}% • {readiness.qualitativeBand || 'Competitive'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/mistakes">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                Mistake Notebook ({mistakeMetrics.unresolved_count || 0})
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="saffron" size="sm">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Attempt Mock Test
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top 4 Essential KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Nalanda Readiness Index"
          value={`${readiness.index || 74} / 100`}
          subtext={`Tier: ${readiness.qualitativeBand || 'Competitive'}`}
          accent="emerald"
          trend={{ value: readiness.delta14Days || '+4.2 pts', isPositive: true }}
        />
        <MetricCallout
          label="Predicted Tier-I Marks"
          value={stats.predictedScore?.toFixed(0) || '142'}
          max={stats.maxScore || 200}
          subtext={`Cutoff Est: ~138 (Target: ${stats.targetScore || 165})`}
          accent="saffron"
        />
        <MetricCallout
          label="Diagnostic Accuracy"
          value={`${stats.accuracyRate || 78.5}%`}
          subtext="Target benchmark: ≥ 82.0%"
          accent="navy"
          trend={{ value: '+2.8% vs last mock', isPositive: true }}
        />
        <MetricCallout
          label="Pacing Cadence"
          value={`${stats.pacingCadenceSeconds || 52}s`}
          subtext={`Target exam tempo: ${stats.targetTempoSeconds || 52}s / Q`}
          accent="stone"
        />
      </div>

      {/* Analytics Tabs Navigation */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'readiness', label: 'Readiness Index & Diagnostics', icon: ShieldCheck },
          { id: 'trends', label: 'Score & Accuracy Trends', icon: TrendingUp },
          { id: 'mastery', label: 'Topic Mastery & Syllabus Health', icon: Layers },
          { id: 'history', label: 'Test & Mock History', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-amber-600 text-amber-900 bg-amber-50/40'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: READINESS INDEX & DIAGNOSTICS                      */}
      {/* ========================================================= */}
      {activeTab === 'readiness' && (
        <div className="space-y-8">
          {/* Hero Readiness Index Architecture */}
          <Card className="p-6 bg-gradient-to-br from-white via-amber-50/20 to-stone-50 border-stone-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-6 pb-6 border-b border-stone-100">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-amber-100/80 text-amber-800">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-stone-900">
                      The Nalanda Readiness Index
                    </h2>
                    <span className="text-xs text-stone-500 font-mono">
                      Internal Multi-Factor Preparation Calibrator
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  The Readiness Index measures the structural maturity of your preparation across 9
                  continuous inputs including topic mastery depth, timed accuracy, speed tempo, and
                  memory retention.
                </p>

                {/* Important Disclaimer Alert */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                  <strong className="block font-semibold mb-0.5 text-amber-950">
                    Methodological Disclaimer:
                  </strong>
                  {readiness.disclaimer}
                </div>
              </div>

              {/* Circular Readiness Index Gauge */}
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-stone-200/80 shadow-sm self-start">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-600"
                      strokeDasharray={`${readiness.index || 74}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold font-mono text-stone-900 leading-none">
                      {readiness.index || 74}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono mt-0.5">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                    Readiness Stage
                  </span>
                  <div className="text-sm font-bold text-stone-900">
                    {readiness.qualitativeBand || 'Competitive'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold font-mono">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{readiness.delta14Days || '+4.2 pts'} in 14d</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Triad Distinction: Learning Progress vs Topic Mastery vs Exam Preparedness */}
            <div className="mb-6">
              <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                Preparation Triad Distinction
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {triad.learningProgress && (
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-stone-800">{triad.learningProgress.label}</span>
                      <span className="font-bold text-amber-700">{triad.learningProgress.value}%</span>
                    </div>
                    <ProgressBar value={triad.learningProgress.value} max={100} size="sm" variant="saffron" />
                    <p className="text-[11px] text-stone-500 leading-normal pt-1">
                      {triad.learningProgress.definition}
                    </p>
                  </div>
                )}

                {triad.topicMastery && (
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-stone-800">{triad.topicMastery.label}</span>
                      <span className="font-bold text-emerald-700">{triad.topicMastery.value}%</span>
                    </div>
                    <ProgressBar value={triad.topicMastery.value} max={100} size="sm" variant="emerald" />
                    <p className="text-[11px] text-stone-500 leading-normal pt-1">
                      {triad.topicMastery.definition}
                    </p>
                  </div>
                )}

                {triad.examPreparedness && (
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-stone-800">{triad.examPreparedness.label}</span>
                      <span className="font-bold text-blue-700">{triad.examPreparedness.value}%</span>
                    </div>
                    <ProgressBar value={triad.examPreparedness.value} max={100} size="sm" variant="navy" />
                    <p className="text-[11px] text-stone-500 leading-normal pt-1">
                      {triad.examPreparedness.definition}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 9 Contributing Factors Breakdown */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                9 Contributing Diagnostic Factors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {factors.map((f: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-800">{f.name}</span>
                      <span className="font-mono text-[10px] text-stone-400">wt: {f.weight}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <ProgressBar value={f.score} max={100} size="xs" variant="saffron" className="flex-1 mr-2" />
                      <span className="font-bold text-stone-800">{f.score}%</span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-stone-700">{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Bottlenecks & Holding Score Back Callout */}
          {bottlenecks.length > 0 && (
            <Card className="p-5 bg-rose-50/40 border-rose-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-800 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-serif font-bold text-rose-950">
                    Key Friction Points Holding Your Readiness Score Back
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-rose-900">
                    {bottlenecks.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Data-Driven Contextual Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Adaptive Learning Recommendations
                </h3>
                <p className="text-xs text-stone-500">
                  Contextual next steps synthesized from your actual assessment history and weak topics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec: any) => (
                <Card key={rec.id} className="p-4 bg-white hover:border-amber-300 transition-all flex flex-col justify-between">
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        {rec.type.replace('_', ' ')}
                      </span>
                      {rec.urgency === 'critical' && (
                        <Badge variant="rose" size="sm">High Priority</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900">{rec.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{rec.description}</p>
                  </div>
                  <Link href={rec.href}>
                    <Button variant="outline" size="sm" className="w-full justify-between hover:bg-stone-50">
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SCORE & ACCURACY TRENDS                            */}
      {/* ========================================================= */}
      {activeTab === 'trends' && (
        <div className="space-y-8">
          <Card className="p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Score Trajectory & Cutoff Delta</h3>
                <p className="text-xs text-stone-500">Tier-I Marks distribution compared against UR General Cutoff (~138)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Current Predicted: 142.0</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> Cutoff Bar: 138.0</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Target: 165.0</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-stone-600">Your Current Predicted Level</span>
                  <strong className="text-amber-800">142.0 / 200 (71.0%)</strong>
                </div>
                <ProgressBar value={142} max={200} size="md" variant="saffron" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-stone-600">SSC CGL Tier-I General Cutoff (UR Benchmark)</span>
                  <strong className="text-stone-700">138.0 / 200 (69.0%)</strong>
                </div>
                <ProgressBar value={138} max={200} size="sm" variant="stone" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-stone-600">Aspirational Target Score</span>
                  <strong className="text-emerald-700">165.0 / 200 (82.5%)</strong>
                </div>
                <ProgressBar value={165} max={200} size="sm" variant="emerald" />
              </div>
            </div>

            {/* Score & Accuracy Progression Timeline */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                Historical Progression Curve
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-mono text-[10px] uppercase border-y border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Examination / Test</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3">Pacing (s/Q)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {scoreTrends.map((st: any, idx: number) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-3 px-3 font-mono text-stone-500">{st.date}</td>
                        <td className="py-3 px-3 font-semibold text-stone-900">{st.test_title}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 uppercase">
                            {st.test_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">
                          {st.score.toFixed(1)} <span className="text-stone-400 font-normal">/ {st.max_score}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">{st.accuracy}%</td>
                        <td className="py-3 px-3 font-mono text-stone-600">{st.pace_seconds}s / Q</td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/exam/${st.attempt_id}/result`} className="text-amber-700 font-semibold hover:underline">
                            Scorecard →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUBJECT & TOPIC MASTERY                            */}
      {/* ========================================================= */}
      {activeTab === 'mastery' && (
        <div className="space-y-8">
          {/* 6 Lifecycle Mastery States Overview */}
          <Card className="p-6 bg-white">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              6-Stage Topic Mastery Distribution
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Mastery is earned through repeated assessment performance and decays over time if revision is neglected.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Not Started', count: topicMastery.distribution.not_started || 0, color: 'border-stone-200 bg-stone-50 text-stone-600' },
                { label: 'Studying', count: topicMastery.distribution.studying || 0, color: 'border-blue-200 bg-blue-50 text-blue-800' },
                { label: 'Practiced', count: topicMastery.distribution.practiced || 0, color: 'border-purple-200 bg-purple-50 text-purple-800' },
                { label: 'Developing', count: topicMastery.distribution.developing || 0, color: 'border-amber-200 bg-amber-50 text-amber-800' },
                { label: 'Proficient', count: topicMastery.distribution.proficient || 0, color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                { label: 'Needs Revision', count: topicMastery.distribution.needs_revision || 0, color: 'border-rose-200 bg-rose-50 text-rose-800' },
              ].map((m, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${m.color} text-center`}>
                  <div className="text-xl font-bold font-mono">{m.count}</div>
                  <div className="text-[11px] font-medium mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Subject Competencies Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-mono uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Tier Status</th>
                    <th className="py-3 px-4">Avg Mastery</th>
                    <th className="py-3 px-4">Practiced Qs</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Avg Pacing</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {subjects.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {sub.code}
                          </span>
                          <span>{sub.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sub.competency_tier === 'Proficient' ? 'emerald' : sub.competency_tier === 'Developing' ? 'saffron' : 'rose'}
                          size="sm"
                        >
                          {sub.competency_tier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">{sub.avg_mastery}%</td>
                      <td className="py-3 px-4 font-mono text-stone-600">{sub.total_practiced} Qs</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{sub.accuracy}%</td>
                      <td className="py-3 px-4 font-mono text-stone-600">{sub.avg_pacing_seconds}s / Q</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/exams/exam-ssc-cgl-2026?subject=${sub.id}`} className="text-amber-700 font-semibold hover:underline">
                          Syllabus →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Strong vs Weak vs Neglected Areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strong Areas */}
            <Card className="p-5 bg-white border-emerald-200/80">
              <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-sm mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strong Areas (≥ 75% Mastery)</span>
              </div>
              <div className="space-y-2.5">
                {topicMastery.strongTopics.map((t: any) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{t.title}</div>
                      <div className="text-[10px] font-mono text-stone-500">{t.subject_name}</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{t.mastery_percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weak / Friction Areas */}
            <Card className="p-5 bg-white border-rose-200/80">
              <div className="flex items-center gap-2 text-rose-800 font-serif font-bold text-sm mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Weak Areas (&lt; 60% Mastery)</span>
              </div>
              <div className="space-y-2.5">
                {topicMastery.weakTopics.map((t: any) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-rose-50/40 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{t.title}</div>
                      <div className="text-[10px] font-mono text-stone-500">{t.subject_name}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-700 block">{t.mastery_percentage}%</span>
                      <Link href={`/learn/${t.id}`} className="text-[10px] text-amber-700 font-semibold hover:underline">
                        Drill →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Neglected Areas */}
            <Card className="p-5 bg-white border-stone-200">
              <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-sm mb-3">
                <Clock className="w-4 h-4 text-stone-500" />
                <span>Unattempted / Neglected Areas</span>
              </div>
              <div className="space-y-2.5">
                {topicMastery.neglectedTopics.map((t: any) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{t.title}</div>
                      <div className="text-[10px] font-mono text-stone-500">0 questions attempted</div>
                    </div>
                    <Link href={`/learn/${t.id}`} className="text-[10px] text-amber-700 font-semibold hover:underline">
                      Start →
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TEST & MOCK HISTORY                                */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Examination & Assessment History
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Complete chronological ledger of full-length mock examinations, topic tests, and remedial drills.
            </p>

            <div className="space-y-3">
              {attempts.map((att: any) => {
                const isFullMock = att.test_type === 'full_mock';
                const durationMin = Math.round((att.time_taken_seconds || 0) / 60);

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isFullMock ? 'saffron' : 'stone'} size="sm">
                          {isFullMock ? 'Full Mock' : att.test_type ? att.test_type.replace('_', ' ') : 'Assessment'}
                        </Badge>
                        <span className="text-xs font-mono text-stone-400">
                          {new Date(att.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-stone-900">
                        {att.test_title_snapshot || att.test_title}
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-3 font-mono">
                        <span>Time Taken: {durationMin}m</span>
                        <span>•</span>
                        <span>Attempted: {att.attempted_questions} / {att.total_questions}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:border-l sm:border-stone-100 sm:pl-6">
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-stone-900">
                          {att.final_score.toFixed(1)} <span className="text-xs text-stone-400 font-normal">/ {att.maximum_marks}</span>
                        </div>
                        <div className="text-xs font-mono text-emerald-700 font-semibold">
                          {att.accuracy}% Accuracy
                        </div>
                      </div>

                      <Link href={`/exam/${att.id}/result`}>
                        <Button variant="outline" size="sm">
                          Review Scorecard →
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
