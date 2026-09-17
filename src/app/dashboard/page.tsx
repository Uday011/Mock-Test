'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  ArrowRight,
  BookMarked,
  Clock,
  Target,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Calendar,
  Zap,
  ShieldCheck,
  HelpCircle,
  RotateCcw,
  Compass,
  FileText,
  Activity,
  CheckSquare,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { CalloutBlock } from '@/components/ui/CalloutBlock';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'series' | 'mistakes' | 'path'>('tests');

  useEffect(() => {
    fetch('/api/dashboard/overview')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-5 h-5 border-2 border-[#202124] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#787774] font-mono tracking-wide">Loading workspace...</p>
        </div>
      </AppShell>
    );
  }

  const exam = data?.activeExam || { title: 'SSC CGL 2026', total_marks: 200, code: 'SSC-CGL-2026' };
  const stats = data?.stats || {
    predictedScore: 142.0,
    maxScore: 200,
    targetScore: 165.0,
    accuracyRate: 78.5,
    syllabusProgress: 42.0,
    readinessIndex: 71,
    cutoffBar: 138.0,
    pendingRevisionCount: 3,
  };
  const rec = data?.recommendedAction;
  const weakAreas = data?.weakAreas || { declaredWeakSubjects: [], flaggedTopics: [] };
  const subjects = data?.subjects || [];
  const mistakes = data?.mistakes || [];
  const attempts = data?.attempts || [];
  const availableTests = data?.availableTests || [];
  const enrolledSeries = data?.enrolled_series || [];
  const learningPath = data?.learningPath;

  const getErrorCategoryBadge = (category: string) => {
    switch (category) {
      case 'calculation_error':
        return <Badge variant="orange" size="sm">Calculation Slip</Badge>;
      case 'conceptual_gap':
        return <Badge variant="rose" size="sm">Conceptual Gap</Badge>;
      case 'time_rush':
        return <Badge variant="gray" size="sm">Time Pressure</Badge>;
      default:
        return <Badge variant="gray" size="sm">{category}</Badge>;
    }
  };

  return (
    <AppShell activeExamTitle={exam.title}>
      <div className="max-w-5xl mx-auto space-y-7 pb-16">
        {/* Document Header */}
        <PageHeader
          icon={GraduationCap}
          title="Learner Workspace"
          description="Continuous performance telemetry, exam syllabus coverage, and targeted cognitive remedial recommendations."
          badge={
            <Badge variant="emerald" size="sm" dot>
              Active Target: {exam.code || 'SSC CGL'}
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}`}>
                <Button variant="outline" size="sm">
                  <Compass className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                  Exam Blueprint
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="primary" size="sm">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Continue Learning
                </Button>
              </Link>
            </div>
          }
        />

        {/* Notion-style Document Properties Table */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-1">
          <PropertyTable>
            <PropertyRow icon={Compass} label="Primary Target Exam">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#202124]">{exam.title}</span>
                <Badge variant="gray" size="sm">{exam.code || 'Tier-I'}</Badge>
                {exam.conducting_body && (
                  <span className="text-xs text-[#787774] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {exam.conducting_body}
                  </span>
                )}
              </div>
            </PropertyRow>

            <PropertyRow icon={Activity} label="Readiness Index">
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {stats.readinessIndex}%
                </span>
                <div className="flex-1">
                  <ProgressBar value={stats.readinessIndex} max={100} size="sm" variant="emerald" />
                </div>
                <Badge variant="emerald" size="sm">Cutoff Qualified</Badge>
              </div>
            </PropertyRow>

            <PropertyRow icon={Target} label="Predicted Score">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#202124]">
                  {stats.predictedScore.toFixed(1)}
                </span>
                <span className="text-[#787774]">/ {stats.maxScore}</span>
                <span className="text-[11px] text-[#9b9a97]">
                  (Est. Cutoff: ~{stats.cutoffBar} • Target: {stats.targetScore})
                </span>
              </div>
            </PropertyRow>

            <PropertyRow icon={CheckCircle2} label="Diagnostic Accuracy">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#202124]">{stats.accuracyRate}%</span>
                <span className="text-[11px] text-[#787774]">(Across 420 questions practiced)</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={BookOpen} label="Syllabus Mastered">
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {stats.syllabusProgress}%
                </span>
                <div className="flex-1">
                  <ProgressBar value={stats.syllabusProgress} max={100} size="sm" variant="blue" />
                </div>
                <span className="text-[11px] text-[#787774] font-mono">6 of 14 modules</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={AlertTriangle} label="Pending Mistakes">
              <div className="flex items-center gap-2">
                <Badge variant={stats.pendingRevisionCount > 0 ? 'rose' : 'gray'} size="sm">
                  {stats.pendingRevisionCount} unresolved records
                </Badge>
                <Link href="/mistakes" className="text-xs text-[#787774] hover:text-[#202124] underline ml-2">
                  Open Forensic Ledger →
                </Link>
              </div>
            </PropertyRow>
          </PropertyTable>
        </div>

        {/* Recommended Next Action: Notion Callout Block */}
        {rec && (
          <CalloutBlock
            icon={Flame}
            variant="amber"
            title={`Recommended Next Focus: ${rec.headline}`}
            action={
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Link href="/mistakes">
                  <Button variant="outline" size="sm">
                    <BookMarked className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                    Mistakes ({stats.pendingRevisionCount})
                  </Button>
                </Link>
                <Link href="/learn/topic-cgl-percentages">
                  <Button variant="primary" size="sm">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Study Topic ({rec.estimatedMinutes}m)
                  </Button>
                </Link>
              </div>
            }
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="orange" size="sm">{rec.subjectName}</Badge>
                <span className="text-xs font-mono text-[#787774]">
                  Exam Weightage: <strong className="text-[#202124]">{rec.weightage}%</strong>
                </span>
              </div>
              <p className="text-xs text-[#202124] leading-relaxed max-w-3xl">
                {rec.reason}
              </p>
            </div>
          </CalloutBlock>
        )}

        {/* Focus & Weak Areas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#787774]" />
              <h2 className="text-sm font-semibold text-[#202124]">Focus & Weak Areas</h2>
            </div>
            <Link
              href="/mistakes"
              className="text-xs text-[#787774] hover:text-[#202124] font-medium flex items-center gap-1 transition-colors"
            >
              Mistake Ledger ({stats.pendingRevisionCount}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakAreas.flaggedTopics?.map((wt: any) => (
              <div
                key={wt.id}
                className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg hover:border-[#d4d4d4] transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                      {wt.code}
                    </span>
                    <span className="text-xs text-[#787774] truncate">{wt.subject_name}</span>
                    <Badge variant="rose" size="sm">{wt.mastery_percentage}% Acc</Badge>
                  </div>
                  <h4 className="text-xs font-medium text-[#202124] truncate">{wt.title}</h4>
                  <p className="text-[11px] text-[#9b9a97] font-mono">Weightage: {wt.weightage_percentage}% of marks</p>
                </div>

                <Link href="/tests">
                  <Button variant="outline" size="sm" className="shrink-0">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Drill
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Coverage Distribution (Notion Database Grid) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#787774]" />
              <h2 className="text-sm font-semibold text-[#202124]">Subject Coverage Distribution</h2>
            </div>
            <Link
              href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}`}
              className="text-xs text-[#787774] hover:text-[#202124] font-medium flex items-center gap-1 transition-colors"
            >
              Full Syllabus Tree <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((sub: any) => {
              const mastery = sub.avg_mastery ? Math.round(sub.avg_mastery) : 60;
              const practiced = sub.total_practiced || 45;
              const accuracy = sub.total_practiced > 0
                ? Math.round((sub.total_correct / sub.total_practiced) * 100)
                : 75;

              return (
                <div
                  key={sub.id}
                  className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg flex flex-col justify-between hover:border-[#d4d4d4] transition-colors space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                        {sub.code}
                      </span>
                      <span className="text-xs font-mono text-[#202124] font-medium">
                        {mastery}%
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#202124] line-clamp-1">
                        {sub.name}
                      </h3>
                      <p className="text-[11px] text-[#787774] line-clamp-2 mt-0.5">
                        {sub.description}
                      </p>
                    </div>

                    <ProgressBar
                      value={mastery}
                      size="sm"
                      variant="emerald"
                    />

                    <div className="pt-2 border-t border-[#F1F1EF] flex items-center justify-between text-[11px] text-[#787774] font-mono">
                      <span>{practiced} Qs</span>
                      <span>{accuracy}% Acc</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-[11px]">
                    <span className="text-[#9b9a97]">{sub.total_topics || 3} Topics</span>
                    <Link
                      href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}?subject=${sub.id}`}
                      className="text-[#202124] hover:underline flex items-center gap-0.5 font-medium"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Views: Tabs Section */}
        <div className="space-y-4 pt-2">
          <Tabs
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
            tabs={[
              { id: 'tests', label: 'Recent Tests & Recommended Mocks', count: availableTests.length },
              { id: 'series', label: 'Enrolled Master Series', count: enrolledSeries.length },
              { id: 'mistakes', label: 'Pending Mistake Revision', count: stats.pendingRevisionCount },
              { id: 'path', label: '60-Day Strategic Plan' },
            ]}
          />

          {/* Tab 1: Tests & Attempts */}
          {activeTab === 'tests' && (
            <div className="space-y-5">
              {/* Recent Completed Attempts */}
              {attempts.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-medium text-[#787774] uppercase tracking-wider">
                    Recent Test Performance
                  </h4>
                  <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-lg bg-white overflow-hidden">
                    {attempts.map((att: any) => (
                      <div
                        key={att.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F7F5] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="emerald" size="sm">Completed</Badge>
                            <span className="text-xs text-[#787774] font-mono">
                              {new Date(att.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-[#202124]">
                            {att.test_title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[#787774] font-mono flex-wrap">
                            <span>Score: <strong className="text-[#202124]">{att.final_score}</strong> / {att.maximum_marks}</span>
                            <span>•</span>
                            <span>Accuracy: <strong className="text-emerald-700">{att.accuracy}%</strong></span>
                            <span>•</span>
                            <span>Time: {Math.round(att.time_taken_seconds / 60)} mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/exam/${att.id}/result`}>
                            <Button variant="outline" size="sm">
                              Performance Breakdown
                            </Button>
                          </Link>
                          <Link href={`/tests`}>
                            <Button variant="secondary" size="sm">
                              Retake
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Mocks */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Recommended Mock Exams
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTests.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-4 bg-white border border-[#E6E6E3] rounded-lg hover:border-[#d4d4d4] transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="blue" size="sm">
                            {t.test_type === 'full_mock' ? 'Full Length CBE' : 'Sectional Practice'}
                          </Badge>
                          <span className="text-xs text-[#787774] font-mono">
                            {Math.round(t.duration_seconds / 60)} Mins
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#202124]">{t.title}</h4>
                        <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed">{t.description}</p>
                      </div>

                      <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between">
                        <span className="text-xs text-[#787774] font-mono">{t.questions_count || 8} Questions</span>
                        <Link href="/tests">
                          <Button variant="primary" size="sm">
                            Start Test <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Enrolled Test Series */}
          {activeTab === 'series' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs text-[#787774]">
                  Multi-part sequential test series curated by verified faculty.
                </p>
                <Link href="/library" className="text-xs text-[#202124] hover:underline">
                  Explore More Series in Library →
                </Link>
              </div>

              {enrolledSeries.length === 0 ? (
                <div className="p-8 bg-white border border-[#E6E6E3] rounded-lg text-center text-xs text-[#787774] space-y-3">
                  <p>You haven't enrolled in any test series yet.</p>
                  <Link href="/library">
                    <Button variant="primary" size="sm">
                      Browse Public Library
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrolledSeries.map((s: any) => (
                    <div
                      key={s.enrollment_id}
                      className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-3 flex flex-col justify-between hover:border-[#d4d4d4] transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                            {s.exam_title || 'Target Exam'}
                          </span>
                          <Badge variant={s.access_tier === 'paid' ? 'emerald' : 'gray'} size="sm">
                            {s.access_tier === 'paid' ? 'Paid Access' : 'Free Preview'}
                          </Badge>
                        </div>

                        <h4 className="text-xs font-semibold text-[#202124]">{s.series_title}</h4>
                        <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed">{s.series_description}</p>
                        <p className="text-[11px] text-[#9b9a97] font-mono">By {s.creator_name || 'Faculty Member'}</p>
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-[#E6E6E3]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#787774]">Series Progression</span>
                            <span className="font-medium text-[#202124]">{s.completed_tests_count || 0} / {s.total_tests || 5} Completed</span>
                          </div>
                          <ProgressBar value={s.progress_percentage || 0} size="sm" variant="emerald" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-[#9b9a97]">
                            Enrolled: {new Date(s.enrolled_at).toLocaleDateString()}
                          </span>
                          <Link href={`/series/${s.series_id}`}>
                            <Button variant="primary" size="sm">
                              Continue Series <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Pending Mistake Revision */}
          {activeTab === 'mistakes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs text-[#787774]">
                  Unresolved mistake records tagged by cognitive root causes.
                </p>
                <Link href="/mistakes" className="text-xs text-[#202124] hover:underline">
                  Open Full Mistake Notebook →
                </Link>
              </div>

              <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-lg bg-white overflow-hidden">
                {mistakes.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="p-4 space-y-2.5 hover:bg-[#F7F7F5] transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {getErrorCategoryBadge(m.error_category)}
                        <span className="text-xs font-medium text-[#202124]">{m.topic_title || m.subject_name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#9b9a97]">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#202124] leading-relaxed">
                      {m.question_text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-2.5 bg-[#F1F1EF] rounded border border-[#E6E6E3] font-mono">
                      <div>
                        <span className="text-rose-600 font-medium">Your Selection: </span>
                        <span className="text-[#202124]">Option {m.selected_answer}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 font-medium">Correct Key: </span>
                        <span className="text-[#202124]">Option {m.correct_answer}</span>
                      </div>
                    </div>

                    {m.user_notes && (
                      <p className="text-xs text-[#202124] bg-[#F7F7F5] p-2 rounded border border-[#E6E6E3] leading-relaxed">
                        <strong className="text-[#787774]">Forensic Reflection:</strong> {m.user_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: 60-Day Strategic Plan */}
          {activeTab === 'path' && (
            <div className="space-y-3">
              {learningPath ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-[#202124]">{learningPath.title}</h3>
                      <p className="text-xs text-[#787774] mt-0.5">{learningPath.description}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-semibold text-[#202124]">{learningPath.target_days} Days</span>
                      <div className="text-[11px] text-[#787774]">{learningPath.recommended_hours_per_week} hrs/week</div>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-lg bg-white overflow-hidden">
                    {learningPath.units?.map((u: any, idx: number) => (
                      <div
                        key={u.id}
                        className="p-3 flex items-center justify-between text-xs hover:bg-[#F7F7F5] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-[#202124]">{u.topic_title}</div>
                            <div className="text-[11px] text-[#787774]">{u.subject_name} • {u.estimated_minutes} mins</div>
                          </div>
                        </div>
                        <Badge variant={idx < 4 ? 'emerald' : 'gray'} size="sm">
                          {idx < 4 ? 'Completed' : 'Upcoming'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#787774]">Learning path being mapped.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
