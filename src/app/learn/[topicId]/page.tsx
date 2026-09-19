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
  Check,
  Save,
  Layers,
  Target,
  PlusCircle,
  Youtube,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContextualHelpDrawer } from '@/components/learning/ContextualHelpDrawer';
import { TopicTestModal } from '@/components/learning/TopicTestModal';
import { Modal } from '@/components/ui/Modal';

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

  // Add Resource Modal for this Topic
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<'youtube' | 'pdf' | 'article' | 'website' | 'notes'>('youtube');
  const [resSource, setResSource] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resNotes, setResNotes] = useState('');
  const [submittingResource, setSubmittingResource] = useState(false);

  const fetchTopicData = () => {
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
  };

  useEffect(() => {
    fetchTopicData();
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

  const handleToggleStatus = async () => {
    const currentStatus = data?.progress?.status;
    const nextStatus = currentStatus === 'studied' || currentStatus === 'mastered' ? 'not_started' : 'studied';
    try {
      const res = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          status: nextStatus,
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
      console.error('Error updating topic status:', err);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    setSubmittingResource(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resTitle.trim(),
          type: resType,
          subject_name: data?.topic?.subject_name,
          topic_id: topicId,
          topic_name: data?.topic?.title,
          source: resSource.trim() || (resType === 'youtube' ? 'YouTube' : 'Personal Note'),
          url: resUrl.trim() || null,
          notes: resNotes.trim() || null,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setAddResourceModalOpen(false);
        setResTitle('');
        setResUrl('');
        setResNotes('');
        setResSource('');
        fetchTopicData();
      }
    } catch (err) {
      console.error('Failed to add resource:', err);
    } finally {
      setSubmittingResource(false);
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
              Return to Syllabus
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const topic = data.topic;
  const content = data.content || {};
  const progress = data.progress || {};
  const subtopics = data.subtopics || [];
  const topicTest = data.topic_test;
  const nextTopic = data.next_topic;
  const relatedResources = data.related_resources || [];
  const relatedTests = data.related_tests || [];
  const mistakes = data.mistakes || [];
  const practiceCount = data.practice_question_count || 12;

  const isMastered = progress?.status === 'mastered';
  const isStudied = progress?.status === 'studied' || isMastered;

  return (
    <AppShell
      activeExamTitle={topic.exam_title || 'CAT 2026'}
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Learn', href: '/learn' },
        { label: 'Syllabus', href: '/learn' },
        { label: topic.subject_name, href: '/learn' },
        { label: topic.title },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-36 md:pb-16">
        {/* Back Link & Topic Header */}
        <div className="border-b border-[#E6E6E3] pb-5 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#202124] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Syllabus</span>
            </Link>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`px-2.5 py-1 rounded border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'border-[#fae2be] bg-[#fdf5e8] text-[#8f4f00]'
                  : 'border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                  {topic.code || 'TOPIC'}
                </span>
                <span className="text-xs text-[#787774]">
                  {topic.subject_name}
                </span>
                <span className="text-[#E6E6E3]">•</span>
                <Badge
                  variant={isMastered ? 'emerald' : isStudied ? 'blue' : 'gray'}
                  size="sm"
                  dot={isMastered}
                >
                  {isMastered ? 'Mastered' : isStudied ? 'Studied' : 'Not Started'}
                </Badge>
              </div>

              <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
                {topic.title}
              </h1>

              {topic.description && (
                <p className="text-xs text-[#787774] max-w-2xl leading-relaxed pt-1">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Mark as Completed Action */}
            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant={isStudied ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleStatus}
              >
                <Check className={`w-3.5 h-3.5 mr-1.5 ${isStudied ? 'text-emerald-600' : ''}`} />
                {isStudied ? 'Completed ✓' : 'Mark as Completed'}
              </Button>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Link href={`/question-bank?subject=${encodeURIComponent(topic.subject_name)}`}>
              <Button variant="primary" size="sm">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Start Practice ({practiceCount} Questions)
              </Button>
            </Link>

            {topicTest && (
              <Button variant="outline" size="sm" onClick={() => setTestModalOpen(true)}>
                <Award className="w-3.5 h-3.5 mr-1.5 text-[#787774]" />
                Take Topic Test
              </Button>
            )}

            <button
              onClick={() => setAddResourceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E6E6E3] hover:bg-[#F1F1EF] text-xs font-medium text-[#202124] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#787774]" />
              Add Resource
            </button>
          </div>
        </div>

        {/* 1. Related Resources Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#787774]">
              Related Learning Resources ({relatedResources.length})
            </h2>
            <button
              onClick={() => setAddResourceModalOpen(true)}
              className="text-xs text-[#4F46A5] hover:underline font-medium flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3" />
              Add Resource
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedResources.length > 0 ? (
              relatedResources.map((res: any) => {
                const isYt = res.type === 'youtube';
                const isPdf = res.type === 'pdf';
                const Icon = isYt ? Youtube : isPdf ? FileText : BookOpen;

                return (
                  <div
                    key={res.id}
                    className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg hover:border-[#D4D4D1] transition-colors flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isYt ? 'text-red-600' : isPdf ? 'text-amber-600' : 'text-[#4F46A5]'}`} />
                        <span className="font-mono text-[10px] uppercase text-[#787774]">{res.type}</span>
                        {res.source && (
                          <span className="text-[10px] text-[#787774] truncate">• {res.source}</span>
                        )}
                      </div>
                      <h4 className="font-medium text-[#202124] line-clamp-1">{res.title}</h4>
                      {res.notes && (
                        <p className="text-[11px] text-[#787774] line-clamp-2">{res.notes}</p>
                      )}
                    </div>

                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#787774] hover:text-[#202124] rounded hover:bg-[#F1F1EF] shrink-0"
                        title="Open resource"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="p-1 text-[#787774] shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-4 bg-white border border-[#E6E6E3] rounded-lg text-center text-xs text-[#787774]">
                <span>No resources saved for this topic yet.</span>
                <button
                  onClick={() => setAddResourceModalOpen(true)}
                  className="text-[#4F46A5] hover:underline ml-1 font-medium"
                >
                  Add a YouTube lecture, PDF, or note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Mistakes from this Topic */}
        {mistakes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C53030]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#787774]">
                  Mistakes from this Topic ({mistakes.length})
                </h2>
              </div>
              <Link href="/mistakes" className="text-xs text-[#4F46A5] hover:underline font-medium">
                View All Mistakes →
              </Link>
            </div>

            <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg divide-y divide-[#E6E6E3]">
              {mistakes.map((m: any) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-[#202124] leading-relaxed">
                      {m.question_text}
                    </p>
                    <Link href="/mistakes" className="shrink-0">
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Practice
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-red-700">Your Answer: <strong>{m.selected_answer}</strong></span>
                    <span className="text-emerald-700">Correct Answer: <strong>{m.correct_answer}</strong></span>
                  </div>

                  {m.explanation && (
                    <p className="text-[11px] text-[#787774] bg-[#F7F7F5] p-2 rounded border border-[#E6E6E3] leading-relaxed">
                      {m.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Core Study Content (Conceptual Reader & Demonstrations) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Reading View (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview */}
            {content.overview && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Conceptual Framework
                </h3>
                <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg text-xs leading-relaxed text-[#202124] space-y-2">
                  <p>{content.overview}</p>
                </div>
              </div>
            )}

            {/* Key Definitions & Formulas */}
            {content.key_concepts && content.key_concepts.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider">
                  Key Definitions & Core Formulas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.key_concepts.map((kc: any) => (
                    <div
                      key={kc.id}
                      className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2 flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-[#202124]">{kc.title}</h4>
                          <Badge variant={kc.importance === 'core' ? 'amber' : 'gray'} size="sm">
                            {kc.importance || 'core'}
                          </Badge>
                        </div>
                        <p className="text-[#787774] mt-1 leading-relaxed">{kc.definition}</p>
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

            {/* Worked Examples */}
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
                      className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
                        <span className="font-mono font-medium text-[#787774]">
                          Demonstration {idx + 1}: {we.title}
                        </span>
                        <Badge variant="gray" size="sm">Exam Model</Badge>
                      </div>

                      <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] text-[#202124] leading-relaxed">
                        <strong>Problem:</strong> {we.problem_statement}
                      </div>

                      <div className="p-3 bg-[#ebf5e8] border border-[#c4e2b8] rounded-md text-[#2b593f]">
                        <strong>Solution:</strong> {we.final_answer}
                        {we.pro_tip && (
                          <span className="block mt-1 text-[11px] font-mono">
                            Pro Tip: {we.pro_tip}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Recall Retrieval Check */}
            {content.active_recall_checks && content.active_recall_checks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Active Recall Practice Check
                </h3>
                <div className="space-y-2.5">
                  {content.active_recall_checks.map((ar: any, idx: number) => {
                    const isRevealed = Boolean(revealedRecall[ar.id]);
                    return (
                      <div
                        key={ar.id}
                        className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-medium text-[#202124]">
                            Recall Check {idx + 1}: {ar.question}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRevealedRecall((prev) => ({ ...prev, [ar.id]: !prev[ar.id] }))}
                          >
                            {isRevealed ? 'Hide' : 'Reveal Solution'}
                          </Button>
                        </div>

                        {isRevealed && (
                          <div className="p-2.5 bg-[#ebf5e8] border border-[#c4e2b8] rounded-md text-[#2b593f] space-y-1">
                            <strong>Correct Answer: {ar.correct_answer}</strong>
                            <p className="text-[#202124]">{ar.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Notes & Related Tests (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Personal Study Notes Card */}
            <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#787774]" />
                  <h4 className="font-medium text-xs text-[#202124]">
                    Personal Notes
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#787774]">
                  {notesSavedNotice ? 'Saved ✓' : 'Auto-Saved'}
                </span>
              </div>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your personal formulas, question shortcuts, or reminders for this topic..."
                className="w-full text-xs p-2.5 rounded-md border border-[#E6E6E3] focus:outline-none focus:border-[#202124] bg-[#F7F7F5] text-[#202124] placeholder:text-[#787774] font-mono resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#787774]">
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

            {/* Related Tests Card */}
            {relatedTests.length > 0 && (
              <div className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg space-y-2.5">
                <h4 className="font-mono text-xs uppercase text-[#787774] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Related Tests
                </h4>
                <div className="space-y-2 text-xs">
                  {relatedTests.map((t: any) => (
                    <div key={t.id} className="p-2.5 rounded border border-[#E6E6E3] hover:bg-[#F7F7F5] transition-colors space-y-1.5">
                      <h5 className="font-medium text-[#202124] line-clamp-1">{t.title}</h5>
                      <div className="flex items-center justify-between text-[11px] text-[#787774]">
                        <span>{Math.round(t.duration_seconds / 60)} mins</span>
                        <Link href={`/tests/${t.id}/start`}>
                          <Button variant="outline" size="sm">
                            Take Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Assistance Drawer */}
            <ContextualHelpDrawer topicId={topic.id} topicTitle={topic.title} />
          </div>
        </div>
      </div>

      {/* Add Resource Modal for this Topic */}
      {addResourceModalOpen && (
        <Modal
          isOpen={addResourceModalOpen}
          onClose={() => setAddResourceModalOpen(false)}
          title={`Add Resource: ${topic.title}`}
          description="Save a YouTube video, web guide, PDF, or personal study note directly to this topic."
        >
          <form onSubmit={handleAddResource} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-[#202124] mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="e.g. Masterclass on Percentage Calculations & Short Tricks"
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#202124] mb-1">Resource Type</label>
                <select
                  value={resType}
                  onChange={(e: any) => setResType(e.target.value)}
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none bg-white"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="pdf">PDF / Handout</option>
                  <option value="article">Article / Guide</option>
                  <option value="website">Website Link</option>
                  <option value="notes">Personal Note</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">Source / Channel</label>
                <input
                  type="text"
                  value={resSource}
                  onChange={(e) => setResSource(e.target.value)}
                  placeholder="e.g. YouTube • Top Educator"
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#202124] mb-1">External Link / URL</label>
              <input
                type="url"
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://..."
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#202124] mb-1">Key Takeaways / Notes</label>
              <textarea
                rows={3}
                value={resNotes}
                onChange={(e) => setResNotes(e.target.value)}
                placeholder="Important timestamps, shortcuts, or key concepts covered..."
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddResourceModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submittingResource}>
                {submittingResource ? 'Saving...' : 'Save Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

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

      {/* Mobile Sticky High-Intent Bottom Action Bar (Screens < md:) */}
      <div className="md:hidden fixed bottom-16 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E6E6E3] p-2.5 z-20 shadow-lg flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleStatus}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold active:scale-[0.98] transition-all border ${
            isStudied
              ? 'bg-[#EEF0FB] text-[#4F46A5] border-[#DCDDF7]'
              : 'bg-white text-[#202124] border-[#E6E6E3]'
          }`}
        >
          <Check className={`w-4 h-4 ${isStudied ? 'text-[#4F46A5]' : 'text-[#787774]'}`} />
          <span>{isStudied ? 'Completed ✓' : 'Mark Done'}</span>
        </button>

        <Link
          href={`/question-bank?subject=${encodeURIComponent(topic.subject_name)}`}
          className="flex-1"
        >
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#4F46A5] text-white text-xs font-semibold active:scale-[0.98] transition-all shadow-xs"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Practice ({practiceCount} Qs)</span>
          </button>
        </Link>
      </div>
    </AppShell>
  );
}
