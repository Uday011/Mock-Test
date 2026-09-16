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
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
        <div className="py-24 text-center text-xs text-stone-500 font-mono">
          Loading topic study materials...
        </div>
      </AppShell>
    );
  }

  if (!data || !data.topic) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <h2 className="text-xl font-serif font-bold text-stone-800">Topic Not Found</h2>
          <p className="text-sm text-stone-500">The requested topic does not exist or has been archived.</p>
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
      {/* Top Floating Sticky Header Bar */}
      <div className="mb-6 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/learn">
            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                {topic.code || 'TOPIC'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {topic.subject_name}
              </span>
              <span className="text-stone-300">•</span>
              <Badge
                variant={isMastered ? 'emerald' : isStudied ? 'navy' : 'saffron'}
                size="sm"
                dot={isMastered}
              >
                {isMastered ? `Mastered (${progress?.mastery_percentage}%)` : isStudied ? `Studied (${progress?.mastery_percentage}%)` : 'In Progress'}
              </Badge>
            </div>
            <h1 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              {topic.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
              isBookmarked
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {!isStudied && (
            <Button variant="outline" size="sm" onClick={handleMarkAsStudied}>
              <Check className="w-4 h-4 mr-1 text-emerald-600" />
              Mark as Studied
            </Button>
          )}

          {topicTest && (
            <Button
              variant={isMastered ? 'secondary' : 'saffron'}
              size="sm"
              onClick={() => setTestModalOpen(true)}
            >
              <Award className="w-4 h-4 mr-1.5" />
              {isMastered ? 'Retake Topic Test' : 'Take Topic Test'}
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center Column: Academic Reader Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Metadata & Prerequisites Capsule */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Est. Completion: {content.estimated_read_minutes || 35} mins
              </span>
              <span>Weightage: {topic.weightage_percentage}% Tier-I</span>
              <span className="capitalize">Difficulty: {topic.difficulty}</span>
            </div>

            {/* Prerequisites */}
            {content.prerequisites && content.prerequisites.length > 0 && (
              <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 flex-wrap text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-stone-400">
                  Prerequisites:
                </span>
                {content.prerequisites.map((pr: any) => (
                  <Link
                    key={pr.id}
                    href={`/learn/${pr.id}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{pr.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 1. Learning Objectives */}
          {content.learning_objectives && content.learning_objectives.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Learning Objectives
              </h3>
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                {content.learning_objectives.map((obj: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Overview & Core Conceptual Exposition */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-stone-700" />
              Conceptual Framework
            </h3>
            <div className="p-5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm leading-relaxed space-y-4">
              <p>{content.overview}</p>
            </div>
          </div>

          {/* 3. Key Concepts & Mathematical Formulas */}
          {content.key_concepts && content.key_concepts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Key Definitions & Core Formulas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.key_concepts.map((kc: any) => (
                  <div
                    key={kc.id}
                    className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-sm text-stone-900">
                          {kc.title}
                        </h4>
                        <Badge variant={kc.importance === 'core' ? 'saffron' : 'stone'} size="sm">
                          {kc.importance || 'core'}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {kc.definition}
                      </p>
                    </div>

                    {kc.formula && (
                      <div className="mt-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 font-mono text-xs text-amber-950 font-semibold overflow-x-auto">
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
            <div className="space-y-3">
              {content.tables.map((tbl: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {tbl.title}
                  </h3>
                  <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-stone-50 border-b border-stone-200 font-mono uppercase text-[10px] text-stone-600">
                        <tr>
                          {tbl.headers.map((h: string, hi: number) => (
                            <th key={hi} className="p-2.5 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono text-stone-800">
                        {tbl.rows.map((row: string[], ri: number) => (
                          <tr key={ri} className="hover:bg-stone-50/50">
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
                      <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
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
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Step-by-Step Worked Demonstrations
              </h3>
              <div className="space-y-4">
                {content.worked_examples.map((we: any, idx: number) => (
                  <div
                    key={we.id || idx}
                    className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-mono text-xs font-bold text-stone-500">
                        Demonstration {idx + 1}: {we.title}
                      </span>
                      <Badge variant="stone" size="sm">TCS Model</Badge>
                    </div>

                    <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/60 text-xs font-medium text-stone-900 leading-relaxed">
                      <strong>Problem:</strong> {we.problem_statement}
                    </div>

                    {we.examiner_angle && (
                      <div className="text-xs text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Examiner's Angle:</strong> {we.examiner_angle}
                        </div>
                      </div>
                    )}

                    {/* Steps */}
                    <div className="space-y-2.5 pl-2 border-l-2 border-amber-500/40">
                      {we.steps.map((st: any, si: number) => (
                        <div key={si} className="text-xs space-y-1">
                          <span className="font-mono font-bold text-stone-500 text-[11px] block">
                            Step {st.step_number}: {st.explanation}
                          </span>
                          {st.equation && (
                            <div className="p-2 bg-stone-50 rounded font-mono text-xs text-stone-800 border border-stone-200/60">
                              {st.equation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-medium">
                      <strong>Final Answer:</strong> {we.final_answer}
                      {we.pro_tip && (
                        <span className="block mt-1 text-emerald-800 font-mono text-[11px]">
                          ⚡ Pro Tip: {we.pro_tip}
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
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Forensic Examiner Traps & Common Slip-Ups
              </h3>
              <div className="space-y-3">
                {content.common_mistakes.map((cm: any) => (
                  <div
                    key={cm.id}
                    className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>{cm.mistake_title}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-stone-700 pt-1">
                      <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200/60">
                        <strong className="text-rose-800 block text-[11px] uppercase font-mono">
                          The Cognitive Trap:
                        </strong>
                        <p className="mt-0.5">{cm.error_trap}</p>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-200/60">
                        <strong className="text-emerald-800 block text-[11px] uppercase font-mono">
                          The Prevention Rule:
                        </strong>
                        <p className="mt-0.5">{cm.prevention_rule}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Past Examination References (PYQs) */}
          {content.pyq_references && content.pyq_references.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Previous Year Examination References (PYQs)
              </h3>
              <div className="space-y-2">
                {content.pyq_references.map((pyq: any) => (
                  <div
                    key={pyq.id}
                    className="p-3.5 bg-white border border-stone-200 rounded-xl flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          {pyq.exam} {pyq.year}
                        </span>
                        <span className="font-medium text-stone-600">{pyq.tier_or_stage}</span>
                      </div>
                      <p className="text-stone-800">{pyq.question_summary}</p>
                    </div>
                    <Badge variant={pyq.frequency_rating === 'very_high' ? 'saffron' : 'stone'} size="sm">
                      {pyq.frequency_rating === 'very_high' ? 'Frequent' : 'Tested'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Active Recall Retrieval Checks (Learning Science) */}
          {content.active_recall_checks && content.active_recall_checks.length > 0 && (
            <div className="space-y-4" id="practice">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Active Recall & Immediate Retrieval Check
              </h3>
              <div className="space-y-3">
                {content.active_recall_checks.map((ar: any, idx: number) => {
                  const isRevealed = Boolean(revealedRecall[ar.id]);
                  return (
                    <div
                      key={ar.id}
                      className="p-4 bg-white border border-stone-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="font-bold text-stone-900">
                          Recall Check {idx + 1}: {ar.question}
                        </span>
                        <Badge variant="stone" size="sm">Mental Drill</Badge>
                      </div>

                      {ar.options && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {ar.options.map((opt: string, oi: number) => (
                            <div key={oi} className="p-2 rounded bg-stone-50 text-stone-700 border border-stone-200 font-mono">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reveal Solution Button */}
                      <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                        <span className="text-[11px] font-mono text-stone-400">
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
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1 animate-fade-in">
                          <strong className="text-emerald-900">
                            Correct Answer: {ar.correct_answer}
                          </strong>
                          <p className="text-stone-700">{ar.explanation}</p>
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
            <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-3">
              <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider">
                Topic Recap & Key Takeaways
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-200">
                {content.recap_points.map((pt: string, pi: number) => (
                  <li key={pi} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 10. End-of-Topic Mastery Banner & Action */}
          <div id="assessment" className="p-6 bg-gradient-to-br from-stone-50 via-white to-amber-50/30 border-2 border-stone-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                    Learning-to-Testing Bridge
                  </span>
                  <span className="text-xs text-stone-500 font-mono">Official Pattern</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-1">
                  Validate Mastery with Topic Assessment
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 max-w-lg">
                  Topics are marked as <strong>Studied</strong> upon reading, but require scoring <strong>≥ 75%</strong> on this assessment to earn <strong>Mastered</strong> status and unlock spaced repetition.
                </p>
              </div>

              {topicTest ? (
                <Button
                  variant="saffron"
                  size="md"
                  className="shrink-0"
                  onClick={() => setTestModalOpen(true)}
                >
                  <Award className="w-4 h-4 mr-1.5" />
                  {isMastered ? 'Retake Test' : 'Take Topic Test'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Assessment Pending
                </Button>
              )}
            </div>

            {isMastered && (
              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-mono text-emerald-800">
                <span>✓ Mastered Status Earned ({progress?.mastery_percentage}%)</span>
                {nextTopic && (
                  <Link href={`/learn/${nextTopic.id}`} className="text-amber-700 hover:underline font-bold flex items-center gap-1">
                    Advance to Next Topic ({nextTopic.title}) →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Personal Notes, Contextual Help, Subtopics (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Personal Student Notes Card */}
          <Card className="p-4 space-y-3 bg-white border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-600" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  Student Notes
                </h4>
              </div>
              <span className="text-[10px] font-mono text-stone-400">
                {notesSavedNotice ? 'Saved ✓' : 'Auto-Saved'}
              </span>
            </div>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your mental models, formula derivations, or question traps for this topic..."
              className="w-full text-xs p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-stone-50/50 text-stone-800 placeholder:text-stone-400 font-mono resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400 font-mono">
                Persisted in your local notebook
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </Card>

          {/* Contextual Assistance Drawer */}
          <ContextualHelpDrawer topicId={topic.id} topicTitle={topic.title} />

          {/* Structured Subtopics Checklist */}
          {subtopics.length > 0 && (
            <Card className="p-4 space-y-3 bg-white border-stone-200">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs uppercase text-stone-500 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Subtopics in this Unit
                </h4>
                <span className="text-[11px] font-mono text-stone-400">
                  {subtopics.length} Modules
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {subtopics.map((sub: any, idx: number) => (
                  <div
                    key={sub.id}
                    className="p-2 rounded-lg bg-stone-50/70 border border-stone-200/60 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-stone-400 block">
                        {sub.code || `Unit ${idx + 1}`}
                      </span>
                      <span className="font-medium text-stone-800 leading-snug">
                        {sub.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {sub.estimated_study_hours}h
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sectional Test Recommendation */}
          {content.recommended_sectional_test && (
            <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">
                Next Sectional Milestone
              </span>
              <h5 className="font-serif font-bold text-xs text-stone-100">
                {content.recommended_sectional_test.title}
              </h5>
              <p className="text-[11px] text-stone-400">
                Timed sectional drill ({content.recommended_sectional_test.duration_minutes} mins) testing composite speed.
              </p>
              <Link href={`/tests/${content.recommended_sectional_test.id}`} className="block pt-1">
                <Button variant="saffron" size="sm" className="w-full text-xs">
                  Attempt Sectional Drill
                </Button>
              </Link>
            </div>
          )}
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
