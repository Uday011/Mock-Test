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
  Flame,
  Target,
  Compass,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CalloutBlock } from '@/components/ui/CalloutBlock';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';
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
    fetch('/api/learn/tree')
      .then((r) => r.json())
      .then((treeRes) => {
        if (treeRes.success) setTreeData(treeRes);
      });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-[#787774] font-mono">
          Loading curriculum...
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
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={BookOpen}
          title={`${exam.title} Learning System`}
          description="Curriculum connecting official syllabus structures, pedagogical pathways, active recall checkpoints, and assessments."
          badge={<Badge variant="blue" size="sm">Adaptive Engine</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/exams/exam-ssc-cgl-2026">
                <Button variant="outline" size="sm">
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                  Exam Blueprint
                </Button>
              </Link>
              <Link href="/tests">
                <Button variant="primary" size="sm">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Sectional Drills
                </Button>
              </Link>
            </div>
          }
        />

        {/* Top Properties / Stat Tiles */}
        <div className="bg-white border border-[#ebebeb] rounded-lg p-4">
          <PropertyTable>
            <PropertyRow icon={Target} label="Curriculum Stage">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#37352f]">Arithmetic & Logic Foundations</span>
                <Badge variant="gray" size="sm">Sprint 1</Badge>
              </div>
            </PropertyRow>

            <PropertyRow icon={BookOpen} label="Syllabus Coverage">
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="font-mono text-xs font-semibold text-[#37352f]">
                  {stats.completion_percentage}%
                </span>
                <div className="flex-1">
                  <ProgressBar value={stats.completion_percentage} max={100} size="sm" variant="emerald" />
                </div>
                <span className="text-[11px] text-[#787774] font-mono">
                  {stats.completed_topics} / {stats.total_topics} topics ({stats.mastered_topics} mastered)
                </span>
              </div>
            </PropertyRow>

            <PropertyRow icon={RotateCcw} label="Active Recall Due">
              <div className="flex items-center gap-2">
                <Badge variant={stats.revision_due_count > 0 ? 'rose' : 'emerald'} size="sm">
                  {stats.revision_due_count} topics due today
                </Badge>
                {stats.revision_due_count > 0 && (
                  <span className="text-xs text-[#787774]">
                    Retrieval schedule due before memory decay
                  </span>
                )}
              </div>
            </PropertyRow>

            <PropertyRow icon={Flame} label="Consistency Streak">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-[#37352f]">4 Days Active</span>
                <span className="text-[#787774]">(14.5 hours focused study logged this week)</span>
              </div>
            </PropertyRow>
          </PropertyTable>
        </div>

        {/* Active Resume Callout */}
        <CalloutBlock
          icon={BookOpen}
          variant="amber"
          title="Resume Current Topic: Percentages, Profit, Loss & Discount"
          action={
            <Link href="/learn/topic-cgl-percentages">
              <Button variant="primary" size="sm">
                Resume Topic
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-1.5">
            <p className="text-xs text-[#37352f] leading-relaxed">
              Quantitative Aptitude • Reciprocal fractional multipliers, marked price golden ratio, and false weight calculation traps.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#787774] pt-1">
              <span>Progress: 74% (Studied)</span>
              <span>•</span>
              <span>Est. Remaining: 25 mins</span>
              <span>•</span>
              <Link href="/learn/topic-cgl-percentages#assessment" className="text-[#37352f] hover:underline font-medium">
                Take Topic Test →
              </Link>
            </div>
          </div>
        </CalloutBlock>

        {/* Spaced Repetition Alert if Revision Due */}
        {revisionTopics.length > 0 && (
          <CalloutBlock
            icon={RotateCcw}
            variant="rose"
            title={`Active Recall Revision Due (${revisionTopics.length} Topics)`}
          >
            <div className="space-y-2">
              <p className="text-xs text-[#37352f] leading-relaxed">
                Learning science requires periodic retrieval before memory decay sets in. Review these concepts:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {revisionTopics.map((rt) => (
                  <Link key={rt.id} href={`/learn/${rt.id}`}>
                    <Button variant="outline" size="sm" className="bg-white hover:bg-[#fbfbfa]">
                      {rt.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CalloutBlock>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2 flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('recommended')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'recommended'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white text-[#787774] hover:bg-[#f7f6f3] border border-[#ebebeb]'
              }`}
            >
              Recommended Learning Order
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('official_syllabus')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'official_syllabus'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white text-[#787774] hover:bg-[#f7f6f3] border border-[#ebebeb]'
              }`}
            >
              Official Syllabus Structure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('revision_queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'revision_queue'
                  ? 'bg-[#37352f] text-white'
                  : 'bg-white text-[#787774] hover:bg-[#f7f6f3] border border-[#ebebeb]'
              }`}
            >
              Spaced Repetition & Revision Queue
            </button>
          </div>

          <span className="text-xs font-mono text-[#9b9a97]">
            {activeTab === 'recommended' ? 'Prerequisite-Sequenced' : activeTab === 'official_syllabus' ? 'Taxonomic Hierarchy' : 'Retrieval Schedules'}
          </span>
        </div>

        {/* Tab 1: Recommended Learning Path */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            <CalloutBlock
              icon={ShieldAlert}
              variant="neutral"
              title="Curricular Architecture Notice"
            >
              <p className="text-xs text-[#787774] leading-relaxed">
                The <strong>Recommended Learning Order</strong> is sequenced to prioritize prerequisite dependencies, progressive cognitive load, and high-frequency Tier-I scoring topics. It is designed for maximum pedagogical retention and does not alter the official test blueprint.
              </p>
            </CalloutBlock>

            {/* Sequential Units */}
            <div className="divide-y divide-[#ebebeb] border border-[#ebebeb] rounded-lg bg-white overflow-hidden">
              {units.map((u: any, idx: number) => {
                const isCompleted = idx < 4;
                const isCurrent = idx === 4;

                return (
                  <div
                    key={u.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      isCurrent ? 'bg-[#fbfbfa]' : 'hover:bg-[#fbfbfa]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center font-mono font-medium text-xs shrink-0 border ${
                          isCompleted
                            ? 'bg-[#ebf5e8] text-[#2b593f] border-[#c4e2b8]'
                            : isCurrent
                            ? 'bg-[#fdf5e8] text-[#8f4f00] border-[#fae2be]'
                            : 'bg-[#f7f6f3] text-[#787774] border-[#ebebeb]'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]">
                            Unit {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-[#787774]">
                            {u.subject_name}
                          </span>
                          <span className="text-[#ebebeb]">•</span>
                          <span className="text-xs font-mono text-[#9b9a97]">
                            Weightage: {u.weightage_percentage || 8}%
                          </span>
                          <Badge variant={isCompleted ? 'emerald' : isCurrent ? 'amber' : 'gray'} size="sm">
                            {isCompleted ? 'Mastered' : isCurrent ? 'Active Unit' : 'Upcoming'}
                          </Badge>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-[#37352f]">
                          {u.topic_title}
                        </h3>

                        <p className="text-xs text-[#787774] flex items-center gap-2">
                          <Clock className="w-3 h-3 text-[#9b9a97]" />
                          <span>Estimated: {u.estimated_minutes} mins</span>
                          <span>•</span>
                          <span>{u.is_core ? 'Core Essential' : 'Elective'}</span>
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
                        <Button variant={isCurrent ? 'primary' : 'secondary'} size="sm">
                          {isCompleted ? 'Review Drill' : 'Start Practice'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Official Syllabus Structure */}
        {activeTab === 'official_syllabus' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#fbfbfa] border border-[#ebebeb] rounded-lg text-xs text-[#787774] flex items-center justify-between">
              <span>
                Formal curriculum taxonomy organized strictly according to the official conducting body.
              </span>
              <span className="font-mono text-[11px] font-medium text-[#37352f]">
                4 Subjects • Tier-I & Tier-II Scope
              </span>
            </div>

            <SyllabusHierarchyTree
              subjects={subjects}
              onStartTopicTest={handleStartTest}
            />
          </div>
        )}

        {/* Tab 3: Spaced Repetition & Revision Queue */}
        {activeTab === 'revision_queue' && (
          <RevisionQueueHub />
        )}

        {/* Subject-Wise Coverage Breakdown Section */}
        <div className="space-y-3 pt-4">
          <h3 className="font-semibold text-[#37352f] text-sm">
            Subject-Wise Syllabus Coverage
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((subj: any) => {
              const completed = subj.topics.filter((t: any) => t.user_status === 'studied' || t.user_status === 'mastered').length;
              const total = subj.topics.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={subj.id} className="p-3.5 bg-white border border-[#ebebeb] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]">
                      {subj.code}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#37352f]">
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-xs text-[#37352f]">{subj.name}</h4>
                    <span className="text-[11px] text-[#787774]">
                      {completed} of {total} Topics Covered
                    </span>
                  </div>
                  <ProgressBar value={pct} max={100} size="sm" variant="emerald" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
