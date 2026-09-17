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
  const onboardingProfile = data?.onboardingProfile;

  const getErrorCategoryBadge = (category: string) => {
    switch (category) {
      case 'calculation_error':
        return <Badge variant="saffron" size="sm">Calculation Slip</Badge>;
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
      {/* Current Exam Banner with Conducting Body */}
      <div className="p-5 sm:p-6 mb-6 rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                {exam.code}
              </span>
              <Badge variant="emerald" size="sm" dot>
                Active Primary Target
              </Badge>
              {exam.conducting_body && (
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {exam.conducting_body}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {exam.title}
            </h1>

            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              {exam.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}`}>
              <Button variant="outline" size="sm">
                <Compass className="w-4 h-4 mr-1.5" />
                Exam Blueprint
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="saffron" size="sm">
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Continue Learning
              </Button>
            </Link>
          </div>
        </div>

        {/* Readiness Bar & Overall Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 mt-5 border-t border-stone-100">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-600 font-medium">Syllabus Coverage (Mastered Topics)</span>
              <strong className="text-stone-900">{stats.syllabusProgress}% Completed</strong>
            </div>
            <ProgressBar value={stats.syllabusProgress} max={100} size="sm" variant="emerald" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-600 font-medium">Examination Readiness Indicator</span>
              <strong className="text-amber-800 font-bold">{stats.readinessIndex}% (Qualified Cutoff Zone)</strong>
            </div>
            <ProgressBar value={stats.readinessIndex} max={100} size="sm" variant="saffron" />
          </div>
        </div>
      </div>

      {/* Metric Callout Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Predicted Tier-I Score"
          value={stats.predictedScore.toFixed(0)}
          max={stats.maxScore}
          subtext={`Cutoff Est: ~${stats.cutoffBar} (Target: ${stats.targetScore})`}
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
          label="Syllabus Mastered"
          value={`${stats.syllabusProgress}%`}
          subtext="6 of 14 core modules completed"
          accent="navy"
          trend={{ value: '18 hrs logged', isPositive: true }}
        />
        <MetricCallout
          label="Pending Revision"
          value={stats.pendingRevisionCount}
          subtext="Unresolved mistake records"
          accent="rose"
        />
      </div>

      {/* Recommended Next Action: High-Impact Coaching Card */}
      {rec && (
        <div className="p-5 sm:p-6 mb-8 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  Recommended Next Topic
                </span>
                <Badge variant="stone" size="sm">{rec.subjectName}</Badge>
                <span className="text-xs font-mono text-amber-900 font-bold">
                  Weightage: {rec.weightage}%
                </span>
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
                  Pending Mistakes ({stats.pendingRevisionCount})
                </Button>
              </Link>
              <Link href="/learn/topic-cgl-percentages">
                <Button variant="saffron" size="sm">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Study Topic ({rec.estimatedMinutes}m)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Weak Areas & Remedial Drills Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Focus & Weak Areas</h2>
            <p className="text-xs text-stone-500">Topics flagged from your diagnostic attempts and onboarding calibration</p>
          </div>
          <Link
            href="/mistakes"
            className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1"
          >
            Mistake Ledger ({stats.pendingRevisionCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakAreas.flaggedTopics?.map((wt: any) => (
            <Card key={wt.id} className="p-4 bg-white hover:border-stone-300 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    {wt.code}
                  </span>
                  <span className="text-xs font-semibold text-stone-700">{wt.subject_name}</span>
                  <Badge variant="rose" size="sm">{wt.mastery_percentage}% Accuracy</Badge>
                </div>
                <h4 className="text-sm font-bold text-stone-900">{wt.title}</h4>
                <p className="text-[11px] text-stone-500">Weightage: {wt.weightage_percentage}% of Tier-I marks</p>
              </div>

              <Link href="/tests">
                <Button variant="secondary" size="sm" className="shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Remedial Drill
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Subject Mastery Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Subject Coverage Distribution</h2>
            <p className="text-xs text-stone-500">Curricular breakdown across the 4 examination disciplines</p>
          </div>
          <Link
            href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}`}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            Full Syllabus Tree <ArrowRight className="w-3.5 h-3.5" />
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
              <Card key={sub.id} className="hover:border-stone-300 transition-all flex flex-col justify-between bg-white">
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
                    href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}?subject=${sub.id}`}
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

      {/* Tabs Section: Mock Tests, Mistakes Forensics, 60-Day Path */}
      <div className="space-y-4">
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
          <div className="space-y-4">
            {/* Recent Completed Attempts */}
            {attempts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                  Recent Test Performance
                </h4>
                {attempts.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
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
                        <span>Time Taken: <strong className="text-stone-700 font-mono">{Math.round(att.time_taken_seconds / 60)} mins</strong></span>
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
            )}

            {/* Recommended Mocks */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Recommended Mock Exams
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTests.map((t: any) => (
                  <Card key={t.id} className="p-5 bg-white hover:border-stone-300 transition-colors space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {t.test_type === 'full_mock' ? 'Full Length CBE' : 'Sectional Practice'}
                        </span>
                        <span className="text-xs text-stone-500 font-mono">
                          {Math.round(t.duration_seconds / 60)} Mins
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{t.title}</h4>
                      <p className="text-xs text-stone-600 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-mono">{t.questions_count || 8} Questions</span>
                      <Link href="/tests">
                        <Button variant="saffron" size="sm">
                          Start Test <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Enrolled Test Series */}
        {activeTab === 'series' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs text-stone-500">
                Multi-part sequential test series curated by verified faculty.
              </p>
              <Link href="/library" className="text-xs text-amber-700 font-semibold hover:underline">
                Explore More Series in Library →
              </Link>
            </div>

            {enrolledSeries.length === 0 ? (
              <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center text-xs text-stone-500 space-y-3">
                <p>You haven't enrolled in any test series yet.</p>
                <Link href="/library">
                  <Button variant="primary" size="sm">
                    Browse Public Library
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledSeries.map((s: any) => (
                  <Card key={s.enrollment_id} className="p-5 bg-white border-stone-200 space-y-4 flex flex-col justify-between shadow-2xs">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {s.exam_title || 'Target Exam'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                          s.access_tier === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {s.access_tier === 'paid' ? 'Full Paid Access' : 'Free Preview'}
                        </span>
                      </div>

                      <h4 className="text-sm font-serif font-bold text-stone-900">{s.series_title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2">{s.series_description}</p>
                      <p className="text-[11px] text-stone-400 font-mono">By {s.creator_name || 'Faculty Member'}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-500">Series Progression</span>
                          <span className="font-bold text-stone-900">{s.completed_tests_count || 0} / {s.total_tests || 5} Completed</span>
                        </div>
                        <ProgressBar value={s.progress_percentage || 0} size="sm" variant="saffron" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono text-stone-400">
                          Enrolled: {new Date(s.enrolled_at).toLocaleDateString()}
                        </span>
                        <Link href={`/series/${s.series_id}`}>
                          <Button variant="saffron" size="sm" className="text-xs">
                            Continue Series <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Mistake Revision */}
        {activeTab === 'mistakes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs text-stone-500">
                Unresolved mistake records tagged by cognitive root causes.
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
