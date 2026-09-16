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
      {/* Pinned Exam Identity Capsule */}
      <div className="p-5 sm:p-6 mb-6 rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                {exam?.code || 'EXAM'}
              </span>
              <Badge variant="emerald" size="sm" dot>
                {exam?.category === 'government_job' ? 'Staff Selection' : exam?.category}
              </Badge>
              {exam?.conducting_body && (
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {exam.conducting_body}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {exam?.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              {exam?.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/tests">
              <Button variant="saffron" size="md">
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Start Diagnostic Drill
              </Button>
            </Link>
          </div>
        </div>

        {/* Exam At A Glance Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-stone-100 text-xs font-mono">
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-sans">Difficulty</span>
            <strong className="text-stone-900">{exam?.difficulty_level || 'National Level'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-sans">Total Marks</span>
            <strong className="text-stone-900">{exam?.total_marks} Marks</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-sans">Duration</span>
            <strong className="text-stone-900">{exam?.total_duration_minutes} Mins</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-sans">Target Session</span>
            <strong className="text-amber-800">{exam?.target_year} Session</strong>
          </div>
        </div>
      </div>

      {/* 7 Workspace Sections Tabs */}
      <Tabs
        tabs={workspaceTabs}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t)}
        className="mb-6"
      />

      {/* SECTION 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Examination Architecture & Stages
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                The {exam?.title} is administered in multiple sequential phases. Tier-I serves as the primary computer-based screening stage, while Tier-II determines the final merit ranking.
              </p>

              <div className="space-y-3 pt-2">
                {stages.map((st: any) => (
                  <div key={st.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900">{st.name}</span>
                      <Badge variant="saffron" size="sm">Stage {st.stage_number}</Badge>
                    </div>
                    <p className="text-[11px] text-stone-600">{st.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-stone-500">
                      <span>Questions: {st.total_questions}</span>
                      <span>•</span>
                      <span>Marks: {st.total_marks}</span>
                      <span>•</span>
                      <span>Duration: {st.duration_minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Marking Scheme & Qualifying Cutoffs
              </h3>
              <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-1">
                  <span className="font-semibold text-stone-800 block">Tier-I Objective Marking:</span>
                  <div className="grid grid-cols-2 gap-2 text-stone-700 font-mono text-[11px] pt-1">
                    <div className="text-emerald-700 font-bold">+2.0 Marks per Correct</div>
                    <div className="text-rose-700 font-bold">-0.50 Negative Marking</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-1">
                  <span className="font-semibold text-stone-800 block">Cutoff Benchmarks (General / UR):</span>
                  <p className="text-[11px] text-stone-500">
                    Previous cycle Tier-I qualifying cutoff settled around <strong>138.0 to 142.0</strong> marks out of 200. Aspirants targeting administrative Group B posts should benchmark for 160+.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/learn">
                    <Button variant="secondary" size="sm" className="w-full">
                      View 60-Day Strategic Roadmap →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 2: SYLLABUS TREE */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Stage Selector */}
          {stages.length > 1 && (
            <div className="p-1.5 bg-stone-100 rounded-xl inline-flex gap-1 border border-stone-200/80">
              {stages.map((stage: any) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeStageId === stage.id
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          )}

          {/* Subject Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedSubjectId === 'all'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              All Subjects ({nodes.length})
            </button>

            {subjects.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedSubjectId === s.id
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Syllabus List */}
          <div className="space-y-3">
            {filteredNodes.map((node: any) => {
              const prereqs = node.prerequisite_ids_json ? JSON.parse(node.prerequisite_ids_json) : [];
              const topicResources = resources.filter((r: any) => r.topic_id === node.id);

              return (
                <Card
                  key={node.id}
                  className="p-5 hover:border-stone-300 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {node.code}
                      </span>
                      <span className="text-xs font-semibold text-stone-600">
                        {node.subject_name}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-mono text-stone-500">
                        Weightage: <strong className="text-stone-800">{node.weightage_percentage}%</strong>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-mono text-stone-500">
                        {node.estimated_study_hours} hrs
                      </span>
                      {getStatusBadge(node.user_status, node.mastery_percentage || 0)}
                    </div>

                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {node.title}
                    </h3>

                    <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
                      {node.description}
                    </p>

                    {prereqs.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 flex-wrap">
                        <span className="font-medium text-stone-400">Prerequisites:</span>
                        {prereqs.map((pr: string) => (
                          <span
                            key={pr}
                            className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-mono border border-stone-200"
                          >
                            {pr.replace('topic-cgl-', '').replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
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
                    <Link href="/tests">
                      <Button variant="secondary" size="sm">
                        Practice Drill
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: LEARNING PATH */}
      {activeTab === 'learning_path' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">SSC CGL 60-Day Strategic Master Plan</h3>
              <p className="text-xs text-stone-500 mt-0.5">Sequenced units balancing high-yield arithmetic, reasoning, and constitutional governance.</p>
            </div>
            <Link href="/learn">
              <Button variant="saffron" size="sm">Open Full Sprint Workspace →</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nodes.slice(0, 6).map((n: any, idx: number) => (
              <div key={n.id} className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{n.title}</div>
                    <div className="text-[11px] text-stone-500">{n.subject_name} • {n.estimated_study_hours} hrs</div>
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
          <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-3">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Topic-Level Practice & Speed Drills
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
              10-minute micro-drills focusing on precision, mental arithmetic shortcuts, and rule recall without the fatigue of a full mock exam.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              {subjects.map((s: any) => (
                <div key={s.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {s.code}
                  </span>
                  <div className="text-xs font-bold text-stone-900">{s.name}</div>
                  <p className="text-[11px] text-stone-500">15 Questions • 12 Mins</p>
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
          <Card className="p-5 bg-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Official CBE Diagnostic Mock
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900 mt-1">
                  SSC CGL 2026 Tier-I All India Diagnostic Mock 01
                </h3>
              </div>
              <Badge variant="emerald" size="sm">Standard TCS Pattern</Badge>
            </div>

            <p className="text-xs text-stone-600">
              Full-length 100 questions screening exam across Quant, Reasoning, English, and General Awareness (+2.0 / -0.50 marks, 60 minutes).
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 flex-wrap gap-3">
              <div className="text-xs text-stone-500 font-mono">
                Recent Student Score: <strong className="text-stone-900">142 / 200</strong> (78.5% Accuracy)
              </div>
              <Link href="/tests">
                <Button variant="saffron" size="sm">
                  Attempt / Retake Mock
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 6: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card className="p-6 bg-white space-y-3">
            <h3 className="text-base font-serif font-bold text-stone-900">Cutoff Clearance Trajectory</h3>
            <p className="text-xs text-stone-500">Your predicted performance against previous years Staff Selection cutoffs</p>
            <ProgressBar value={142} max={200} label="Current Predicted Level: 142 / 200 (Cutoff Bar: 138)" size="md" variant="saffron" />
            <div className="pt-2 text-right">
              <Link href="/performance" className="text-xs text-amber-700 font-semibold hover:underline">
                Open Full Readiness Analytics →
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 7: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res: any) => (
              <Card key={res.id} className="p-5 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{res.title}</span>
                  <Badge variant="saffron" size="sm">
                    {res.resource_type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {res.content_summary}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>Reading Time: {res.estimated_read_minutes} mins</span>
                  <button
                    onClick={() => setSelectedTopic({ title: res.title, description: res.content_summary, resources: [res] })}
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    View Resource →
                  </button>
                </div>
              </Card>
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
    </AppShell>
  );
}
