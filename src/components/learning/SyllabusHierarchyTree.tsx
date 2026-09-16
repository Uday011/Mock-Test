'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Award,
  Layers,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SubtopicNode {
  id: string;
  title: string;
  code?: string;
  order_index: number;
  estimated_study_hours: number;
  weightage_percentage: number;
  difficulty?: string;
  user_status?: string;
  user_mastery?: number;
}

interface TopicNode {
  id: string;
  title: string;
  code?: string;
  subject_id: string;
  order_index: number;
  estimated_study_hours: number;
  weightage_percentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
  resources_count: number;
  user_status: 'not_started' | 'in_progress' | 'studied' | 'mastered' | 'revision_due';
  user_mastery: number;
  revision_status: 'due' | 'up_to_date' | 'scheduled';
  next_revision_date?: string | null;
  prerequisite_nodes?: { id: string; title: string; status?: string }[];
  subtopics?: SubtopicNode[];
  topic_test?: { id: string; title: string; duration_seconds: number } | null;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  color_accent?: string;
  topics: TopicNode[];
}

interface SyllabusHierarchyTreeProps {
  subjects: SubjectItem[];
  onStartTopicTest?: (topicId: string, testId: string) => void;
  className?: string;
}

export function SyllabusHierarchyTree({
  subjects,
  onStartTopicTest,
  className = '',
}: SyllabusHierarchyTreeProps) {
  // Store expanded subjects and topics
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
    // Expand first subject by default
    const init: Record<string, boolean> = {};
    if (subjects.length > 0) init[subjects[0].id] = true;
    return init;
  });

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (subjects.length > 0 && subjects[0].topics.length > 0) {
      init[subjects[0].topics[0].id] = true;
    }
    return init;
  });

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const expandAll = () => {
    const allSubj: Record<string, boolean> = {};
    const allTop: Record<string, boolean> = {};
    subjects.forEach((s) => {
      allSubj[s.id] = true;
      s.topics.forEach((t) => {
        allTop[t.id] = true;
      });
    });
    setExpandedSubjects(allSubj);
    setExpandedTopics(allTop);
  };

  const collapseAll = () => {
    setExpandedSubjects({});
    setExpandedTopics({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Hierarchical Curriculum Navigator
          </span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-600">
            {subjects.length} Subjects, {subjects.reduce((acc, s) => acc + s.topics.length, 0)} Core Topics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-mono text-stone-600 hover:text-amber-700 underline px-1.5 py-0.5"
          >
            Expand All
          </button>
          <span className="text-stone-300">/</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-mono text-stone-600 hover:text-amber-700 underline px-1.5 py-0.5"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Subjects Tree */}
      <div className="space-y-3">
        {subjects.map((subj, subjIdx) => {
          const isSubjExpanded = Boolean(expandedSubjects[subj.id]);
          const masteredCount = subj.topics.filter((t) => t.user_status === 'mastered').length;
          const completedCount = subj.topics.filter((t) => t.user_status === 'studied' || t.user_status === 'mastered').length;
          const totalSubjTopics = subj.topics.length;
          const subjProgress = totalSubjTopics > 0 ? Math.round((completedCount / totalSubjTopics) * 100) : 0;

          return (
            <div
              key={subj.id}
              className="border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Subject Header Bar */}
              <div
                onClick={() => toggleSubject(subj.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 select-none bg-stone-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-stone-400 bg-stone-100 shrink-0">
                    {isSubjExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                        {subj.code || `SUBJ-${subjIdx + 1}`}
                      </span>
                      <h3 className="font-serif font-bold text-stone-900 text-base">
                        {subj.name}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {totalSubjTopics} Topics • {masteredCount} Mastered • {completedCount} Studied
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0">
                  <div className="w-28 text-right hidden sm:block">
                    <div className="text-[11px] font-mono font-bold text-stone-700">
                      {subjProgress}% Covered
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${subjProgress}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={subjProgress === 100 ? 'emerald' : subjProgress > 0 ? 'saffron' : 'stone'} size="sm">
                    {subjProgress === 100 ? 'Complete' : subjProgress > 0 ? `${subjProgress}% Progress` : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Topics Container */}
              {isSubjExpanded && (
                <div className="divide-y divide-stone-100 border-t border-stone-200">
                  {subj.topics.map((topic, tIdx) => {
                    const isTopicExpanded = Boolean(expandedTopics[topic.id]);
                    const subtopics = topic.subtopics || [];

                    return (
                      <div key={topic.id} className="p-4 pl-6 sm:pl-10 transition-colors">
                        {/* Topic Row */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleTopic(topic.id)}
                              className="mt-1 w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-stone-700 bg-stone-100 shrink-0"
                            >
                              {subtopics.length > 0 ? (
                                isTopicExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-stone-500 font-semibold">
                                  {topic.code || `${subj.code}-${tIdx + 1}`}
                                </span>
                                <span className="text-stone-300">•</span>
                                <Link
                                  href={`/learn/${topic.id}`}
                                  className="text-stone-900 font-serif font-bold text-sm hover:text-amber-700 transition-colors inline-flex items-center gap-1 group"
                                >
                                  {topic.title}
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
                                </Link>

                                {/* Status Pills */}
                                {topic.user_status === 'mastered' && (
                                  <Badge variant="emerald" size="sm" dot>
                                    Mastered ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'studied' && (
                                  <Badge variant="navy" size="sm">
                                    Studied ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'in_progress' && (
                                  <Badge variant="saffron" size="sm">
                                    In Progress ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'not_started' && (
                                  <Badge variant="stone" size="sm">
                                    Not Started
                                  </Badge>
                                )}

                                {/* Revision Status Pill */}
                                {topic.revision_status === 'due' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    <RotateCcw className="w-2.5 h-2.5" />
                                    Revision Due
                                  </span>
                                )}

                                {/* Difficulty Pill */}
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                                    topic.difficulty === 'hard'
                                      ? 'bg-rose-50 text-rose-700'
                                      : topic.difficulty === 'medium'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {topic.difficulty}
                                </span>
                              </div>

                              {/* Description snippet */}
                              {topic.description && (
                                <p className="text-xs text-stone-500 line-clamp-1">
                                  {topic.description}
                                </p>
                              )}

                              {/* Topic Metadata & Prerequisites */}
                              <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap pt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {topic.estimated_study_hours} hrs
                                </span>
                                <span>•</span>
                                <span className="font-mono">
                                  Weight: {topic.weightage_percentage}%
                                </span>
                                <span>•</span>
                                <span>
                                  {subtopics.length} Subtopics
                                </span>

                                {/* Prerequisites link */}
                                {topic.prerequisite_nodes && topic.prerequisite_nodes.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-stone-600">
                                      <span className="font-mono text-[10px] uppercase text-stone-400">Prereq:</span>
                                      {topic.prerequisite_nodes.map((p) => (
                                        <span
                                          key={p.id}
                                          className={`px-1 rounded text-[10px] ${
                                            p.status === 'mastered'
                                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                                          }`}
                                        >
                                          {p.title}
                                        </span>
                                      ))}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action CTAs */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                            <Link href={`/learn/${topic.id}`}>
                              <Button variant="outline" size="sm">
                                <BookOpen className="w-3.5 h-3.5 mr-1" />
                                Read Topic
                              </Button>
                            </Link>

                            <Link href={`/learn/${topic.id}#practice`}>
                              <Button variant="secondary" size="sm">
                                <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />
                                Practice
                              </Button>
                            </Link>

                            {topic.topic_test && (
                              <Button
                                variant={topic.user_status === 'mastered' ? 'outline' : 'saffron'}
                                size="sm"
                                onClick={() => {
                                  if (onStartTopicTest && topic.topic_test) {
                                    onStartTopicTest(topic.id, topic.topic_test.id);
                                  } else {
                                    window.location.href = `/learn/${topic.id}#assessment`;
                                  }
                                }}
                              >
                                <Award className="w-3.5 h-3.5 mr-1" />
                                {topic.user_status === 'mastered' ? 'Retest' : 'Topic Test'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Subtopics Hierarchy Level */}
                        {isTopicExpanded && subtopics.length > 0 && (
                          <div className="mt-3 pl-8 pr-2 py-2.5 bg-stone-50/70 border border-stone-200/80 rounded-lg space-y-2">
                            <div className="text-[10px] font-mono uppercase text-stone-400 font-bold flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              Structured Subtopics & Conceptual Units
                            </div>
                            <div className="space-y-1.5">
                              {subtopics.map((sub, sIdx) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between text-xs py-1 border-b border-stone-200/40 last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-stone-400">
                                      {sub.code || `${topic.code}.${sIdx + 1}`}
                                    </span>
                                    <span className="font-medium text-stone-800">
                                      {sub.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-stone-400 text-[11px] font-mono">
                                    <span>{sub.estimated_study_hours}h</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="capitalize">{sub.difficulty || 'Core'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
