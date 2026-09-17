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
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CalloutBlock } from '@/components/ui/CalloutBlock';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';

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
        <div className="py-24 text-center text-xs text-[#787774] font-mono flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#202124] border-t-transparent rounded-full animate-spin" />
          <span>Loading performance analytics...</span>
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
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Activity}
          title="Performance & Examination Readiness"
          description="Diagnostic intelligence: score trajectories, accuracy calibration, speed pacing, topic mastery lifecycle, and the Nalanda Readiness Index."
          badge={
            <Badge variant="emerald" size="sm" dot>
              Readiness: {readiness.index || 74}% • {readiness.qualitativeBand || 'Competitive'}
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href="/mistakes">
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                  Mistakes ({mistakeMetrics.unresolved_count || 0})
                </Button>
              </Link>
              <Link href="/tests">
                <Button variant="primary" size="sm">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Attempt Mock Test
                </Button>
              </Link>
            </div>
          }
        />

        {/* Top Properties Table */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-3.5">
          <PropertyTable>
            <PropertyRow icon={ShieldCheck} label="Readiness Index">
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {readiness.index || 74} / 100
                </span>
                <div className="flex-1">
                  <ProgressBar value={readiness.index || 74} max={100} size="sm" variant="emerald" />
                </div>
                <Badge variant="emerald" size="sm">
                  {readiness.qualitativeBand || 'Competitive'}
                </Badge>
                <span className="text-[11px] font-mono text-emerald-700">
                  {readiness.delta14Days || '+4.2 pts in 14d'}
                </span>
              </div>
            </PropertyRow>

            <PropertyRow icon={Target} label="Predicted Score">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#202124]">
                  {stats.predictedScore?.toFixed(0) || '142'} / {stats.maxScore || 200}
                </span>
                <span className="text-[#9b9a97]">
                  (Cutoff Est: ~138 • Target: {stats.targetScore || 165})
                </span>
              </div>
            </PropertyRow>

            <PropertyRow icon={CheckCircle2} label="Diagnostic Accuracy">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#202124]">{stats.accuracyRate || 78.5}%</span>
                <span className="text-[#9b9a97]">(Target benchmark: ≥ 82.0%)</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={Clock} label="Pacing Cadence">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#202124]">{stats.pacingCadenceSeconds || 52}s / Q</span>
                <span className="text-[#9b9a97]">(Target tempo: {stats.targetTempoSeconds || 52}s)</span>
              </div>
            </PropertyRow>
          </PropertyTable>
        </div>

        {/* Analytics Tabs Navigation */}
        <div className="flex border-b border-[#E6E6E3] overflow-x-auto no-scrollbar gap-1">
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#202124] text-[#202124]'
                    : 'border-transparent text-[#787774] hover:text-[#202124]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: READINESS INDEX & DIAGNOSTICS */}
        {activeTab === 'readiness' && (
          <div className="space-y-6">
            {/* Readiness Index Architecture */}
            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-4 border-b border-[#E6E6E3]">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-semibold text-[#202124]">
                      Readiness Index Engine
                    </h2>
                  </div>

                  <p className="text-xs text-[#787774] leading-relaxed">
                    The Readiness Index measures the structural maturity of your preparation across 9 continuous inputs including topic mastery depth, timed accuracy, speed tempo, and memory retention.
                  </p>

                  <CalloutBlock
                    icon={ShieldCheck}
                    variant="neutral"
                    title="Methodological Disclaimer"
                  >
                    <p className="text-xs text-[#787774]">
                      {readiness.disclaimer}
                    </p>
                  </CalloutBlock>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-[#F7F7F5] rounded-lg border border-[#E6E6E3] self-start">
                  <div className="text-center font-mono">
                    <div className="text-2xl font-bold text-[#202124] leading-none">
                      {readiness.index || 74}
                    </div>
                    <div className="text-[10px] text-[#9b9a97] mt-0.5">/ 100</div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="font-medium text-[#202124]">
                      {readiness.qualitativeBand || 'Competitive'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      {readiness.delta14Days || '+4.2 pts'} in 14d
                    </div>
                  </div>
                </div>
              </div>

              {/* Triad Distinction: Learning Progress vs Topic Mastery vs Exam Preparedness */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase text-[#787774] tracking-wider">
                  Preparation Triad Distinction
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {triad.learningProgress && (
                    <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#787774] font-medium">{triad.learningProgress.label}</span>
                        <span className="font-semibold text-[#202124]">{triad.learningProgress.value}%</span>
                      </div>
                      <ProgressBar value={triad.learningProgress.value} max={100} size="sm" variant="amber" />
                      <p className="text-[11px] text-[#787774] leading-relaxed pt-0.5">
                        {triad.learningProgress.definition}
                      </p>
                    </div>
                  )}

                  {triad.topicMastery && (
                    <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#787774] font-medium">{triad.topicMastery.label}</span>
                        <span className="font-semibold text-[#202124]">{triad.topicMastery.value}%</span>
                      </div>
                      <ProgressBar value={triad.topicMastery.value} max={100} size="sm" variant="emerald" />
                      <p className="text-[11px] text-[#787774] leading-relaxed pt-0.5">
                        {triad.topicMastery.definition}
                      </p>
                    </div>
                  )}

                  {triad.examPreparedness && (
                    <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#787774] font-medium">{triad.examPreparedness.label}</span>
                        <span className="font-semibold text-[#202124]">{triad.examPreparedness.value}%</span>
                      </div>
                      <ProgressBar value={triad.examPreparedness.value} max={100} size="sm" variant="blue" />
                      <p className="text-[11px] text-[#787774] leading-relaxed pt-0.5">
                        {triad.examPreparedness.definition}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 9 Contributing Factors Breakdown */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold uppercase text-[#787774] tracking-wider">
                  9 Contributing Diagnostic Factors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {factors.map((f: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#202124]">{f.name}</span>
                        <span className="font-mono text-[10px] text-[#9b9a97]">wt: {f.weight}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-xs">
                        <ProgressBar value={f.score} max={100} size="xs" variant="emerald" className="flex-1 mr-2" />
                        <span className="font-medium text-[#202124]">{f.score}%</span>
                      </div>
                      <div className="text-[10px] text-[#787774] font-mono flex items-center justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-[#202124]">{f.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottlenecks Callout */}
            {bottlenecks.length > 0 && (
              <CalloutBlock
                icon={AlertCircle}
                variant="rose"
                title="Key Friction Points Holding Your Readiness Score Back"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {bottlenecks.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-white border border-[#f5c2c2]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                      <span className="text-[#202124] leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </CalloutBlock>
            )}

            {/* Contextual Recommendations */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                  Adaptive Learning Recommendations
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Next steps synthesized from your actual assessment history and weak topics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg hover:border-[#d4d4d4] transition-colors flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                          {rec.type.replace('_', ' ')}
                        </span>
                        {rec.urgency === 'critical' && (
                          <Badge variant="rose" size="sm">High Priority</Badge>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-[#202124]">{rec.title}</h4>
                      <p className="text-xs text-[#787774] leading-relaxed">{rec.description}</p>
                    </div>
                    <Link href={rec.href}>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>{rec.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCORE & ACCURACY TRENDS */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-[#202124]">Score Trajectory & Cutoff Delta</h3>
                  <p className="text-xs text-[#787774]">Tier-I Marks compared against UR General Cutoff (~138)</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#787774]">
                  <span>Current: 142.0</span>
                  <span>•</span>
                  <span>Cutoff: 138.0</span>
                  <span>•</span>
                  <span>Target: 165.0</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#787774]">Current Predicted Level</span>
                    <strong className="text-[#202124]">142.0 / 200 (71.0%)</strong>
                  </div>
                  <ProgressBar value={142} max={200} size="sm" variant="emerald" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#787774]">SSC CGL Tier-I General Cutoff</span>
                    <strong className="text-[#787774]">138.0 / 200 (69.0%)</strong>
                  </div>
                  <ProgressBar value={138} max={200} size="sm" variant="stone" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#787774]">Aspirational Target Score</span>
                    <strong className="text-[#202124]">165.0 / 200 (82.5%)</strong>
                  </div>
                  <ProgressBar value={165} max={200} size="sm" variant="blue" />
                </div>
              </div>

              {/* Historical Progression Timeline */}
              <div className="pt-3 border-t border-[#E6E6E3]">
                <h4 className="text-xs font-semibold uppercase text-[#787774] tracking-wider mb-2.5">
                  Historical Progression
                </h4>
                <div className="overflow-x-auto border border-[#E6E6E3] rounded-md">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F7F5] text-[#787774] font-mono text-[10px] uppercase border-b border-[#E6E6E3]">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Test</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Accuracy</th>
                        <th className="py-2.5 px-3">Pacing</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E6E3]">
                      {scoreTrends.map((st: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#F7F7F5]">
                          <td className="py-2.5 px-3 font-mono text-[#787774]">{st.date}</td>
                          <td className="py-2.5 px-3 font-medium text-[#202124]">{st.test_title}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#F1F1EF] text-[#787774] uppercase">
                              {st.test_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#202124]">
                            {st.score.toFixed(1)} <span className="text-[#9b9a97]">/ {st.max_score}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-700">{st.accuracy}%</td>
                          <td className="py-2.5 px-3 font-mono text-[#787774]">{st.pace_seconds}s / Q</td>
                          <td className="py-2.5 px-3 text-right">
                            <Link href={`/exam/${st.attempt_id}/result`} className="text-[#202124] hover:underline">
                              Scorecard →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBJECT & TOPIC MASTERY */}
        {activeTab === 'mastery' && (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#202124]">
                  Topic Mastery Distribution
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Mastery is earned through repeated assessments and decays over time without revision.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: 'Not Started', count: topicMastery.distribution.not_started || 0 },
                  { label: 'Studying', count: topicMastery.distribution.studying || 0 },
                  { label: 'Practiced', count: topicMastery.distribution.practiced || 0 },
                  { label: 'Developing', count: topicMastery.distribution.developing || 0 },
                  { label: 'Proficient', count: topicMastery.distribution.proficient || 0 },
                  { label: 'Needs Revision', count: topicMastery.distribution.needs_revision || 0 },
                ].map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] text-center">
                    <div className="text-lg font-bold font-mono text-[#202124]">{m.count}</div>
                    <div className="text-[11px] text-[#787774] mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Subject Competencies Table */}
              <div className="overflow-x-auto border border-[#E6E6E3] rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] text-[#787774] font-mono uppercase text-[10px] border-b border-[#E6E6E3]">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Mastery</th>
                      <th className="py-2.5 px-3">Practiced</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3">Pacing</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E3]">
                    {subjects.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-[#F7F7F5]">
                        <td className="py-2.5 px-3 font-medium text-[#202124]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-[#F1F1EF] text-[#787774]">
                              {sub.code}
                            </span>
                            <span>{sub.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={sub.competency_tier === 'Proficient' ? 'emerald' : sub.competency_tier === 'Developing' ? 'amber' : 'rose'}
                            size="sm"
                          >
                            {sub.competency_tier}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#202124]">{sub.avg_mastery}%</td>
                        <td className="py-2.5 px-3 font-mono text-[#787774]">{sub.total_practiced} Qs</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{sub.accuracy}%</td>
                        <td className="py-2.5 px-3 font-mono text-[#787774]">{sub.avg_pacing_seconds}s / Q</td>
                        <td className="py-2.5 px-3 text-right">
                          <Link href={`/exams/exam-ssc-cgl-2026?subject=${sub.id}`} className="text-[#202124] hover:underline">
                            Syllabus →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strong vs Weak vs Neglected Areas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Strong Areas */}
              <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2b593f]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strong Areas (≥ 75%)</span>
                </div>
                <div className="space-y-1.5">
                  {topicMastery.strongTopics.map((t: any) => (
                    <div key={t.id} className="p-2 rounded bg-[#ebf5e8] border border-[#c4e2b8] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#202124]">{t.title}</div>
                        <div className="text-[10px] text-[#787774] font-mono">{t.subject_name}</div>
                      </div>
                      <span className="font-mono text-emerald-700">{t.mastery_percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Areas */}
              <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Weak Areas (&lt; 60%)</span>
                </div>
                <div className="space-y-1.5">
                  {topicMastery.weakTopics.map((t: any) => (
                    <div key={t.id} className="p-2 rounded bg-[#fff0f0] border border-[#f5c2c2] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#202124]">{t.title}</div>
                        <div className="text-[10px] text-[#787774] font-mono">{t.subject_name}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[#e03e3e] block">{t.mastery_percentage}%</span>
                        <Link href={`/learn/${t.id}`} className="text-[10px] text-[#202124] hover:underline">
                          Drill →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neglected Areas */}
              <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#787774]">
                  <Clock className="w-3.5 h-3.5 text-[#9b9a97]" />
                  <span>Unattempted Areas</span>
                </div>
                <div className="space-y-1.5">
                  {topicMastery.neglectedTopics.map((t: any) => (
                    <div key={t.id} className="p-2 rounded bg-[#F7F7F5] border border-[#E6E6E3] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#202124]">{t.title}</div>
                        <div className="text-[10px] text-[#787774] font-mono">0 attempted</div>
                      </div>
                      <Link href={`/learn/${t.id}`} className="text-[10px] text-[#202124] hover:underline">
                        Start →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEST & MOCK HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-[#202124]">
                  Assessment History
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Chronological ledger of mock examinations, topic tests, and remedial drills.
                </p>
              </div>

              <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-md overflow-hidden">
                {attempts.map((att: any) => {
                  const isFullMock = att.test_type === 'full_mock';
                  const durationMin = Math.round((att.time_taken_seconds || 0) / 60);

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 bg-white hover:bg-[#F7F7F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={isFullMock ? 'amber' : 'gray'} size="sm">
                            {isFullMock ? 'Full Mock' : att.test_type ? att.test_type.replace('_', ' ') : 'Assessment'}
                          </Badge>
                          <span className="text-xs font-mono text-[#9b9a97]">
                            {new Date(att.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[#202124]">
                          {att.test_title_snapshot || att.test_title}
                        </div>
                        <div className="text-xs text-[#787774] flex items-center gap-3 font-mono">
                          <span>Time: {durationMin}m</span>
                          <span>•</span>
                          <span>Attempted: {att.attempted_questions} / {att.total_questions}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-mono font-medium text-[#202124]">
                            {att.final_score.toFixed(1)} <span className="text-[#9b9a97]">/ {att.maximum_marks}</span>
                          </div>
                          <div className="text-xs font-mono text-emerald-700">
                            {att.accuracy}% Acc
                          </div>
                        </div>

                        <Link href={`/exam/${att.id}/result`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
