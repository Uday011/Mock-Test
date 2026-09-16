'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Calendar,
  Zap,
  RotateCcw,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SyllabusHierarchyTree } from '@/components/learning/SyllabusHierarchyTree';
import { TopicTestModal } from '@/components/learning/TopicTestModal';
import { RevisionQueueHub } from '@/components/learning/RevisionQueueHub';

export default function LearningDashboardPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'official_syllabus' | 'revision_queue'>('recommended');
  const [treeData, setTreeData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Test Modal State
  const [activeTest, setActiveTest] = useState<{ topicId: string; topicTitle: string; test: any } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/learn/tree').then((r) => r.json()),
      fetch('/api/dashboard/overview').then((r) => r.json()),
    ])
      .then(([treeRes, dashRes]) => {
        if (treeRes.success) setTreeData(treeRes);
        if (dashRes.success) setDashboardData(dashRes);
      })
      .catch((err) => console.error('Error fetching learning dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleStartTest = (topicId: string, testId: string) => {
    // Fetch test details for modal
    fetch(`/api/learn/${topicId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.topic_test) {
          setActiveTest({
            topicId,
            topicTitle: data.topic.title,
            test: data.topic_test,
          });
        }
      });
  };

  const handleTestComplete = () => {
    // Refresh tree and dashboard data
    fetch('/api/learn/tree')
      .then((r) => r.json())
      .then((treeRes) => {
        if (treeRes.success) setTreeData(treeRes);
      });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-stone-500 font-mono">
          Loading Learning System & Curricula...
        </div>
      </AppShell>
    );
  }

  const exam = treeData?.exam || { title: 'SSC CGL 2026' };
  const stats = treeData?.stats || {
    total_topics: 14,
    completed_topics: 6,
    mastered_topics: 3,
    revision_due_count: 2,
    completion_percentage: 42,
  };

  const subjects = treeData?.subjects || [];
  const learningPath = dashboardData?.learningPath;
  const units = learningPath?.units || [];

  // Identify topics requiring spaced repetition revision
  const revisionTopics: any[] = [];
  subjects.forEach((s: any) => {
    s.topics.forEach((t: any) => {
      if (t.revision_status === 'due' || t.user_status === 'revision_due') {
        revisionTopics.push({ ...t, subjectName: s.name });
      }
    });
  });

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Learning System & Pathways' },
      ]}
    >
      <PageHeader
        title={`${exam.title} Learning System`}
        description="Comprehensive curriculum connecting official syllabus structures, pedagogical learning pathways, active recall checkpoints, and topic test assessments."
        badge={<Badge variant="saffron" size="md">Adaptive Learning Engine</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/exams/exam-ssc-cgl-2026">
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-1.5" />
                Exam Blueprint
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="saffron" size="sm">
                <Zap className="w-4 h-4 mr-1.5" />
                Sectional Drills
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">
              Current Stage
            </span>
            <Badge variant="stone" size="sm">Sprint 1</Badge>
          </div>
          <div className="text-base font-serif font-bold text-stone-900 mt-1">
            Arithmetic & Logic Foundations
          </div>
          <span className="text-xs text-stone-500">60-Day Strategic Sprint</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono block">
            Overall Syllabus Coverage
          </span>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {stats.completion_percentage}%
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-amber-600 h-full rounded-full transition-all"
              style={{ width: `${stats.completion_percentage}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats.completed_topics} of {stats.total_topics} Topics Covered ({stats.mastered_topics} Mastered)
          </span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">
              Spaced Repetition
            </span>
            {stats.revision_due_count > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {stats.revision_due_count}{' '}
            <span className="text-xs font-normal text-stone-500">Topics Due</span>
          </div>
          <span className="text-xs text-rose-600 font-medium">
            Active recall interval due today
          </span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono block">
            Learning Consistency
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className="w-5 h-5 text-amber-600 fill-amber-600" />
            <span className="text-2xl font-serif font-bold text-stone-900">4 Days</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            14.5 hours focused study logged this week
          </span>
        </div>
      </div>

      {/* Hero: Active Resume & Next Topic Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Study Hero */}
        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-amber-500/10 via-amber-50/20 to-white border border-amber-200/80 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  Resume Current Topic
                </span>
                <span className="text-xs text-stone-500 font-medium">Quantitative Aptitude</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Percentages, Profit, Loss & Discount
              </h3>
              <p className="text-xs text-stone-600 max-w-lg">
                Continue master formulas: reciprocal fractional multipliers, marked price golden ratio, and false weight calculation traps.
              </p>
            </div>
            <Link href="/learn/topic-cgl-percentages" className="shrink-0">
              <Button variant="saffron" size="md">
                Resume Topic
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200/60 flex items-center justify-between gap-4 text-xs font-mono text-stone-600">
            <span>Progress: 74% (Studied)</span>
            <span>Est. Remaining: 25 mins</span>
            <Link href="/learn/topic-cgl-percentages#assessment" className="text-amber-700 hover:underline font-bold">
              Take Topic Test →
            </Link>
          </div>
        </div>

        {/* Next Recommended Topic */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-stone-400 block">
              Prerequisite Ordered Next
            </span>
            <h4 className="text-base font-serif font-bold text-stone-900 mt-1">
              Ratio, Proportion & Mixture Alligation
            </h4>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Unlocks after completing Percentages. Covers direct/inverse variation, mean proportionals, and replacement cycles.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400">14 hrs • Medium</span>
            <Link href="/learn/topic-cgl-ratio-proportions">
              <Button variant="outline" size="sm">
                View Topic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Alert Callout if Revision Due */}
      {revisionTopics.length > 0 && (
        <div className="mb-8 p-4 bg-rose-50/70 border border-rose-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-rose-950">
                  Active Recall Revision Due ({revisionTopics.length} Topics)
                </h4>
                <p className="text-xs text-rose-700">
                  Learning science requires periodic retrieval before memory decay sets in. Review these concepts:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {revisionTopics.map((rt) => (
                <Link key={rt.id} href={`/learn/${rt.id}`}>
                  <Button variant="outline" size="sm" className="bg-white text-rose-900 hover:bg-rose-100 border-rose-300">
                    {rt.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-2 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              activeTab === 'recommended'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Nalanda Recommended Learning Order
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('official_syllabus')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              activeTab === 'official_syllabus'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Official Syllabus Structure
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('revision_queue')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              activeTab === 'revision_queue'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Spaced Repetition & Revision Queue
          </button>
        </div>

        <span className="text-xs font-mono text-stone-500">
          Showing: {activeTab === 'recommended' ? 'Prerequisite-Sequenced Sprint' : activeTab === 'official_syllabus' ? 'Taxonomic Subject Hierarchy' : 'Memory Retention & Retrieval Schedules'}
        </span>
      </div>

      {/* Tab 1: Nalanda Recommended Learning Path */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          {/* Explicit Pedagogy Disclaimer Banner */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 leading-relaxed">
              <strong className="font-semibold text-stone-900 block mb-0.5">
                Curricular Architecture Notice:
              </strong>
              The <strong>Nalanda Recommended Learning Order</strong> is sequenced by learning science specialists to prioritize prerequisite dependencies, progressive cognitive load, and high-frequency Tier-I scoring topics. It is designed for maximum pedagogical retention and does not represent or alter the official Staff Selection Commission test blueprint.
            </div>
          </div>

          {/* Sequential Units */}
          <div className="space-y-3">
            {units.map((u: any, idx: number) => {
              const isCompleted = idx < 4;
              const isCurrent = idx === 4;

              return (
                <Card
                  key={u.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isCurrent
                      ? 'ring-2 ring-amber-500/80 bg-amber-50/20'
                      : 'hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          Unit {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-stone-600">
                          {u.subject_name}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-mono text-stone-500">
                          Weightage: {u.weightage_percentage || 8}%
                        </span>
                        <Badge variant={isCompleted ? 'emerald' : isCurrent ? 'saffron' : 'stone'} size="sm">
                          {isCompleted ? 'Mastered' : isCurrent ? 'Active Unit' : 'Upcoming'}
                        </Badge>
                      </div>

                      <h3 className="text-base font-serif font-bold text-stone-900">
                        {u.topic_title}
                      </h3>

                      <p className="text-xs text-stone-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimated: {u.estimated_minutes} minutes</span>
                        <span>•</span>
                        <span>{u.is_core ? 'Core Essential' : 'Elective Enrichment'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/learn/${u.topic_id || 'topic-cgl-percentages'}`}>
                      <Button variant="outline" size="sm">
                        Read Topic
                      </Button>
                    </Link>
                    <Link href={`/learn/${u.topic_id || 'topic-cgl-percentages'}#practice`}>
                      <Button variant={isCurrent ? 'saffron' : 'secondary'} size="sm">
                        {isCompleted ? 'Review Drill' : 'Start Practice'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Official Syllabus Structure */}
      {activeTab === 'official_syllabus' && (
        <div className="space-y-6">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
            <span>
              Formal curriculum taxonomy organized strictly according to the official conducting body (Staff Selection Commission).
            </span>
            <span className="font-mono text-[11px] text-stone-500 font-semibold">
              4 Subjects • Tier-I & Tier-II Scope
            </span>
          </div>

          <SyllabusHierarchyTree
            subjects={subjects}
            onStartTopicTest={handleStartTest}
          />
        </div>
      )}

      {/* Subject-Wise Coverage Breakdown Section */}
      <div className="mt-12 space-y-4">
        <h3 className="font-serif font-bold text-stone-900 text-lg">
          Subject-Wise Syllabus Coverage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subj: any) => {
            const completed = subj.topics.filter((t: any) => t.user_status === 'studied' || t.user_status === 'mastered').length;
            const total = subj.topics.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={subj.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                    {subj.code}
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-700">
                    {pct}%
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900">{subj.name}</h4>
                  <span className="text-[11px] text-stone-500">
                    {completed} of {total} Topics Covered
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab 3: Spaced Repetition & Revision Queue */}
      {activeTab === 'revision_queue' && (
        <RevisionQueueHub />
      )}

      {/* Topic Assessment Modal */}
      {activeTest && (
        <TopicTestModal
          topicId={activeTest.topicId}
          topicTitle={activeTest.topicTitle}
          test={activeTest.test}
          isOpen={Boolean(activeTest)}
          onClose={() => setActiveTest(null)}
          onTestComplete={handleTestComplete}
        />
      )}
    </AppShell>
  );
}
