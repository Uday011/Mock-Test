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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'mistakes' | 'path'>('tests');

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
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-mono tracking-wide">Loading Nalanda Academic Workspace...</p>
        </div>
      </AppShell>
    );
  }

  const exam = data?.activeExam || { title: 'SSC CGL 2026', total_marks: 200 };
  const stats = data?.stats || {
    predictedScore: 142.0,
    maxScore: 200,
    targetScore: 165.0,
    accuracyRate: 78.5,
    syllabusProgress: 42.0,
    mistakesCount: 3,
  };
  const rec = data?.recommendedAction;
  const subjects = data?.subjects || [];
  const mistakes = data?.mistakes || [];
  const attempts = data?.attempts || [];
  const learningPath = data?.learningPath;

  const getSubjectColor = (accent: string) => {
    switch (accent) {
      case 'amber': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'emerald': return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'rose': return 'bg-rose-50 text-rose-900 border-rose-200';
      default: return 'bg-stone-50 text-stone-900 border-stone-200';
    }
  };

  const getErrorCategoryBadge = (category: string) => {
    switch (category) {
      case 'calculation_error':
        return <Badge variant="saffron" size="sm">Calculation Error</Badge>;
      case 'conceptual_gap':
        return <Badge variant="rose" size="sm">Conceptual Gap</Badge>;
      case 'time_rush':
        return <Badge variant="stone" size="sm">Time Pressure</Badge>;
      default:
        return <Badge variant="stone" size="sm">{category}</Badge>;
    }
  };

  return (
    <AppShell activeExamTitle={exam.title}>
      {/* Workspace Header */}
      <PageHeader
        title="Learner Workspace"
        description="Daily progress, diagnostic assessment readiness, cognitive mistake tracking, and structured syllabus coverage."
        badge={
          <Badge variant="emerald" size="md" dot>
            {exam.title} (Tier-I)
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn">
              <Button variant="secondary" size="sm">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Study Path
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="saffron" size="sm">
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Attempt Mock Test
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Callout Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Predicted Tier-I Score"
          value={stats.predictedScore.toFixed(0)}
          max={stats.maxScore}
          subtext={`Target: ${stats.targetScore} (Cutoff ~138)`}
          accent="saffron"
          trend={{ value: '+14 pts vs baseline', isPositive: true }}
        />
        <MetricCallout
          label="Diagnostic Accuracy"
          value={`${stats.accuracyRate}%`}
          subtext="Across 420 questions practiced"
          accent="emerald"
          trend={{ value: '+4.2% this week', isPositive: true }}
        />
        <MetricCallout
          label="Syllabus Progress"
          value={`${stats.syllabusProgress}%`}
          subtext="6 of 14 core modules mastered"
          accent="navy"
          trend={{ value: '18 hrs logged', isPositive: true }}
        />
        <MetricCallout
          label="Mistake Notebook"
          value={stats.mistakesCount}
          subtext="Active items to review"
          accent="rose"
        />
      </div>

      {/* Recommended Next Action: Pedagogical Coaching Banner */}
      {rec && (
        <div className="p-5 sm:p-6 mb-8 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  Recommended Next Action
                </span>
                <Badge variant="stone" size="sm">{rec.subjectName}</Badge>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {rec.headline}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
                {rec.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/mistakes">
                <Button variant="secondary" size="sm">
                  <BookMarked className="w-4 h-4 mr-1.5" />
                  Review Mistakes
                </Button>
              </Link>
              <Link href="/tests">
                <Button variant="saffron" size="sm">
                  <Zap className="w-4 h-4 mr-1.5" />
                  Start {rec.estimatedMinutes}m Drill
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subject Mastery Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Subject Mastery Matrix</h2>
            <p className="text-xs text-stone-500">Tier-I syllabus distribution across 4 core disciplines</p>
          </div>
          <Link
            href="/exams/exam-ssc-cgl-2026"
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            Detailed Syllabus Tree <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub: any) => {
            const mastery = sub.avg_mastery ? Math.round(sub.avg_mastery) : 60;
            const practiced = sub.total_practiced || 45;
            const accuracy = sub.total_practiced > 0
              ? Math.round((sub.total_correct / sub.total_practiced) * 100)
              : 75;

            return (
              <Card key={sub.id} className="hover:border-stone-300 transition-all flex flex-col justify-between">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {sub.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-800">
                      {mastery}% Mastery
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                      {sub.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                      {sub.description}
                    </p>
                  </div>

                  <ProgressBar
                    value={mastery}
                    size="sm"
                    variant={sub.color_accent === 'amber' ? 'saffron' : sub.color_accent === 'emerald' ? 'emerald' : 'navy'}
                  />

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{practiced} Qs Practiced</span>
                    <span className="font-semibold text-stone-700">{accuracy}% Acc.</span>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-stone-50/60 border-t border-stone-100 rounded-b-xl flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">{sub.total_topics || 3} Topics</span>
                  <Link
                    href={`/exams/exam-ssc-cgl-2026?subject=${sub.id}`}
                    className="text-amber-700 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    View Topics <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs Section: Mock Attempts, Mistakes Forensics, Learning Path */}
      <div className="space-y-4">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          tabs={[
            { id: 'tests', label: 'Diagnostic Tests & Mocks', count: attempts.length },
            { id: 'mistakes', label: 'Mistake Forensics', count: mistakes.length },
            { id: 'path', label: '60-Day Strategic Plan' },
          ]}
        />

        {/* Tab 1: Tests & Attempts */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {attempts.length > 0 ? (
              <div className="space-y-3">
                {attempts.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-4 bg-white border border-stone-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" size="sm">Completed</Badge>
                        <span className="text-xs text-stone-400 font-mono">
                          {new Date(att.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        {att.test_title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                        <span>Score: <strong className="text-stone-900 font-mono">{att.final_score}</strong> / {att.maximum_marks}</span>
                        <span>•</span>
                        <span>Accuracy: <strong className="text-emerald-700 font-mono">{att.accuracy}%</strong></span>
                        <span>•</span>
                        <span>Time: <strong className="text-stone-700 font-mono">{Math.round(att.time_taken_seconds / 60)} mins</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/exam/${att.id}/result`}>
                        <Button variant="outline" size="sm">
                          View Performance Breakdown
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
            ) : (
              <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                <FileCheck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-500">No mock tests attempted yet.</p>
                <Link href="/tests" className="mt-3 inline-block">
                  <Button variant="saffron" size="sm">Browse Available Tests</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mistakes Forensics Snapshot */}
        {activeTab === 'mistakes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs text-stone-500">
                Cognitive categorization helps distinguish calculation slips from deeper concept gaps.
              </p>
              <Link href="/mistakes" className="text-xs text-amber-700 font-semibold hover:underline">
                Open Full Mistake Notebook →
              </Link>
            </div>

            {mistakes.slice(0, 3).map((m: any) => (
              <div key={m.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {getErrorCategoryBadge(m.error_category)}
                    <span className="text-xs font-semibold text-stone-700">{m.topic_title || m.subject_name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {m.question_text}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 bg-stone-50/80 rounded-lg border border-stone-200/60 font-mono">
                  <div>
                    <span className="text-rose-600 font-bold">Your Selection: </span>
                    <span className="text-stone-800">Option {m.selected_answer}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold">Correct Key: </span>
                    <span className="text-stone-800">Option {m.correct_answer}</span>
                  </div>
                </div>

                {m.user_notes && (
                  <p className="text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                    <strong>Forensic Reflection:</strong> {m.user_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: 60-Day Strategic Plan */}
        {activeTab === 'path' && (
          <div className="space-y-4">
            {learningPath ? (
              <div className="space-y-3">
                <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{learningPath.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{learningPath.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-800">{learningPath.target_days} Days</span>
                    <div className="text-[11px] text-stone-400">{learningPath.recommended_hours_per_week} hrs/week</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningPath.units?.map((u: any, idx: number) => (
                    <div
                      key={u.id}
                      className="p-3.5 bg-white border border-stone-200/90 rounded-lg flex items-center justify-between text-xs hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-stone-900">{u.topic_title}</div>
                          <div className="text-[11px] text-stone-400">{u.subject_name} • {u.estimated_minutes} mins</div>
                        </div>
                      </div>
                      <Badge variant={idx < 4 ? 'emerald' : 'stone'} size="sm">
                        {idx < 4 ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">Learning path being mapped.</p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
