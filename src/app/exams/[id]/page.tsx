'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ChevronRight,
  Target,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  Play,
  TrendingUp,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { MetricCallout } from '@/components/ui/MetricCallout';

export default function ExamWorkspacePage() {
  const params = useParams();
  const examId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeStageId, setActiveStageId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          if (resData.stages && resData.stages.length > 0) {
            setActiveStageId(resData.stages[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-stone-500 font-mono">
          Loading Curricular Syllabus Blueprint...
        </div>
      </AppShell>
    );
  }

  const exam = data?.exam;
  const stages = data?.stages || [];
  const subjects = data?.subjects || [];
  const nodes = data?.syllabusNodes || [];
  const resources = data?.resources || [];

  const filteredNodes = nodes.filter((n: any) => {
    if (selectedSubjectId !== 'all' && n.subject_id !== selectedSubjectId) return false;
    return true;
  });

  const getStatusBadge = (status: string, mastery: number) => {
    switch (status) {
      case 'mastered':
        return <Badge variant="emerald" size="sm" dot>Mastered ({mastery}%)</Badge>;
      case 'in_progress':
        return <Badge variant="saffron" size="sm" dot>In Progress ({mastery}%)</Badge>;
      case 'needs_focus':
        return <Badge variant="rose" size="sm" dot>Needs Focus ({mastery}%)</Badge>;
      default:
        return <Badge variant="stone" size="sm">Not Started</Badge>;
    }
  };

  const activeStage = stages.find((s: any) => s.id === activeStageId) || stages[0];

  const workspaceTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'syllabus', label: 'Syllabus Tree', count: nodes.length },
    { id: 'learning_path', label: 'Learning Path' },
    { id: 'practice', label: 'Practice Drills' },
    { id: 'mock_tests', label: 'Mock Tests' },
    { id: 'performance', label: 'Readiness Analytics' },
    { id: 'resources', label: 'Study Resources', count: resources.length },
  ];

  return (
    <AppShell
      activeExamTitle={exam?.title}
      breadcrumbs={[
        { label: 'Exams Directory', href: '/exams' },
        { label: exam?.title || 'Exam Workspace' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Compass}
          title={exam?.title || 'Exam Workspace'}
          description={exam?.description}
          badge={
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-medium px-1.5 py-0.5 rounded bg-[#f1f1ef] text-[#202124]">
                {exam?.code || 'EXAM'}
              </span>
              <Badge variant="emerald" size="sm" dot>
                {exam?.category === 'government_job' ? 'Staff Selection' : exam?.category}
              </Badge>
              {exam?.conducting_body && (
                <span className="text-xs text-[#787774] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B5E20]" />
                  {exam.conducting_body}
                </span>
              )}
            </div>
          }
          actions={
            <Link href="/tests">
              <Button variant="primary" size="sm">
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Start Diagnostic Drill
              </Button>
            </Link>
          }
        >
          {/* Exam Specs Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3]">
              <span className="text-[10px] text-[#9b9a97] uppercase block font-sans">Difficulty</span>
              <strong className="text-[#202124]">{exam?.difficulty_level || 'National Level'}</strong>
            </div>
            <div className="p-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3]">
              <span className="text-[10px] text-[#9b9a97] uppercase block font-sans">Total Marks</span>
              <strong className="text-[#202124]">{exam?.total_marks} Marks</strong>
            </div>
            <div className="p-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3]">
              <span className="text-[10px] text-[#9b9a97] uppercase block font-sans">Duration</span>
              <strong className="text-[#202124]">{exam?.total_duration_minutes} Mins</strong>
            </div>
            <div className="p-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3]">
              <span className="text-[10px] text-[#9b9a97] uppercase block font-sans">Target Session</span>
              <strong className="text-[#B7791F]">{exam?.target_year} Session</strong>
            </div>
          </div>
        </PageHeader>

        {/* 7 Workspace Sections Tabs */}
        <div className="flex border-b border-[#E6E6E3] overflow-x-auto no-scrollbar gap-1">
          {workspaceTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'border-[#202124] text-[#202124]'
                  : 'border-transparent text-[#787774] hover:text-[#202124]'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] font-mono px-1 rounded ${
                  activeTab === t.id ? 'bg-[#f1f1ef] text-[#202124]' : 'text-[#9b9a97]'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

      {/* SECTION 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3.5">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#B7791F]" />
                Examination Architecture & Stages
              </h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                The {exam?.title} is administered in multiple sequential phases. Tier-I serves as the primary computer-based screening stage, while Tier-II determines the final merit ranking.
              </p>

              <div className="space-y-2.5 pt-1">
                {stages.map((st: any) => (
                  <div key={st.id} className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#202124]">{st.name}</span>
                      <Badge variant="saffron" size="sm">Stage {st.stage_number}</Badge>
                    </div>
                    <p className="text-[11px] text-[#787774]">{st.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-[#9b9a97]">
                      <span>Questions: {st.total_questions}</span>
                      <span>•</span>
                      <span>Marks: {st.total_marks}</span>
                      <span>•</span>
                      <span>Duration: {st.duration_minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3.5">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                Marking Scheme & Qualifying Cutoffs
              </h3>
              <div className="space-y-3 text-xs text-[#787774] leading-relaxed">
                <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                  <span className="font-semibold text-[#202124] block">Tier-I Objective Marking:</span>
                  <div className="grid grid-cols-2 gap-2 text-[#202124] font-mono text-[11px] pt-1">
                    <div className="text-[#1B5E20] font-semibold">+2.0 Marks per Correct</div>
                    <div className="text-[#C53030] font-semibold">-0.50 Negative Marking</div>
                  </div>
                </div>

                <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                  <span className="font-semibold text-[#202124] block">Cutoff Benchmarks (General / UR):</span>
                  <p className="text-[11px] text-[#787774]">
                    Previous cycle Tier-I qualifying cutoff settled around <strong>138.0 to 142.0</strong> marks out of 200. Aspirants targeting administrative Group B posts should benchmark for 160+.
                  </p>
                </div>

                <div className="pt-1">
                  <Link href="/learn">
                    <Button variant="secondary" size="sm" className="w-full">
                      View 60-Day Strategic Roadmap →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SYLLABUS TREE */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Stage Selector */}
          {stages.length > 1 && (
            <div className="p-1 bg-[#f1f1ef] rounded-md inline-flex gap-1 border border-[#E6E6E3]">
              {stages.map((stage: any) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    activeStageId === stage.id
                      ? 'bg-white text-[#202124] shadow-xs'
                      : 'text-[#787774] hover:text-[#202124]'
                  }`}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          )}

          {/* Subject Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedSubjectId === 'all'
                  ? 'bg-[#202124] text-white font-medium'
                  : 'bg-white border border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
              }`}
            >
              All Subjects ({nodes.length})
            </button>

            {subjects.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  selectedSubjectId === s.id
                    ? 'bg-[#202124] text-white font-medium'
                    : 'bg-white border border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
                }`}
              >
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Syllabus List */}
          <div className="space-y-2.5">
            {filteredNodes.map((node: any) => {
              const prereqs = node.prerequisite_ids_json ? JSON.parse(node.prerequisite_ids_json) : [];
              const topicResources = resources.filter((r: any) => r.topic_id === node.id);

              return (
                <div
                  key={node.id}
                  className="p-4 rounded-lg border border-[#E6E6E3] hover:border-[#d4d4d4] transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#f1f1ef] text-[#202124]">
                        {node.code}
                      </span>
                      <span className="text-xs font-medium text-[#202124]">
                        {node.subject_name}
                      </span>
                      <span className="text-[#E6E6E3]">•</span>
                      <span className="text-xs font-mono text-[#787774]">
                        Weightage: <strong className="text-[#202124] font-semibold">{node.weightage_percentage}%</strong>
                      </span>
                      <span className="text-[#E6E6E3]">•</span>
                      <span className="text-xs font-mono text-[#787774]">
                        {node.estimated_study_hours} hrs
                      </span>
                      {getStatusBadge(node.user_status, node.mastery_percentage || 0)}
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-[#202124]">
                      {node.title}
                    </h3>

                    <p className="text-xs text-[#787774] max-w-3xl leading-relaxed">
                      {node.description}
                    </p>

                    {prereqs.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#787774] flex-wrap">
                        <span className="text-[#9b9a97]">Prerequisites:</span>
                        {prereqs.map((pr: string) => (
                          <span
                            key={pr}
                            className="px-1.5 py-0.5 bg-[#F1F1EF] text-[#202124] rounded text-[10px] font-mono border border-[#E6E6E3]"
                          >
                            {pr.replace('topic-cgl-', '').replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    <Link href={`/learn/${node.id}`}>
                      <Button variant="secondary" size="sm">
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Read Topic
                      </Button>
                    </Link>

                    {topicResources.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTopic({ ...node, resources: topicResources })}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Resources ({topicResources.length})
                      </Button>
                    )}

                    <Link href={`/learn/${node.id}#practice`}>
                      <Button variant="secondary" size="sm">
                        Practice
                      </Button>
                    </Link>

                    <Link href={`/learn/${node.id}#assessment`}>
                      <Button variant="primary" size="sm">
                        Topic Test
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: LEARNING PATH */}
      {activeTab === 'learning_path' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#202124]">SSC CGL 60-Day Strategic Master Plan</h3>
              <p className="text-xs text-[#787774] mt-0.5">Sequenced units balancing high-yield arithmetic, reasoning, and constitutional governance.</p>
            </div>
            <Link href="/learn">
              <Button variant="primary" size="sm">Open Sprint Workspace →</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nodes.slice(0, 6).map((n: any, idx: number) => (
              <div key={n.id} className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#f1f1ef] text-[#202124] flex items-center justify-center text-xs font-mono font-medium">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#202124]">{n.title}</div>
                    <div className="text-[11px] text-[#787774]">{n.subject_name} • {n.estimated_study_hours} hrs</div>
                  </div>
                </div>
                <Badge variant={idx < 3 ? 'emerald' : 'stone'} size="sm">
                  {idx < 3 ? 'Mastered' : 'Upcoming'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PRACTICE DRILLS */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-[#202124]">
              Topic-Level Practice & Speed Drills
            </h3>
            <p className="text-xs text-[#787774] leading-relaxed max-w-2xl">
              10-minute micro-drills focusing on precision, mental arithmetic shortcuts, and rule recall without the fatigue of a full mock exam.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {subjects.map((s: any) => (
                <div key={s.id} className="p-3.5 rounded-lg border border-[#E6E6E3] bg-[#F7F7F5] space-y-2">
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#f1f1ef] text-[#202124]">
                    {s.code}
                  </span>
                  <div className="text-xs font-semibold text-[#202124]">{s.name}</div>
                  <p className="text-[11px] text-[#787774]">15 Questions • 12 Mins</p>
                  <Link href="/tests" className="block pt-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Start Drill
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: MOCK TESTS */}
      {activeTab === 'mock_tests' && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#8f6b10]">
                  Official CBE Diagnostic Mock
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-[#202124] mt-1">
                  SSC CGL 2026 Tier-I All India Diagnostic Mock 01
                </h3>
              </div>
              <Badge variant="emerald" size="sm">Standard TCS Pattern</Badge>
            </div>

            <p className="text-xs text-[#787774]">
              Full-length 100 questions screening exam across Quant, Reasoning, English, and General Awareness (+2.0 / -0.50 marks, 60 minutes).
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-[#E6E6E3] flex-wrap gap-3">
              <div className="text-xs text-[#787774] font-mono">
                Recent Student Score: <strong className="text-[#202124]">142 / 200</strong> (78.5% Accuracy)
              </div>
              <Link href="/tests">
                <Button variant="primary" size="sm">
                  Attempt / Retake Mock
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCallout
              label="Predicted Tier-I Score"
              value="142"
              max={200}
              subtext="Cutoff benchmark ~138"
              accent="saffron"
            />
            <MetricCallout
              label="Diagnostic Accuracy"
              value="78.5%"
              subtext="420 Qs practiced"
              accent="emerald"
            />
            <MetricCallout
              label="Syllabus Mastered"
              value="42%"
              subtext="6 of 14 modules"
              accent="navy"
            />
            <MetricCallout
              label="Cadence Pacing"
              value="52s"
              subtext="Per question average"
              accent="stone"
            />
          </div>

          <div className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-[#202124]">Cutoff Clearance Trajectory</h3>
            <p className="text-xs text-[#787774]">Your predicted performance against previous years Staff Selection cutoffs</p>
            <ProgressBar value={142} max={200} label="Current Predicted Level: 142 / 200 (Cutoff Bar: 138)" size="md" variant="saffron" />
            <div className="pt-2 text-right">
              <Link href="/performance" className="text-xs text-[#202124] font-medium hover:underline">
                Open Full Readiness Analytics →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((res: any) => (
              <div key={res.id} className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#202124]">{res.title}</span>
                  <Badge variant="saffron" size="sm">
                    {res.resource_type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-[#787774] leading-relaxed">
                  {res.content_summary}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#9b9a97] font-mono">
                  <span>Reading Time: {res.estimated_read_minutes} mins</span>
                  <button
                    onClick={() => setSelectedTopic({ title: res.title, description: res.content_summary, resources: [res] })}
                    className="text-[#202124] font-medium hover:underline"
                  >
                    View Resource →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {selectedTopic && (
        <Modal
          isOpen={Boolean(selectedTopic)}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.title}
          description="High-yield pedagogical digest"
        >
          <div className="space-y-4">
            <p className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-lg border border-stone-200 leading-relaxed">
              {selectedTopic.description}
            </p>
            <div className="text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedTopic(null)}>
                Close Digest
              </Button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </AppShell>
  );
}
