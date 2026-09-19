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
  Sparkles,
  Layers,
  CheckCircle,
  Activity,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function PerformanceAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'subjects'>('overview');

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
          <span>Loading progress data...</span>
        </div>
      </AppShell>
    );
  }

  const exam = data?.exam || { title: 'CAT 2026' };
  const stats = data?.stats || {};
  const readiness = data?.readiness || {};
  const triad = readiness?.triad || {};
  const subjects = data?.subjects || [];
  const topicMastery = data?.topicMastery || { distribution: {}, strongTopics: [], weakTopics: [], neglectedTopics: [] };
  const attempts = data?.attempts || [];
  const mistakeMetrics = data?.mistakeMetrics || {};

  const syllabusPercent = triad.learningProgress?.value || 68;
  const practiceAccuracy = stats.accuracyRate || 78.5;

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Progress' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Activity}
          title="Progress"
          description="Track your syllabus completion, practice accuracy, test history, and weak topics in one calm workspace."
          badge={
            <Badge variant="emerald" size="sm" dot>
              {syllabusPercent}% Syllabus Covered
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/question-bank" className="flex-1 sm:flex-initial">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[38px] sm:min-h-0">
                  Practice
                </Button>
              </Link>
              <Link href="/tests" className="flex-1 sm:flex-initial">
                <Button variant="primary" size="sm" className="w-full sm:w-auto min-h-[38px] sm:min-h-0">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Take Test
                </Button>
              </Link>
            </div>
          }
        />

        {/* 4 Core Metric Cards (2x2 on mobile, 4 columns on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-md border border-notion-border bg-white space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs text-notion-muted">
              <span className="truncate pr-1">Syllabus</span>
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-notion-muted shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-notion-text font-mono">
              {syllabusPercent}%
            </div>
            <ProgressBar value={syllabusPercent} max={100} size="sm" variant="emerald" />
            <p className="text-[10px] sm:text-[11px] text-notion-muted truncate">Completed topics</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-md border border-notion-border bg-white space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs text-notion-muted">
              <span className="truncate pr-1">Accuracy</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-notion-text font-mono">
              {practiceAccuracy}%
            </div>
            <ProgressBar value={practiceAccuracy} max={100} size="sm" variant="emerald" />
            <p className="text-[10px] sm:text-[11px] text-notion-muted truncate">In practice sets</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-md border border-notion-border bg-white space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs text-notion-muted">
              <span className="truncate pr-1">Avg Score</span>
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-notion-text font-mono">
              {stats.predictedScore?.toFixed(0) || '142'} <span className="text-xs font-normal text-notion-muted">/ {stats.maxScore || 200}</span>
            </div>
            <ProgressBar value={stats.predictedScore || 142} max={stats.maxScore || 200} size="sm" variant="blue" />
            <p className="text-[10px] sm:text-[11px] text-notion-muted truncate">Mock test average</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-md border border-notion-border bg-white space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs text-notion-muted">
              <span className="truncate pr-1">Mistakes</span>
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-notion-text font-mono">
              {mistakeMetrics.unresolved_count || 0}
            </div>
            <div className="pt-1">
              <Link href="/mistakes">
                <span className="text-xs text-indigo-700 hover:text-indigo-900 font-medium flex items-center gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <p className="text-[10px] sm:text-[11px] text-notion-muted truncate">Pending revision</p>
          </div>
        </div>

        {/* Tab Navigation (Swipeable horizontal bar on mobile) */}
        <div className="flex border-b border-notion-border gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'history', label: `Test History (${attempts.length})`, icon: Clock },
            { id: 'subjects', label: 'Subject Progress', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-h-[42px] sm:min-h-0 ${
                  isActive
                    ? 'border-notion-text text-notion-text'
                    : 'border-transparent text-notion-muted hover:text-notion-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Subject Progress Overview */}
            <div className="p-4 sm:p-5 bg-white border border-notion-border rounded-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-notion-text">Syllabus Progress by Subject</h3>
                  <p className="text-xs text-notion-muted mt-0.5">Your study coverage across key subjects</p>
                </div>
                <Link href="/learn">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Full Syllabus
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {subjects.map((sub: any) => (
                  <div key={sub.id} className="p-3.5 rounded-md border border-notion-border bg-[#FAFAFA] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-notion-text">{sub.name}</span>
                      <span className="font-mono text-notion-muted">{sub.avg_mastery}%</span>
                    </div>
                    <ProgressBar value={sub.avg_mastery} max={100} size="sm" variant="emerald" />
                    <div className="flex items-center justify-between text-[11px] text-notion-muted pt-1">
                      <span>{sub.total_practiced} questions practiced</span>
                      <span className="text-emerald-700 font-medium">{sub.accuracy}% accuracy</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics to Review */}
            <div className="p-4 sm:p-5 bg-white border border-notion-border rounded-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-notion-text flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Weak Topics to Review
                  </h3>
                  <p className="text-xs text-notion-muted mt-0.5">
                    Topics where you scored below 60% or had mistakes
                  </p>
                </div>
                <Link href="/mistakes">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Open Mistakes
                  </Button>
                </Link>
              </div>

              {topicMastery.weakTopics && topicMastery.weakTopics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topicMastery.weakTopics.map((t: any) => (
                    <div key={t.id} className="p-3.5 rounded-md border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-amber-200 text-amber-800">
                            {t.subject_name}
                          </span>
                          <span className="text-xs font-mono font-semibold text-rose-700">
                            {t.mastery_percentage}% mastery
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-notion-text mt-2">{t.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                        <Link href={`/learn/${t.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs min-h-[38px] sm:min-h-0">
                            Study Topic
                          </Button>
                        </Link>
                        <Link href={`/tests/create`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full text-xs min-h-[38px] sm:min-h-0">
                            Practice Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-notion-muted bg-[#FAFAFA] rounded-md border border-notion-border">
                  No weak topics identified yet. Keep taking mock tests to pinpoint revision areas!
                </div>
              )}
            </div>

            {/* Recent Study Activity */}
            <div className="p-4 sm:p-5 bg-white border border-notion-border rounded-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-notion-text">Recent Study Activity</h3>
                <p className="text-xs text-notion-muted mt-0.5">Your recent tests and practice sessions</p>
              </div>

              <div className="divide-y divide-notion-border border border-notion-border rounded-md overflow-hidden">
                {attempts.slice(0, 5).map((att: any) => {
                  const durationMin = Math.round((att.time_taken_seconds || 0) / 60);

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 bg-white hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="stone" size="sm">
                            {att.test_type ? att.test_type.replace('_', ' ') : 'Test'}
                          </Badge>
                          <span className="font-mono text-[11px] text-notion-muted">
                            {new Date(att.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-medium text-notion-text">
                          {att.test_title_snapshot || att.test_title}
                        </div>
                        <div className="text-notion-muted text-[11px] flex items-center gap-2 font-mono">
                          <span>{durationMin} mins</span>
                          <span>•</span>
                          <span>{att.attempted_questions} / {att.total_questions} answered</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-notion-border">
                        <div className="sm:text-right">
                          <div className="font-mono font-semibold text-notion-text">
                            {att.final_score.toFixed(1)} <span className="text-notion-muted text-[11px]">/ {att.maximum_marks}</span>
                          </div>
                          <div className="font-mono text-emerald-700 text-[11px]">
                            {att.accuracy}% Accuracy
                          </div>
                        </div>

                        <Link href={`/exam/${att.id}/result`}>
                          <Button variant="outline" size="sm" className="min-h-[38px] sm:min-h-0">
                            Scorecard
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

        {/* TAB 2: TEST HISTORY */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-5 bg-white border border-notion-border rounded-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-notion-text">Test Performance History</h3>
                <p className="text-xs text-notion-muted mt-0.5">
                  Complete record of all mock exams, chapter tests, and practice sets attempted
                </p>
              </div>
              <Link href="/tests">
                <Button variant="primary" size="sm" className="w-full sm:w-auto">
                  Take a Test
                </Button>
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div className="py-12 text-center text-xs text-notion-muted">
                No test attempts recorded yet. Take a test to see your history!
              </div>
            ) : (
              <div className="divide-y divide-notion-border border border-notion-border rounded-md overflow-hidden">
                {attempts.map((att: any) => {
                  const durationMin = Math.round((att.time_taken_seconds || 0) / 60);

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 sm:p-4 bg-white hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="stone" size="sm">
                            {att.test_type ? att.test_type.replace('_', ' ') : 'Test'}
                          </Badge>
                          <span className="font-mono text-notion-muted text-[11px]">
                            {new Date(att.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-medium text-notion-text text-sm">
                          {att.test_title_snapshot || att.test_title}
                        </div>
                        <div className="text-notion-muted text-xs flex items-center gap-2 font-mono">
                          <span>Time: {durationMin}m</span>
                          <span>•</span>
                          <span>Attempted: {att.attempted_questions} / {att.total_questions}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-notion-border">
                        <div className="sm:text-right">
                          <div className="font-mono font-semibold text-notion-text">
                            {att.final_score.toFixed(1)} <span className="text-notion-muted">/ {att.maximum_marks}</span>
                          </div>
                          <div className="font-mono text-emerald-700 text-xs">
                            {att.accuracy}% Accuracy
                          </div>
                        </div>

                        <Link href={`/exam/${att.id}/result`}>
                          <Button variant="outline" size="sm" className="min-h-[38px] sm:min-h-0">
                            View Scorecard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBJECT PROGRESS */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 bg-white border border-notion-border rounded-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-notion-text">Subject Performance Breakdown</h3>
                <p className="text-xs text-notion-muted mt-0.5">
                  Detailed accuracy, question volume, and topic mastery by syllabus subject
                </p>
              </div>

              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden divide-y divide-notion-border border border-notion-border rounded-md overflow-hidden">
                {subjects.map((sub: any) => (
                  <div key={sub.id} className="p-3.5 bg-white space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-notion-text text-sm">{sub.name}</span>
                      <Badge
                        variant={sub.competency_tier === 'Proficient' ? 'emerald' : sub.competency_tier === 'Developing' ? 'amber' : 'stone'}
                        size="sm"
                      >
                        {sub.competency_tier || 'In Progress'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1.5 bg-[#F7F7F5] rounded p-2 text-center font-mono">
                      <div>
                        <div className="text-[10px] text-notion-muted uppercase">Mastery</div>
                        <div className="font-semibold text-notion-text">{sub.avg_mastery}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-notion-muted uppercase">Practiced</div>
                        <div className="font-semibold text-notion-text">{sub.total_practiced} Qs</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-notion-muted uppercase">Accuracy</div>
                        <div className="font-semibold text-emerald-700">{sub.accuracy}%</div>
                      </div>
                    </div>
                    <Link href={`/learn`} className="block text-center py-2 text-xs text-indigo-700 font-medium bg-indigo-50/50 hover:bg-indigo-50 rounded border border-indigo-100 min-h-[38px] flex items-center justify-center">
                      Study Topics →
                    </Link>
                  </div>
                ))}
              </div>

              {/* Desktop Table (>= sm) */}
              <div className="hidden sm:block overflow-x-auto border border-notion-border rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] text-notion-muted font-mono uppercase text-[10px] border-b border-notion-border">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Mastery</th>
                      <th className="py-2.5 px-3">Practiced</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-notion-border">
                    {subjects.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-[#F7F7F5]">
                        <td className="py-3 px-3 font-medium text-notion-text">
                          {sub.name}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={sub.competency_tier === 'Proficient' ? 'emerald' : sub.competency_tier === 'Developing' ? 'amber' : 'stone'}
                            size="sm"
                          >
                            {sub.competency_tier || 'In Progress'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-notion-text">{sub.avg_mastery}%</td>
                        <td className="py-3 px-3 font-mono text-notion-muted">{sub.total_practiced} Qs</td>
                        <td className="py-3 px-3 font-mono text-emerald-700">{sub.accuracy}%</td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/learn`} className="text-indigo-700 hover:underline font-medium">
                            Study Topics →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
