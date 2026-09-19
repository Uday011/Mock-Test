'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Target,
  Layers,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Compass,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

function LearnContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const sectionParam = searchParams.get('section');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'pathways'>(
    tabParam === 'pathways' ? 'pathways' : 'syllabus'
  );

  const [treeData, setTreeData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  useEffect(() => {
    if (tabParam === 'pathways') {
      setActiveTab('pathways');
    } else {
      setActiveTab('syllabus');
    }
  }, [tabParam]);

  useEffect(() => {
    if (sectionParam && treeData?.subjects) {
      const match = treeData.subjects.find(
        (s: any) =>
          s.code?.toLowerCase() === sectionParam.toLowerCase() ||
          s.id?.toLowerCase() === sectionParam.toLowerCase()
      );
      if (match) {
        setSelectedSubjectId(match.id);
        setActiveTab('syllabus');
      }
    }
  }, [sectionParam, treeData]);

  useEffect(() => {
    Promise.all([
      fetch('/api/learn/tree').then((r) => r.json()),
      fetch('/api/dashboard/overview').then((r) => r.json()),
    ])
      .then(([treeRes, dashRes]) => {
        if (treeRes.success) setTreeData(treeRes);
        if (dashRes.success) setDashboardData(dashRes);
      })
      .catch((err) => console.error('Error fetching syllabus data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-[#787774] font-mono">
          Loading syllabus...
        </div>
      </AppShell>
    );
  }

  const exam = treeData?.exam || { title: 'CAT 2026' };
  const stats = treeData?.stats || {
    total_topics: 14,
    completed_topics: 6,
    mastered_topics: 3,
    completion_percentage: 42,
  };

  const subjects = treeData?.subjects || [];
  const learningPath = dashboardData?.learningPath;
  const units = learningPath?.units || [];

  const filteredSubjects = selectedSubjectId === 'all'
    ? subjects
    : subjects.filter((s: any) => s.id === selectedSubjectId);

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Learn' },
        { label: activeTab === 'pathways' ? 'Learning Pathways' : 'Syllabus' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Page Header */}
        <div className="border-b border-[#E6E6E3] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#787774] mb-1">
              <span>{exam.title}</span>
              <span>•</span>
              <span>Curriculum Structure</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
              {activeTab === 'pathways' ? 'Learning Pathways' : 'Syllabus'}
            </h1>
          </div>          {/* Navigation View Switcher (Syllabus vs Pathways) */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-[#EAEAE7] p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`py-2 px-3 rounded-lg font-semibold transition-all min-h-[38px] text-center ${
                activeTab === 'syllabus'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#787774] hover:text-[#202124]'
              }`}
            >
              Syllabus
            </button>
            <button
              onClick={() => setActiveTab('pathways')}
              className={`py-2 px-3 rounded-lg font-semibold transition-all min-h-[38px] text-center ${
                activeTab === 'pathways'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#787774] hover:text-[#202124]'
              }`}
            >
              Learning Pathways
            </button>
          </div>
        </div>

        {/* Overall Syllabus Progress Card */}
        <div className="bg-white border border-[#E6E6E3] rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[#787774]">Overall Syllabus Coverage</div>
            <div className="text-lg font-semibold text-[#202124] flex items-center gap-2">
              <span>{stats.completion_percentage}% Completed</span>
              <span className="text-xs font-normal text-[#787774]">
                ({stats.completed_topics} of {stats.total_topics} topics)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <ProgressBar value={stats.completion_percentage} max={100} size="sm" variant="indigo" />
          </div>
        </div>

        {/* View 1: Syllabus Tree (Subject -> Topic) */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            {/* Horizontal Swipeable Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 text-xs no-scrollbar select-none">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-all shrink-0 min-h-[38px] active:scale-95 ${
                  selectedSubjectId === 'all'
                    ? 'border-[#202124] bg-[#202124] text-white shadow-2xs'
                    : 'border-[#E6E6E3] bg-white text-[#787774] hover:text-[#202124]'
                }`}
              >
                All Subjects ({subjects.length})
              </button>
              {subjects.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-all shrink-0 min-h-[38px] active:scale-95 ${
                    selectedSubjectId === sub.id
                      ? 'border-[#202124] bg-[#202124] text-white shadow-2xs'
                      : 'border-[#E6E6E3] bg-white text-[#787774] hover:text-[#202124]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Subjects and Topics List */}
            <div className="space-y-5">
              {filteredSubjects.map((sub: any) => {
                const topics = sub.topics || [];
                const completedCount = topics.filter((t: any) => t.user_status === 'studied' || t.user_status === 'mastered').length;
                const subjectPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

                return (
                  <div key={sub.id} className="bg-white border border-[#E6E6E3] rounded-xl overflow-hidden shadow-2xs">
                    {/* Subject Header */}
                    <div className="p-4 bg-[#FBFBFA] border-b border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                          {sub.code}
                        </span>
                        <span className="text-sm font-semibold text-[#202124]">{sub.name}</span>
                        <span className="text-xs text-[#787774]">({topics.length} topics)</span>
                      </div>

                      <div className="text-xs font-mono text-[#787774]">
                        {completedCount}/{topics.length} completed ({subjectPercent}%)
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="divide-y divide-[#E6E6E3]">
                      {topics.map((t: any) => {
                        const state = t.canonical_state || (t.user_status === 'mastered' ? 'Strong' : t.user_status === 'studied' ? 'Learning' : 'Not Started');
                        const badgeVariant =
                          state === 'Strong' ? 'emerald' :
                          state === 'Needs Revision' ? 'amber' :
                          state === 'Practicing' ? 'indigo' :
                          state === 'Learning' ? 'blue' : 'gray';

                        return (
                          <div
                            key={t.id}
                            className="p-4 hover:bg-[#FBFBFA] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-[#787774]">
                                  {t.code}
                                </span>
                                <h4 className="font-semibold text-[#202124] text-sm">
                                  {t.title}
                                </h4>
                                <Badge
                                  variant={badgeVariant as any}
                                  size="sm"
                                  dot={state === 'Strong' || state === 'Needs Revision'}
                                >
                                  {state}
                                </Badge>
                              </div>
                              {t.description && (
                                <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed">
                                  {t.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F1EF]">
                              <span className="text-[11px] font-mono text-[#787774] text-center sm:text-right pr-1">
                                Weightage: {t.weightage_percentage}%
                              </span>

                              <Link href={`/learn/${t.id}`} className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold bg-white border border-[#E6E6E3] text-[#202124] hover:bg-[#F7F7F5] active:scale-[0.98] transition-all">
                                  <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
                                  <span>Study</span>
                                </button>
                              </Link>

                              <Link
                                href={`/question-bank?subject=${encodeURIComponent(sub.name)}&topic=${encodeURIComponent(t.title)}`}
                                className="w-full sm:w-auto"
                              >
                                <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg text-xs font-semibold bg-[#202124] hover:bg-[#37352F] text-white active:scale-[0.98] transition-all">
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>Practice</span>
                                </button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Learning Pathways */}
        {activeTab === 'pathways' && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg">
              <h3 className="text-sm font-semibold text-[#202124]">
                {learningPath?.title || 'CAT 2026 Strategic Blueprint'}
              </h3>
              <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                {learningPath?.description || 'Curated sequential study sprint balancing Quantitative Aptitude arithmetic, DILR matrix sets, and high-yield VARC Reading Comprehension.'}
              </p>
            </div>

            <div className="space-y-3">
              {units.map((u: any, idx: number) => (
                <div
                  key={u.id || idx}
                  className="p-4 bg-white border border-[#E6E6E3] rounded-lg flex items-center justify-between gap-4 hover:border-[#D4D4D1] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#F1F1EF] text-[#787774] font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#787774]">{u.subject_name}</span>
                        {u.weightage_percentage && (
                          <span className="text-[10px] font-mono text-[#787774]">
                            Weightage: {u.weightage_percentage}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#202124] truncate">
                        {u.topic_title}
                      </h4>
                    </div>
                  </div>

                  <Link href={`/learn/${u.topic_id}`}>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading syllabus...
          </div>
        </AppShell>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
