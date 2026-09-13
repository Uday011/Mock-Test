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
} from 'lucide-react';

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
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetch(`/api/exam/${attemptId}/result`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load exam results');
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
      if (!res.ok) throw new Error(data.error || 'Failed to restart test');
      router.push(`/exam/${data.attemptId}`);
    } catch (e: any) {
      alert(e.message);
      setRetaking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Calculating and loading score analytics...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900">Result Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'This exam result could not be retrieved.'}</p>
        <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-block">
          Return to Dashboard
        </Link>
      </div>
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
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const percentage = attempt.percentage ?? 0;
  const isPassing = percentage >= 50;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Exam Performance Summary</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            {attempt.test_title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submitted on {new Date(attempt.submitted_at || attempt.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={handleRetakeTest}
            disabled={retaking}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            {retaking ? 'Preparing...' : 'Retake Exam'}
          </button>
        </div>
      </div>

      {/* Hero Score Gauge & Primary Metrics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Overall Score Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 rounded-2xl p-6 text-center border border-indigo-100/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Final Score</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">
              {attempt.final_score}
            </span>
            <span className="text-sm font-bold text-slate-400 font-mono">
              / {attempt.maximum_marks}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span className={isPassing ? 'text-emerald-700' : 'text-rose-700'}>
              {percentage}% Percentage
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            {isPassing ? '🎉 Great job! You passed this mock test.' : 'Keep practicing to improve accuracy and speed.'}
          </p>
        </div>

        {/* Right: Detailed Metric Cards (Span 2) */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Correct</span>
            <p className="text-2xl font-black text-emerald-600 font-mono">{attempt.correct_answers}</p>
            <span className="text-[10px] font-bold text-emerald-700">+{attempt.positive_marks} Marks</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Incorrect</span>
            <p className="text-2xl font-black text-rose-600 font-mono">{attempt.incorrect_answers}</p>
            <span className="text-[10px] font-bold text-rose-700">-{attempt.negative_marks} Marks</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Unanswered</span>
            <p className="text-2xl font-black text-amber-600 font-mono">{attempt.unanswered_questions}</p>
            <span className="text-[10px] font-bold text-amber-700">0 Deducted</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Accuracy</span>
            <p className="text-2xl font-black text-indigo-700 font-mono">{attempt.accuracy}%</p>
            <span className="text-[10px] font-bold text-indigo-600">
              {formatSeconds(attempt.time_taken_seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* AI-POWERED PERFORMANCE COACH & INSIGHTS CARD */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-300" />
                POWERED BY GEMINI 3.6 FLASH
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              AI Performance Coach & Concept Insights
            </h2>
            <p className="text-xs text-indigo-200">
              Personalized breakdown of concept mastery, timing analysis, and next study steps based on your answers
            </p>
          </div>

          {!aiInsights && (
            <button
              onClick={handleGenerateInsights}
              disabled={generatingAI}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              {generatingAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Analyzing Performance...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Insights
                </>
              )}
            </button>
          )}
        </div>

        {aiError && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{aiError}</span>
          </div>
        )}

        {aiInsights && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 pt-2">
            {/* Overall Feedback */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs sm:text-sm text-indigo-50 leading-relaxed font-medium">
              &ldquo;{aiInsights.overall_feedback}&rdquo;
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Concept Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strengths Demonstrated
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-100">
                  {(aiInsights.strengths || []).map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weak Areas */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Concepts Needing Improvement
                </span>
                <ul className="space-y-1.5 text-xs text-rose-100">
                  {(aiInsights.weak_areas || []).map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Time Management */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-amber-400" /> Pacing & Time Management
                </span>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {aiInsights.time_management}
                </p>
              </div>

              {/* Actionable Next Topics */}
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-400/30 space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-400" /> Recommended Revision Topics
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(aiInsights.recommended_topics || []).map((topic: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-500/20 text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-400/20"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {aiInsights.accuracy_assessment && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-indigo-200">
                <strong className="text-white mr-1">Strategic Advice:</strong>
                {aiInsights.accuracy_assessment}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUESTION-WISE REVIEW SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Question-Wise Solution & Answer Review</h2>
            <p className="text-xs text-slate-500">
              Review your responses against official correct answers with detailed step-by-step explanations
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isAnswered = q.is_attempted;
            const isCorrect = isAnswered && q.is_correct;
            const isIncorrect = isAnswered && !q.is_correct;

            let cardBorder = 'border-slate-200';
            let badgeBg = 'bg-slate-100 text-slate-700';
            let statusText = 'Not Answered (0 Marks)';

            if (isCorrect) {
              cardBorder = 'border-emerald-200';
              badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
              statusText = `Correct (+${q.marks_awarded} Marks)`;
            } else if (isIncorrect) {
              cardBorder = 'border-rose-200';
              badgeBg = 'bg-rose-50 text-rose-700 border border-rose-200';
              statusText = `Incorrect (-${q.negative_marks_deducted} Marks)`;
            }

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border ${cardBorder} p-6 space-y-4 shadow-sm`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                      Question #{q.question_number}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${badgeBg}`}>
                      {statusText}
                    </span>
                  </div>

                  {q.is_marked_for_review && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-purple-200">
                      <Flag className="w-3 h-3 text-purple-600" /> Was Marked for Review
                    </span>
                  )}
                </div>

                {/* Question Prompt */}
                <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                  {q.question_text}
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {(q.options || []).map((opt: any) => {
                    const isCandidateAnswer = q.user_answer === opt.label;
                    const isOfficialCorrect = q.correct_answer === opt.label;

                    let optClass = 'border-slate-200 bg-white text-slate-700';
                    if (isOfficialCorrect && isCandidateAnswer) {
                      optClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold';
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
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isOfficialCorrect
                                ? 'bg-emerald-600 text-white'
                                : isCandidateAnswer
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-700'
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

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-indigo-700 block flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Detailed Explanation:
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky-like Action Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs text-center transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
        <button
          onClick={handleRetakeTest}
          disabled={retaking}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retake This Exam
        </button>
      </div>
    </div>
  );
}
