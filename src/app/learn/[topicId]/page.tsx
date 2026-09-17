'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Bookmark,
  Award,
  Zap,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronRight,
  HelpCircle,
  Share2,
  Check,
  Save,
  Layers,
  Target,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalloutBlock } from '@/components/ui/CalloutBlock';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';
import { ContextualHelpDrawer } from '@/components/learning/ContextualHelpDrawer';
import { TopicTestModal } from '@/components/learning/TopicTestModal';

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.topicId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User Notes & Bookmarks State
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  // Active Recall State: revealed questions map
  const [revealedRecall, setRevealedRecall] = useState<Record<string, boolean>>({});

  // Topic Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);

  useEffect(() => {
    if (!topicId) return;

    fetch(`/api/learn/${topicId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          setNotes(resData.progress?.notes_taken || '');
          setIsBookmarked(Boolean(resData.progress?.is_bookmarked));
        }
      })
      .catch((err) => console.error('Error loading topic content:', err))
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch('/api/learn/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          notes,
          is_bookmarked: isBookmarked,
        }),
      });
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 3000);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleBookmark = async () => {
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);
    try {
      await fetch('/api/learn/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          is_bookmarked: nextVal,
        }),
      });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleMarkAsStudied = async () => {
    try {
      const res = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          status: 'studied',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setData((prev: any) => ({
          ...prev,
          progress: {
            ...prev.progress,
            status: resData.status,
            mastery_percentage: resData.mastery_percentage,
          },
        }));
      }
    } catch (err) {
      console.error('Error marking as studied:', err);
    }
  };

  const handleTestComplete = (result: any) => {
    setData((prev: any) => ({
      ...prev,
      progress: {
        ...prev.progress,
        status: result.new_status,
        mastery_percentage: result.percentage,
        next_revision_date: result.next_revision_date,
      },
    }));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-[#787774] font-mono">
          Loading topic study materials...
        </div>
      </AppShell>
    );
  }

  if (!data || !data.topic) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <h2 className="text-xl font-semibold text-[#202124]">Topic Not Found</h2>
          <p className="text-sm text-[#787774]">The requested topic does not exist or has been archived.</p>
          <Link href="/learn">
            <Button variant="outline" size="sm">
              Return to Learning Path
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const topic = data.topic;
  const content = data.content;
  const progress = data.progress;
  const subtopics = data.subtopics || [];
  const topicTest = data.topic_test;
  const nextTopic = data.next_topic;

  const isMastered = progress?.status === 'mastered';
  const isStudied = progress?.status === 'studied' || isMastered;

  return (
    <AppShell
      activeExamTitle={topic.exam_title || 'SSC CGL 2026'}
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Learning Path', href: '/learn' },
        { label: topic.subject_name, href: '/learn' },
        { label: topic.title },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Top Header Bar */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/learn">
              <button
                type="button"
                className="w-8 h-8 rounded-md border border-[#E6E6E3] flex items-center justify-center text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] transition-colors"
                title="Back to Syllabus"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                  {topic.code || 'TOPIC'}
                </span>
                <span className="text-xs text-[#787774]">
                  {topic.subject_name}
                </span>
                <span className="text-[#E6E6E3]">•</span>
                <Badge
                  variant={isMastered ? 'emerald' : isStudied ? 'blue' : 'amber'}
                  size="sm"
                  dot={isMastered}
                >
                  {isMastered ? `Mastered (${progress?.mastery_percentage}%)` : isStudied ? `Studied (${progress?.mastery_percentage}%)` : 'In Progress'}
                </Badge>
              </div>
              <h1 className="text-base sm:text-lg font-semibold text-[#202124] mt-0.5">
                {topic.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'border-[#fae2be] bg-[#fdf5e8] text-[#8f4f00]'
                  : 'border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            {!isStudied && (
              <Button variant="outline" size="sm" onClick={handleMarkAsStudied}>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Mark as Studied
              </Button>
            )}

            {topicTest && (
              <Button
                variant={isMastered ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setTestModalOpen(true)}
              >
                <Award className="w-3.5 h-3.5 mr-1.5" />
                {isMastered ? 'Retake Topic Test' : 'Take Topic Test'}
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Properties Table */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-3.5">
          <PropertyTable>
            <PropertyRow icon={Clock} label="Estimated Time">
              <span className="font-mono text-xs text-[#202124]">
                {content.estimated_read_minutes || 35} minutes
              </span>
            </PropertyRow>

            <PropertyRow icon={Target} label="Exam Weightage">
              <span className="font-mono text-xs text-[#202124]">
                {topic.weightage_percentage}% of Tier-I marks
              </span>
            </PropertyRow>

            <PropertyRow icon={Layers} label="Difficulty">
              <Badge
                variant={topic.difficulty === 'hard' ? 'rose' : topic.difficulty === 'medium' ? 'amber' : 'emerald'}
                size="sm"
              >
                {topic.difficulty}
              </Badge>
            </PropertyRow>

            {content.prerequisites && content.prerequisites.length > 0 && (
              <PropertyRow icon={CheckCircle2} label="Prerequisites">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {content.prerequisites.map((pr: any) => (
                    <Link
                      key={pr.id}
                      href={`/learn/${pr.id}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ebf5e8] text-[#2b593f] border border-[#c4e2b8] hover:bg-[#d8edd1] text-[11px] font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{pr.title}</span>
                    </Link>
                  ))}
                </div>
              </PropertyRow>
            )}
          </PropertyTable>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Academic Reader Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Learning Objectives */}
            {content.learning_objectives && content.learning_objectives.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Learning Objectives
                </h3>
                <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
                  {content.learning_objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#202124] leading-relaxed">
                      <span className="w-4 h-4 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] font-mono font-medium text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Overview & Core Conceptual Exposition */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
                Conceptual Framework
              </h3>
              <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg text-[#202124] text-xs sm:text-sm leading-relaxed space-y-3">
                <p>{content.overview}</p>
              </div>
            </div>

            {/* 3. Key Concepts & Mathematical Formulas */}
            {content.key_concepts && content.key_concepts.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                  Key Definitions & Core Formulas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.key_concepts.map((kc: any) => (
                    <div
                      key={kc.id}
                      className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-xs text-[#202124]">
                            {kc.title}
                          </h4>
                          <Badge variant={kc.importance === 'core' ? 'amber' : 'gray'} size="sm">
                            {kc.importance || 'core'}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                          {kc.definition}
                        </p>
                      </div>

                      {kc.formula && (
                        <div className="mt-2 p-2 bg-[#F1F1EF] rounded border border-[#E6E6E3] font-mono text-xs text-[#202124] overflow-x-auto">
                          {kc.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Conversion Tables & Reference Matrices */}
            {content.tables && content.tables.length > 0 && (
              <div className="space-y-2.5">
                {content.tables.map((tbl: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                      {tbl.title}
                    </h3>
                    <div className="border border-[#E6E6E3] rounded-lg overflow-x-auto bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] font-mono uppercase text-[10px] text-[#787774]">
                          <tr>
                            {tbl.headers.map((h: string, hi: number) => (
                              <th key={hi} className="p-2.5 font-medium">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E6E3] font-mono text-[#202124]">
                          {tbl.rows.map((row: string[], ri: number) => (
                            <tr key={ri} className="hover:bg-[#F7F7F5]">
                              {row.map((cell: string, ci: number) => (
                                <td key={ci} className="p-2.5">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {tbl.caption && (
                        <div className="p-2 bg-[#F7F7F5] border-t border-[#E6E6E3] text-[11px] text-[#787774] font-mono">
                          {tbl.caption}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Worked Examples with Step-by-Step Pedagogical Steps */}
            {content.worked_examples && content.worked_examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  Step-by-Step Worked Demonstrations
                </h3>
                <div className="space-y-3">
                  {content.worked_examples.map((we: any, idx: number) => (
                    <div
                      key={we.id || idx}
                      className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
                        <span className="font-mono text-xs font-medium text-[#787774]">
                          Demonstration {idx + 1}: {we.title}
                        </span>
                        <Badge variant="gray" size="sm">TCS Model</Badge>
                      </div>

                      <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] text-xs text-[#202124] leading-relaxed">
                        <strong className="text-[#202124]">Problem:</strong> {we.problem_statement}
                      </div>

                      {we.examiner_angle && (
                        <div className="text-xs text-[#8f4f00] bg-[#fdf5e8] p-2.5 rounded-md border border-[#fae2be] flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Examiner's Angle:</strong> {we.examiner_angle}
                          </div>
                        </div>
                      )}

                      {/* Steps */}
                      <div className="space-y-2 pl-2 border-l-2 border-[#E6E6E3]">
                        {we.steps.map((st: any, si: number) => (
                          <div key={si} className="text-xs space-y-1">
                            <span className="font-mono font-medium text-[#787774] text-[11px] block">
                              Step {st.step_number}: {st.explanation}
                            </span>
                            {st.equation && (
                              <div className="p-2 bg-[#F1F1EF] rounded font-mono text-xs text-[#202124] border border-[#E6E6E3]">
                                {st.equation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-[#ebf5e8] border border-[#c4e2b8] rounded-md text-xs text-[#2b593f]">
                        <strong>Final Answer:</strong> {we.final_answer}
                        {we.pro_tip && (
                          <span className="block mt-1 text-[#2b593f] font-mono text-[11px]">
                            Pro Tip: {we.pro_tip}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Forensic Examiner Traps & Common Mistakes */}
            {content.common_mistakes && content.common_mistakes.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Forensic Examiner Traps & Common Slip-Ups
                </h3>
                <div className="space-y-2.5">
                  {content.common_mistakes.map((cm: any) => (
                    <div
                      key={cm.id}
                      className="p-3.5 bg-white border border-[#f5c2c2] rounded-lg space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-[#e03e3e] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e03e3e]" />
                        <span>{cm.mistake_title}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[#202124] pt-1">
                        <div className="p-2.5 bg-[#fff0f0] rounded border border-[#f5c2c2]">
                          <strong className="text-[#e03e3e] block text-[11px] uppercase font-mono">
                            The Cognitive Trap:
                          </strong>
                          <p className="mt-0.5 text-xs text-[#202124]">{cm.error_trap}</p>
                        </div>
                        <div className="p-2.5 bg-[#ebf5e8] rounded border border-[#c4e2b8]">
                          <strong className="text-[#2b593f] block text-[11px] uppercase font-mono">
                            The Prevention Rule:
                          </strong>
                          <p className="mt-0.5 text-xs text-[#202124]">{cm.prevention_rule}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Past Examination References (PYQs) */}
            {content.pyq_references && content.pyq_references.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                  Previous Year Examination References (PYQs)
                </h3>
                <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-lg bg-white overflow-hidden">
                  {content.pyq_references.map((pyq: any) => (
                    <div
                      key={pyq.id}
                      className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-[#F7F7F5]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                            {pyq.exam} {pyq.year}
                          </span>
                          <span className="text-[#787774]">{pyq.tier_or_stage}</span>
                        </div>
                        <p className="text-[#202124]">{pyq.question_summary}</p>
                      </div>
                      <Badge variant={pyq.frequency_rating === 'very_high' ? 'amber' : 'gray'} size="sm">
                        {pyq.frequency_rating === 'very_high' ? 'Frequent' : 'Tested'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Active Recall Retrieval Checks (Learning Science) */}
            {content.active_recall_checks && content.active_recall_checks.length > 0 && (
              <div className="space-y-3" id="practice">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Active Recall Retrieval Check
                </h3>
                <div className="space-y-2.5">
                  {content.active_recall_checks.map((ar: any, idx: number) => {
                    const isRevealed = Boolean(revealedRecall[ar.id]);
                    return (
                      <div
                        key={ar.id}
                        className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <span className="font-medium text-[#202124]">
                            Recall Check {idx + 1}: {ar.question}
                          </span>
                          <Badge variant="gray" size="sm">Mental Drill</Badge>
                        </div>

                        {ar.options && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {ar.options.map((opt: string, oi: number) => (
                              <div key={oi} className="p-2 rounded bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3] font-mono">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t border-[#E6E6E3]">
                          <span className="text-[11px] font-mono text-[#9b9a97]">
                            {ar.recall_hint}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRevealedRecall((prev) => ({ ...prev, [ar.id]: !prev[ar.id] }))}
                          >
                            {isRevealed ? 'Hide Explanation' : 'Reveal Solution'}
                          </Button>
                        </div>

                        {isRevealed && (
                          <div className="p-2.5 bg-[#ebf5e8] border border-[#c4e2b8] rounded-md text-xs space-y-1">
                            <strong className="text-[#2b593f]">
                              Correct Answer: {ar.correct_answer}
                            </strong>
                            <p className="text-[#202124]">{ar.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 9. Topic Recap Checklist */}
            {content.recap_points && content.recap_points.length > 0 && (
              <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
                <h4 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                  Topic Recap & Key Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-[#202124]">
                  {content.recap_points.map((pt: string, pi: number) => (
                    <li key={pi} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 10. End-of-Topic Mastery Banner & Action */}
            <div id="assessment" className="p-5 bg-white border border-[#E6E6E3] rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">Assessment Bridge</Badge>
                    <span className="text-xs text-[#787774] font-mono">Official Pattern</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#202124] mt-1">
                    Validate Mastery with Topic Assessment
                  </h3>
                  <p className="text-xs text-[#787774] mt-0.5 max-w-lg leading-relaxed">
                    Topics are marked as <strong>Studied</strong> upon reading, but require scoring <strong>≥ 75%</strong> on this assessment to earn <strong>Mastered</strong> status.
                  </p>
                </div>

                {topicTest ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setTestModalOpen(true)}
                  >
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    {isMastered ? 'Retake Test' : 'Take Topic Test'}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Assessment Pending
                  </Button>
                )}
              </div>

              {isMastered && (
                <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between text-xs font-mono text-emerald-800">
                  <span>✓ Mastered Status Earned ({progress?.mastery_percentage}%)</span>
                  {nextTopic && (
                    <Link href={`/learn/${nextTopic.id}`} className="text-[#202124] hover:underline font-medium flex items-center gap-1">
                      Advance to Next Topic ({nextTopic.title}) →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Personal Notes, Contextual Help, Subtopics (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Personal Student Notes Card */}
            <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#787774]" />
                  <h4 className="font-medium text-xs text-[#202124]">
                    Personal Notes
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#9b9a97]">
                  {notesSavedNotice ? 'Saved ✓' : 'Auto-Saved'}
                </span>
              </div>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your mental models, formula derivations, or question traps for this topic..."
                className="w-full text-xs p-2.5 rounded-md border border-[#E6E6E3] focus:outline-none focus:border-[#202124] bg-[#F7F7F5] text-[#202124] placeholder:text-[#9b9a97] font-mono resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#9b9a97] font-mono">
                  Saved in your workspace
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  <Save className="w-3 h-3 mr-1" />
                  {savingNotes ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Contextual Assistance Drawer */}
            <ContextualHelpDrawer topicId={topic.id} topicTitle={topic.title} />

            {/* Structured Subtopics Checklist */}
            {subtopics.length > 0 && (
              <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs uppercase text-[#787774] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Subtopics in this Unit
                  </h4>
                  <span className="text-[11px] font-mono text-[#9b9a97]">
                    {subtopics.length} Modules
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {subtopics.map((sub: any, idx: number) => (
                    <div
                      key={sub.id}
                      className="p-2 rounded bg-[#F7F7F5] border border-[#E6E6E3] flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-[#9b9a97] block">
                          {sub.code || `Unit ${idx + 1}`}
                        </span>
                        <span className="font-medium text-[#202124] leading-snug">
                          {sub.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#787774] shrink-0">
                        {sub.estimated_study_hours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sectional Test Recommendation */}
            {content.recommended_sectional_test && (
              <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
                <Badge variant="blue" size="sm">Next Milestone</Badge>
                <h5 className="font-semibold text-xs text-[#202124]">
                  {content.recommended_sectional_test.title}
                </h5>
                <p className="text-[11px] text-[#787774] leading-relaxed">
                  Timed drill ({content.recommended_sectional_test.duration_minutes} mins) testing composite speed.
                </p>
                <Link href={`/tests/${content.recommended_sectional_test.id}`} className="block pt-1">
                  <Button variant="primary" size="sm" className="w-full text-xs">
                    Attempt Sectional Drill
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Assessment Modal */}
      {topicTest && (
        <TopicTestModal
          topicId={topic.id}
          topicTitle={topic.title}
          test={topicTest}
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          onTestComplete={handleTestComplete}
        />
      )}
    </AppShell>
  );
}
