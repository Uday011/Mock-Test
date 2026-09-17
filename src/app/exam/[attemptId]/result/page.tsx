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
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Top Title Banner & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebebeb] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="saffron">{attempt.subject || 'Comprehensive'}</Badge>
              <span className="text-[11px] font-mono text-[#787774]">Official Evaluation Report</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#37352f] tracking-tight">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-[#787774]">
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
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              {creatingRevisionTest ? 'Generating...' : 'Revision Drill'}
            </Button>

            <Link href="/mistakes">
              <Button variant="secondary" size="sm">
                <BookMarked className="w-3.5 h-3.5 mr-1.5" />
                Mistake Notebook
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Scorecard Hero Card */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#ebebeb] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left: Overall Score Dial */}
          <div className="md:col-span-1 bg-[#fbfbfa] rounded-md p-5 text-center border border-[#ebebeb] space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#787774] block">
              Aggregate Score
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-[#37352f] font-mono">
                {attempt.final_score}
              </span>
              <span className="text-xs text-[#787774] font-mono">
                / {attempt.maximum_marks}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-white border border-[#ebebeb]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isPassing ? 'bg-[#0f7b6c]' : 'bg-[#c93b3b]'}`}
              />
              <span className={isPassing ? 'text-[#0f7b6c]' : 'text-[#c93b3b]'}>
                {percentage}% Score ({isPassing ? 'Target Met' : 'Below Target'})
              </span>
            </div>

            <p className="text-[11px] text-[#787774] leading-relaxed pt-0.5">
              {isPassing
                ? 'Strong performance. Accuracy is aligned with tier-1 qualifying percentiles.'
                : 'Review errors below and trigger a targeted revision drill to strengthen weak concepts.'}
            </p>
          </div>

          {/* Right: Detailed 4-Metric Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-md bg-[#edf3ec]/60 border border-[#d3e5d2] text-center space-y-0.5">
              <span className="text-[10px] font-medium text-[#1c3829] uppercase tracking-wider block">Correct</span>
              <p className="text-xl sm:text-2xl font-semibold text-[#0f7b6c] font-mono">{attempt.correct_answers}</p>
              <span className="text-[11px] font-mono text-[#0f7b6c]">+{attempt.positive_marks} pts</span>
            </div>

            <div className="p-3.5 rounded-md bg-[#fdebec]/60 border border-[#f7d4d6] text-center space-y-0.5">
              <span className="text-[10px] font-medium text-[#4d1f22] uppercase tracking-wider block">Incorrect</span>
              <p className="text-xl sm:text-2xl font-semibold text-[#c93b3b] font-mono">{attempt.incorrect_answers}</p>
              <span className="text-[11px] font-mono text-[#c93b3b]">-{attempt.negative_marks} pts</span>
            </div>

            <div className="p-3.5 rounded-md bg-[#fbf3db]/60 border border-[#f6e5b4] text-center space-y-0.5">
              <span className="text-[10px] font-medium text-[#493a19] uppercase tracking-wider block">Unanswered</span>
              <p className="text-xl sm:text-2xl font-semibold text-[#8f6b10] font-mono">{attempt.unanswered_questions}</p>
              <span className="text-[11px] font-mono text-[#8f6b10]">0 deduction</span>
            </div>

            <div className="p-3.5 rounded-md bg-[#f7f6f3] border border-[#ebebeb] text-center space-y-0.5">
              <span className="text-[10px] font-medium text-[#787774] uppercase tracking-wider block">Accuracy</span>
              <p className="text-xl sm:text-2xl font-semibold text-[#37352f] font-mono">{attempt.accuracy}%</p>
              <span className="text-[11px] font-mono text-[#787774]">
                {formatSeconds(attempt.time_taken_seconds)} spent
              </span>
            </div>
          </div>
        </div>

        {/* Section-Wise Performance Breakdown Table */}
        {sectionPerformance.length > 0 && (
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#ebebeb] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2.5">
              <h2 className="text-sm font-semibold text-[#37352f] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#787774]" />
                Section-Wise Performance Breakdown
              </h2>
              <span className="text-[11px] font-mono text-[#787774]">
                {sectionPerformance.length} Sections Tested
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#ebebeb] bg-[#fbfbfa] text-[#787774] font-medium text-[10px] uppercase tracking-wider">
                    <th className="py-2 px-3">Section Name</th>
                    <th className="py-2 px-3 text-center">Questions</th>
                    <th className="py-2 px-3 text-center">Attempted</th>
                    <th className="py-2 px-3 text-center">Correct</th>
                    <th className="py-2 px-3 text-center">Incorrect</th>
                    <th className="py-2 px-3 text-center">Accuracy</th>
                    <th className="py-2 px-3 text-right">Net Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {sectionPerformance.map((sec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#f7f6f3] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#37352f]">
                        {sec.section_name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#37352f]">
                        {sec.total_questions}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#37352f]">
                        {sec.attempted}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-[#0f7b6c]">
                        {sec.correct}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-[#c93b3b]">
                        {sec.incorrect}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        <span className={sec.accuracy >= 70 ? 'text-[#0f7b6c]' : 'text-[#8f6b10]'}>
                          {sec.accuracy}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#37352f]">
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
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#ebebeb] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2.5">
              <div>
                <h2 className="text-sm font-semibold text-[#37352f] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#787774]" />
                  Syllabus Mastery & Topic Progress Updated
                </h2>
                <p className="text-[11px] text-[#787774] mt-0.5">
                  Your performance in this test has automatically updated your syllabus mastery and scheduled spaced repetition.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {topicPerformance.map((top: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border space-y-2 transition-colors ${
                    top.is_mastered
                      ? 'bg-[#edf3ec]/40 border-[#d3e5d2]'
                      : 'bg-[#fbf3db]/30 border-[#f6e5b4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs text-[#37352f] line-clamp-1">
                      {top.topic_title}
                    </h3>
                    <Badge variant={top.is_mastered ? 'emerald' : 'saffron'} size="sm">
                      {top.is_mastered ? 'Mastered' : 'Needs Practice'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#787774]">Accuracy:</span>
                    <span className={`font-semibold ${top.is_mastered ? 'text-[#0f7b6c]' : 'text-[#8f6b10]'}`}>
                      {top.accuracy}% ({top.correct}/{top.total_questions})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-[#787774]">
                    <span>
                      {top.is_mastered ? 'Review in 3 days' : 'Review tomorrow'}
                    </span>
                    <Link
                      href={top.topic_id ? `/learn/${top.topic_id}` : '/learn'}
                      className="font-medium text-[#37352f] hover:underline flex items-center gap-0.5"
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
        <div className="bg-[#2f2d28] rounded-lg p-5 sm:p-6 text-white border border-[#44423d] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#fbf3db] border border-white/10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#e8c67c]" />
                  POWERED BY GEMINI 3.6 FLASH
                </span>
              </div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                Nalanda AI Diagnostic Coach & Concept Insights
              </h2>
              <p className="text-xs text-[#a09e99]">
                Personalized conceptual forensics, timing analysis, and recommended next study steps based on your answers.
              </p>
            </div>

            {!aiInsights && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateInsights}
                disabled={generatingAI}
                className="bg-white hover:bg-[#f7f6f3] text-[#37352f] border-none font-medium self-start sm:self-auto"
              >
                {generatingAI ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#37352f] border-t-transparent rounded-full animate-spin mr-1.5" />
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
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-md text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{aiError}</span>
            </div>
          )}

          {aiInsights && (
            <div className="space-y-3.5 pt-1 animate-in fade-in zoom-in-95 duration-300">
              {/* Overall Feedback */}
              <div className="p-3.5 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                &ldquo;{aiInsights.overall_feedback}&rdquo;
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Concept Strengths */}
                <div className="p-3.5 rounded-md bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Key Strengths Demonstrated
                  </span>
                  <ul className="space-y-1 text-xs text-emerald-100">
                    {(aiInsights.strengths || []).map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weak Areas */}
                <div className="p-3.5 rounded-md bg-rose-950/30 border border-rose-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Concepts Needing Improvement
                  </span>
                  <ul className="space-y-1 text-xs text-rose-100">
                    {(aiInsights.weak_areas || []).map((w: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Time Management */}
                <div className="p-3.5 rounded-md bg-amber-950/30 border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5 text-amber-400" /> Pacing & Time Management
                  </span>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    {aiInsights.time_management}
                  </p>
                </div>

                {/* Actionable Next Topics */}
                <div className="p-3.5 rounded-md bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-amber-400" /> Recommended Revision Topics
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {(aiInsights.recommended_topics || []).map((topic: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/10 text-stone-200 rounded text-xs font-mono border border-white/10"
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebebeb] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#37352f]">
                Detailed Question-by-Question Solution & Review
              </h2>
              <p className="text-xs text-[#787774]">
                Inspect candidate answers against official solutions with step-by-step rationales. Incorrect answers have been automatically logged to your Mistake Notebook.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
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
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    filterType === f.id
                      ? 'bg-[#37352f] text-white font-medium'
                      : 'bg-white text-[#787774] hover:bg-[#f7f6f3] border border-[#ebebeb]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isAnswered = q.is_attempted;
              const isCorrect = isAnswered && q.is_correct;
              const isIncorrect = isAnswered && !q.is_correct;

              let cardBorder = 'border-[#ebebeb]';
              let badgeBg = 'bg-[#f1f1ef] text-[#787774] border-[#ebebeb]';
              let statusText = 'Not Attempted (0 Marks)';

              if (isCorrect) {
                cardBorder = 'border-[#c4e2b8]';
                badgeBg = 'bg-[#edf3ec] text-[#0f7b6c] border-[#c4e2b8]';
                statusText = `Correct (+${q.marks_awarded} Marks)`;
              } else if (isIncorrect) {
                cardBorder = 'border-[#f5c2c2]';
                badgeBg = 'bg-[#fdebec] text-[#c93b3b] border-[#f5c2c2]';
                statusText = `Incorrect (-${q.negative_marks_deducted} Marks)`;
              }

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-lg border ${cardBorder} p-4 sm:p-5 space-y-3`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs bg-[#f1f1ef] text-[#37352f] px-2 py-0.5 rounded">
                        Q{q.question_number}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badgeBg}`}>
                        {statusText}
                      </span>
                      {q.section_name && (
                        <span className="text-[11px] text-[#787774] hidden sm:inline">
                          [{q.section_name}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isIncorrect && (
                        <Link
                          href="/mistakes"
                          className="text-[11px] font-medium text-[#8f6b10] hover:text-[#493a19] bg-[#fbf3db] px-2 py-0.5 rounded border border-[#f6e5b4] flex items-center gap-1"
                        >
                          <BookMarked className="w-3 h-3" /> Logged in Notebook
                        </Link>
                      )}
                      {q.is_marked_for_review && (
                        <span className="text-[11px] font-medium text-[#6940a5] bg-[#f4f0f7] px-2 py-0.5 rounded flex items-center gap-1 border border-[#e5daf0]">
                          <Flag className="w-3 h-3 text-[#6940a5]" /> Marked Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs sm:text-sm font-medium text-[#37352f] leading-relaxed whitespace-pre-line">
                    {q.question_text}
                  </div>

                  {/* Diagram / Image */}
                  {q.question_image_url && (
                    <div className="rounded-md overflow-hidden border border-[#ebebeb] max-h-72 max-w-md bg-[#fbfbfa] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.question_image_url}
                        alt="Question Diagram"
                        className="w-full h-auto object-contain max-h-64 rounded"
                      />
                    </div>
                  )}

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt: any) => {
                      const isCandidateAnswer = q.user_answer === opt.label;
                      const isOfficialCorrect = q.correct_answer === opt.label;

                      let optClass = 'border-[#ebebeb] bg-[#fbfbfa] text-[#37352f]';
                      if (isOfficialCorrect && isCandidateAnswer) {
                        optClass = 'border-[#c4e2b8] bg-[#edf3ec] text-[#1c3829] font-medium';
                      } else if (isOfficialCorrect) {
                        optClass = 'border-[#c4e2b8] bg-[#edf3ec]/60 text-[#1c3829] font-medium';
                      } else if (isCandidateAnswer) {
                        optClass = 'border-[#f5c2c2] bg-[#fdebec] text-[#c93b3b] font-medium';
                      }

                      return (
                        <div
                          key={opt.label}
                          className={`p-2.5 rounded-md border flex items-center justify-between gap-2 text-xs ${optClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded text-xs font-mono font-medium flex items-center justify-center shrink-0 ${
                                isOfficialCorrect
                                  ? 'bg-[#0f7b6c] text-white'
                                  : isCandidateAnswer
                                  ? 'bg-[#c93b3b] text-white'
                                  : 'bg-[#f1f1ef] text-[#37352f]'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] shrink-0 font-mono">
                            {isCandidateAnswer && (
                              <span className={isCorrect ? 'text-[#0f7b6c]' : 'text-[#c93b3b]'}>
                                (Your Pick)
                              </span>
                            )}
                            {isOfficialCorrect && (
                              <span className="text-[#0f7b6c] flex items-center gap-0.5 font-medium">
                                <Check className="w-3 h-3 text-[#0f7b6c]" /> Key
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Explanation */}
                  {q.explanation && (
                    <div className="p-3 bg-[#fbfbfa] rounded-md border border-[#ebebeb] text-xs text-[#37352f] space-y-0.5">
                      <span className="font-semibold text-[#787774] flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#d9730d]" />
                        Solution & Rationale:
                      </span>
                      <p className="leading-relaxed whitespace-pre-line text-[#37352f]">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-4 border-t border-[#ebebeb] flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/tests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to Test Catalog
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetakeTest}
              disabled={retaking}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Retake Exam
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateRevisionDrill}
              disabled={creatingRevisionTest}
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              {creatingRevisionTest ? 'Compiling Drill...' : 'Generate Revision Drill'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
