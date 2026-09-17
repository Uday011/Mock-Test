'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  LayoutDashboard,
  Filter,
  Check,
  X,
  Flag,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Play,
  Share2,
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp,
  Compass,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  BookMarked,
  Layers,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unanswered' | 'marked'>('all');
  const [retaking, setRetaking] = useState(false);
  const [creatingRevisionTest, setCreatingRevisionTest] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetch(`/api/exam/${attemptId}/result`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load examination scorecard');
        return res.json();
      })
      .then((data) => {
        if (data.attempt) {
          setAttempt(data.attempt);
          if (data.attempt.ai_insights) {
            setAiInsights(data.attempt.ai_insights);
          }
        }
        if (data.questions) setQuestions(data.questions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleGenerateInsights = async () => {
    setGeneratingAI(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI insights');
      setAiInsights(data.insights);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleRetakeTest = async () => {
    if (!attempt?.test_id) return;
    setRetaking(true);
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: attempt.test_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restart exam');
      router.push(`/exam/${data.attemptId}`);
    } catch (e: any) {
      alert(e.message);
      setRetaking(false);
    }
  };

  const handleCreateRevisionDrill = async () => {
    setCreatingRevisionTest(true);
    try {
      const res = await fetch('/api/tests/revision-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compile revision drill');
      router.push(`/exam/${data.attemptId}`);
    } catch (e: any) {
      alert(e.message);
      setCreatingRevisionTest(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-600 tracking-wide">
            Calculating score analytics and topic mastery...
          </p>
        </div>
      </AppShell>
    );
  }

  if (error || !attempt) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-900">Scorecard Not Available</h3>
          <p className="text-xs text-stone-600">{error || 'This exam attempt could not be retrieved.'}</p>
          <Link href="/tests">
            <Button variant="primary" size="sm">
              Return to Test Catalog
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const filteredQuestions = questions.filter((q) => {
    if (filterType === 'correct') return q.is_attempted && q.is_correct;
    if (filterType === 'incorrect') return q.is_attempted && !q.is_correct;
    if (filterType === 'unanswered') return !q.is_attempted;
    if (filterType === 'marked') return q.is_marked_for_review;
    return true;
  });

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '0s';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  const percentage = attempt.percentage ?? 0;
  const isPassing = percentage >= 60; // Standard competitive cutoff ~60%
  const sectionPerformance = attempt.section_performance || [];
  const topicPerformance = attempt.topic_performance || [];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Nalanda', href: '/dashboard' },
        { label: 'Test Catalog', href: '/tests' },
        { label: 'Scorecard', href: `/exam/${attemptId}/result` },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Top Title Banner & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="saffron">{attempt.subject || 'Comprehensive'}</Badge>
              <span className="text-[11px] font-mono text-stone-500">Official Evaluation Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-stone-500">
              Submitted on {new Date(attempt.submitted_at || attempt.started_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetakeTest}
              disabled={retaking}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {retaking ? 'Preparing...' : 'Retake Test'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateRevisionDrill}
              disabled={creatingRevisionTest}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              {creatingRevisionTest ? 'Generating...' : 'Revision Drill'}
            </Button>

            <Link href="/mistakes">
              <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900">
                <BookMarked className="w-3.5 h-3.5 mr-1.5" />
                Mistake Notebook
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Scorecard Hero Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Overall Score Dial */}
          <div className="md:col-span-1 bg-stone-50 rounded-xl p-6 text-center border border-stone-200/80 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
              Aggregate Score
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 font-mono">
                {attempt.final_score}
              </span>
              <span className="text-sm font-semibold text-stone-600 font-mono">
                / {attempt.maximum_marks}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-stone-200 shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
              <span className={isPassing ? 'text-emerald-800' : 'text-rose-800'}>
                {percentage}% Score ({isPassing ? 'Target Met' : 'Below Target'})
              </span>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
              {isPassing
                ? 'Strong performance. Accuracy is aligned with tier-1 qualifying percentiles.'
                : 'Review errors below and trigger a targeted revision drill to strengthen weak concepts.'}
            </p>
          </div>

          {/* Right: Detailed 4-Metric Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Correct</span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">{attempt.correct_answers}</p>
              <span className="text-[11px] font-mono font-semibold text-emerald-800">+{attempt.positive_marks} pts</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">Incorrect</span>
              <p className="text-2xl sm:text-3xl font-bold text-rose-700 font-mono">{attempt.incorrect_answers}</p>
              <span className="text-[11px] font-mono font-semibold text-rose-800">-{attempt.negative_marks} pts</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Unanswered</span>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono">{attempt.unanswered_questions}</p>
              <span className="text-[11px] font-mono font-semibold text-amber-800">0 deduction</span>
            </div>

            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">Accuracy</span>
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">{attempt.accuracy}%</p>
              <span className="text-[11px] font-mono text-stone-600">
                {formatSeconds(attempt.time_taken_seconds)} spent
              </span>
            </div>
          </div>
        </div>

        {/* Section-Wise Performance Breakdown Table */}
        {sectionPerformance.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                Section-Wise Performance Breakdown
              </h2>
              <span className="text-[11px] font-mono text-stone-500">
                {sectionPerformance.length} Sections Tested
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Section Name</th>
                    <th className="py-2.5 px-3 text-center">Questions</th>
                    <th className="py-2.5 px-3 text-center">Attempted</th>
                    <th className="py-2.5 px-3 text-center">Correct</th>
                    <th className="py-2.5 px-3 text-center">Incorrect</th>
                    <th className="py-2.5 px-3 text-center">Accuracy</th>
                    <th className="py-2.5 px-3 text-right">Net Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sectionPerformance.map((sec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-stone-900">
                        {sec.section_name}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-stone-700">
                        {sec.total_questions}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-stone-700">
                        {sec.attempted}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                        {sec.correct}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">
                        {sec.incorrect}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span className={sec.accuracy >= 70 ? 'text-emerald-700' : 'text-amber-700'}>
                          {sec.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        {sec.score} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Topic-Wise Performance & Learning Pathway Impact */}
        {topicPerformance.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-700" />
                  Syllabus Mastery & Topic Progress Updated
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Your performance in this test has automatically updated your syllabus mastery and scheduled spaced repetition.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topicPerformance.map((top: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    top.is_mastered
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-amber-50/30 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs text-stone-900 line-clamp-1">
                      {top.topic_title}
                    </h3>
                    <Badge variant={top.is_mastered ? 'emerald' : 'saffron'} size="sm">
                      {top.is_mastered ? 'Mastered' : 'Needs Practice'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500">Accuracy:</span>
                    <span className={`font-bold ${top.is_mastered ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {top.accuracy}% ({top.correct}/{top.total_questions})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-600">
                    <span>
                      {top.is_mastered ? 'Review in 3 days' : 'Review tomorrow'}
                    </span>
                    <Link
                      href={top.topic_id ? `/learn/${top.topic_id}` : '/learn'}
                      className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5"
                    >
                      Study <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Performance Coach & Diagnostic Insights Card */}
        <div className="bg-stone-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-stone-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  POWERED BY GEMINI 3.6 FLASH
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                Nalanda AI Diagnostic Coach & Concept Insights
              </h2>
              <p className="text-xs text-stone-400">
                Personalized conceptual forensics, timing analysis, and recommended next study steps based on your answers.
              </p>
            </div>

            {!aiInsights && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateInsights}
                disabled={generatingAI}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold self-start sm:self-auto"
              >
                {generatingAI ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin mr-1.5" />
                    Analyzing Forensics...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            )}
          </div>

          {aiError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{aiError}</span>
            </div>
          )}

          {aiInsights && (
            <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-300">
              {/* Overall Feedback */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                &ldquo;{aiInsights.overall_feedback}&rdquo;
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Concept Strengths */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strengths Demonstrated
                  </span>
                  <ul className="space-y-1 text-xs text-emerald-100">
                    {(aiInsights.strengths || []).map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weak Areas */}
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-rose-400" /> Concepts Needing Improvement
                  </span>
                  <ul className="space-y-1 text-xs text-rose-100">
                    {(aiInsights.weak_areas || []).map((w: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Time Management */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-amber-400" /> Pacing & Time Management
                  </span>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    {aiInsights.time_management}
                  </p>
                </div>

                {/* Actionable Next Topics */}
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="w-4 h-4 text-amber-400" /> Recommended Revision Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(aiInsights.recommended_topics || []).map((topic: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white/10 text-stone-200 rounded-lg text-xs font-semibold border border-white/10"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUESTION-WISE REVIEW SECTION */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                Detailed Question-by-Question Solution & Review
              </h2>
              <p className="text-xs text-stone-500">
                Inspect candidate answers against official solutions with step-by-step rationales. Incorrect answers have been automatically logged to your Mistake Notebook.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `All (${questions.length})` },
                { id: 'correct', label: `Correct (${attempt.correct_answers})` },
                { id: 'incorrect', label: `Incorrect (${attempt.incorrect_answers})` },
                { id: 'unanswered', label: `Unanswered (${attempt.unanswered_questions})` },
                { id: 'marked', label: 'Marked Review' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isAnswered = q.is_attempted;
              const isCorrect = isAnswered && q.is_correct;
              const isIncorrect = isAnswered && !q.is_correct;

              let cardBorder = 'border-stone-200';
              let badgeBg = 'bg-stone-100 text-stone-700 border-stone-200';
              let statusText = 'Not Attempted (0 Marks)';

              if (isCorrect) {
                cardBorder = 'border-emerald-200/90';
                badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                statusText = `Correct (+${q.marks_awarded} Marks)`;
              } else if (isIncorrect) {
                cardBorder = 'border-rose-200/90';
                badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
                statusText = `Incorrect (-${q.negative_marks_deducted} Marks)`;
              }

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border ${cardBorder} p-5 sm:p-7 space-y-4 shadow-xs`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-stone-900 text-white px-2.5 py-1 rounded-md">
                        Q{q.question_number}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.8 rounded-md border ${badgeBg}`}>
                        {statusText}
                      </span>
                      {q.section_name && (
                        <span className="text-[11px] font-medium text-stone-500 font-serif italic hidden sm:inline">
                          [{q.section_name}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isIncorrect && (
                        <Link
                          href="/mistakes"
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1"
                        >
                          <BookMarked className="w-3 h-3" /> Logged in Notebook
                        </Link>
                      )}
                      {q.is_marked_for_review && (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1 border border-purple-200">
                          <Flag className="w-3 h-3 text-purple-600" /> Marked Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm sm:text-base font-medium text-stone-900 leading-relaxed whitespace-pre-line">
                    {q.question_text}
                  </div>

                  {/* Diagram / Image */}
                  {q.question_image_url && (
                    <div className="rounded-xl overflow-hidden border border-stone-200 max-h-72 max-w-md bg-stone-50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.question_image_url}
                        alt="Question Diagram"
                        className="w-full h-auto object-contain max-h-64 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(q.options || []).map((opt: any) => {
                      const isCandidateAnswer = q.user_answer === opt.label;
                      const isOfficialCorrect = q.correct_answer === opt.label;

                      let optClass = 'border-stone-200 bg-white text-stone-700';
                      if (isOfficialCorrect && isCandidateAnswer) {
                        optClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-500/20';
                      } else if (isOfficialCorrect) {
                        optClass = 'border-emerald-400 bg-emerald-50/40 text-emerald-900 font-semibold';
                      } else if (isCandidateAnswer) {
                        optClass = 'border-rose-400 bg-rose-50/70 text-rose-950 font-semibold';
                      }

                      return (
                        <div
                          key={opt.label}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${optClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                                isOfficialCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isCandidateAnswer
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] shrink-0 font-semibold">
                            {isCandidateAnswer && (
                              <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                (Your Choice)
                              </span>
                            )}
                            {isOfficialCorrect && (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Correct
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Explanation */}
                  {q.explanation && (
                    <div className="mt-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700 space-y-1">
                      <span className="font-bold text-amber-800 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        Step-by-Step Solution & Rationale:
                      </span>
                      <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/tests">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Return to Test Catalog
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleRetakeTest}
              disabled={retaking}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retake Exam
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleCreateRevisionDrill}
              disabled={creatingRevisionTest}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              {creatingRevisionTest ? 'Compiling Drill...' : 'Generate Revision Drill'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
