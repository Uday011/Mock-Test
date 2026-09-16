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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

export default function ExamWorkspacePage() {
  const params = useParams();
  const examId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <AppShell
      activeExamTitle={exam?.title}
      breadcrumbs={[
        { label: 'Exams', href: '/exams' },
        { label: exam?.title || 'Exam Workspace' },
      ]}
    >
      <PageHeader
        title={exam?.title || 'Exam Syllabus Blueprint'}
        description={exam?.description}
        badge={<Badge variant="saffron" size="md">Curricular Framework</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn">
              <Button variant="secondary" size="sm">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Open Learning Path
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="saffron" size="sm">
                <Zap className="w-4 h-4 mr-1.5" />
                Practice Tests
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stage Selector Tabs */}
      {stages.length > 1 && (
        <div className="mb-6 p-1.5 bg-stone-100 rounded-xl inline-flex gap-1 border border-stone-200/80">
          {stages.map((stage: any) => (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
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

      {/* Stage Metadata Banner */}
      {activeStage && (
        <div className="p-4 mb-6 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Stage {activeStage.stage_number}
              </span>
              <h3 className="text-sm font-serif font-bold text-stone-900">{activeStage.name}</h3>
            </div>
            <p className="text-xs text-stone-600 max-w-2xl">{activeStage.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-stone-600 shrink-0">
            <div>
              <span className="text-[10px] text-stone-400 block uppercase">Marks</span>
              <strong className="text-stone-900">{activeStage.total_marks}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block uppercase">Questions</span>
              <strong className="text-stone-900">{activeStage.total_questions}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block uppercase">Duration</span>
              <strong className="text-stone-900">{activeStage.duration_minutes}m</strong>
            </div>
          </div>
        </div>
      )}

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
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
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedSubjectId === s.id
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Syllabus Nodes Grid */}
      <div className="space-y-4">
        {filteredNodes.map((node: any) => {
          const prereqs = node.prerequisite_ids_json
            ? JSON.parse(node.prerequisite_ids_json)
            : [];
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
                  <span className="text-xs font-semibold text-stone-500">
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

                {/* Prerequisites tags */}
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

              {/* Action Slots */}
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

      {/* Topic Resource Modal */}
      {selectedTopic && (
        <Modal
          isOpen={Boolean(selectedTopic)}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.title}
          description={`${selectedTopic.subject_name} (${selectedTopic.code}) • High-yield pedagogical digest`}
        >
          <div className="space-y-4">
            <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200">
              {selectedTopic.description}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
                Available Study Resources
              </h4>
              {selectedTopic.resources?.map((res: any) => (
                <div
                  key={res.id}
                  className="p-3.5 border border-stone-200 rounded-lg bg-white space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{res.title}</span>
                    <Badge variant="saffron" size="sm">
                      {res.resource_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {res.content_summary}
                  </p>
                  <div className="text-[10px] font-mono text-stone-400">
                    Est. Reading Time: {res.estimated_read_minutes} mins
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
