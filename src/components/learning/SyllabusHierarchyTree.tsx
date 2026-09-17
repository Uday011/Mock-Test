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
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
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
    <div className={`space-y-3 ${className}`}>
      {/* Controls Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#787774] font-medium">
            Curriculum Hierarchy
          </span>
          <span className="text-xs text-[#9b9a97]">•</span>
          <span className="text-xs text-[#787774]">
            {subjects.length} Subjects, {subjects.reduce((acc, s) => acc + s.topics.length, 0)} Topics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-[#787774] hover:text-[#37352f] underline px-1 py-0.5"
          >
            Expand All
          </button>
          <span className="text-[#ebebeb]">/</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-[#787774] hover:text-[#37352f] underline px-1 py-0.5"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Subjects Tree */}
      <div className="space-y-2.5">
        {subjects.map((subj, subjIdx) => {
          const isSubjExpanded = Boolean(expandedSubjects[subj.id]);
          const masteredCount = subj.topics.filter((t) => t.user_status === 'mastered').length;
          const completedCount = subj.topics.filter((t) => t.user_status === 'studied' || t.user_status === 'mastered').length;
          const totalSubjTopics = subj.topics.length;
          const subjProgress = totalSubjTopics > 0 ? Math.round((completedCount / totalSubjTopics) * 100) : 0;

          return (
            <div
              key={subj.id}
              className="border border-[#ebebeb] bg-white rounded-lg overflow-hidden transition-all"
            >
              {/* Subject Header Bar */}
              <div
                onClick={() => toggleSubject(subj.id)}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#fbfbfa] select-none bg-[#fbfbfa]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[#787774] bg-[#f7f6f3] shrink-0">
                    {isSubjExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]">
                        {subj.code || `SUBJ-${subjIdx + 1}`}
                      </span>
                      <h3 className="font-semibold text-[#37352f] text-sm">
                        {subj.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#787774] mt-0.5">
                      {totalSubjTopics} Topics • {masteredCount} Mastered • {completedCount} Studied
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="w-24 text-right hidden sm:block">
                    <div className="text-[11px] font-mono text-[#787774]">
                      {subjProgress}% Covered
                    </div>
                    <div className="w-full bg-[#f7f6f3] h-1.5 rounded-full overflow-hidden mt-1 border border-[#ebebeb]">
                      <div
                        className="bg-[#37352f] h-full rounded-full transition-all"
                        style={{ width: `${subjProgress}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={subjProgress === 100 ? 'emerald' : subjProgress > 0 ? 'blue' : 'gray'} size="sm">
                    {subjProgress === 100 ? 'Complete' : subjProgress > 0 ? `${subjProgress}%` : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Topics Container */}
              {isSubjExpanded && (
                <div className="divide-y divide-[#ebebeb] border-t border-[#ebebeb]">
                  {subj.topics.map((topic, tIdx) => {
                    const isTopicExpanded = Boolean(expandedTopics[topic.id]);
                    const subtopics = topic.subtopics || [];

                    return (
                      <div key={topic.id} className="p-3.5 pl-6 sm:pl-9 transition-colors">
                        {/* Topic Row */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleTopic(topic.id)}
                              className="mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[#787774] hover:text-[#37352f] bg-[#f7f6f3] shrink-0"
                            >
                              {subtopics.length > 0 ? (
                                isTopicExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4d4d4]" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-[#787774]">
                                  {topic.code || `${subj.code}-${tIdx + 1}`}
                                </span>
                                <span className="text-[#ebebeb]">•</span>
                                <Link
                                  href={`/learn/${topic.id}`}
                                  className="text-[#37352f] font-medium text-xs sm:text-sm hover:underline inline-flex items-center gap-1 group"
                                >
                                  {topic.title}
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#787774] transition-opacity" />
                                </Link>

                                {/* Status Pills */}
                                {topic.user_status === 'mastered' && (
                                  <Badge variant="emerald" size="sm" dot>
                                    Mastered ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'studied' && (
                                  <Badge variant="blue" size="sm">
                                    Studied ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'in_progress' && (
                                  <Badge variant="amber" size="sm">
                                    In Progress ({topic.user_mastery}%)
                                  </Badge>
                                )}
                                {topic.user_status === 'not_started' && (
                                  <Badge variant="gray" size="sm">
                                    Not Started
                                  </Badge>
                                )}

                                {/* Revision Status Pill */}
                                {topic.revision_status === 'due' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#fff0f0] text-[#e03e3e] border border-[#f5c2c2]">
                                    <RotateCcw className="w-2.5 h-2.5" />
                                    Revision Due
                                  </span>
                                )}

                                {/* Difficulty Pill */}
                                <Badge
                                  variant={topic.difficulty === 'hard' ? 'rose' : topic.difficulty === 'medium' ? 'amber' : 'emerald'}
                                  size="sm"
                                >
                                  {topic.difficulty}
                                </Badge>
                              </div>

                              {/* Description snippet */}
                              {topic.description && (
                                <p className="text-xs text-[#787774] line-clamp-1 leading-relaxed">
                                  {topic.description}
                                </p>
                              )}

                              {/* Topic Metadata & Prerequisites */}
                              <div className="flex items-center gap-3 text-[11px] text-[#787774] font-mono flex-wrap pt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#9b9a97]" />
                                  {topic.estimated_study_hours} hrs
                                </span>
                                <span>•</span>
                                <span>Weight: {topic.weightage_percentage}%</span>
                                <span>•</span>
                                <span>{subtopics.length} Subtopics</span>

                                {topic.prerequisite_nodes && topic.prerequisite_nodes.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <span className="uppercase text-[#9b9a97]">Prereq:</span>
                                      {topic.prerequisite_nodes.map((p) => (
                                        <span
                                          key={p.id}
                                          className={`px-1 rounded text-[10px] ${
                                            p.status === 'mastered'
                                              ? 'bg-[#ebf5e8] text-[#2b593f] border border-[#c4e2b8]'
                                              : 'bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]'
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
                                <BookOpen className="w-3.5 h-3.5 mr-1 text-[#787774]" />
                                Read Topic
                              </Button>
                            </Link>

                            <Link href={`/learn/${topic.id}#practice`}>
                              <Button variant="secondary" size="sm">
                                <Zap className="w-3.5 h-3.5 mr-1 text-[#787774]" />
                                Practice
                              </Button>
                            </Link>

                            {topic.topic_test && (
                              <Button
                                variant={topic.user_status === 'mastered' ? 'outline' : 'primary'}
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
                          <div className="mt-3 pl-6 pr-3 py-2 bg-[#fbfbfa] border border-[#ebebeb] rounded-md space-y-1.5">
                            <div className="text-[10px] font-mono uppercase text-[#787774] font-medium flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              Subtopics & Conceptual Units
                            </div>
                            <div className="space-y-1">
                              {subtopics.map((sub, sIdx) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between text-xs py-1 border-b border-[#ebebeb] last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-[#9b9a97]">
                                      {sub.code || `${topic.code}.${sIdx + 1}`}
                                    </span>
                                    <span className="font-normal text-[#37352f]">
                                      {sub.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[#787774] text-[11px] font-mono">
                                    <span>{sub.estimated_study_hours}h</span>
                                    <span className="text-[#ebebeb]">•</span>
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
