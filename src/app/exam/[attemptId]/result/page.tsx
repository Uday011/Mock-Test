'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RotateCcw,
  Check,
  X,
  Clock,
  BookMarked,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Share2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    fetch(`/api/exam/${attemptId}/result`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load test analysis scorecard');
        return res.json();
      })
      .then((data) => {
        if (data.attempt) setAttempt(data.attempt);
        if (data.questions) setQuestions(data.questions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

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
      if (data.success && data.attemptId) {
        router.push(`/exam/${data.attemptId}`);
      } else {
        router.push(`/tests/${attempt.test_id}/start`);
      }
    } catch (e) {
      console.error(e);
      router.push(`/tests/${attempt.test_id}/start`);
    } finally {
      setRetaking(false);
    }
  };

  // Format seconds to mm:ss or mm m ss s
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  // Topic wise performance computation
  const topicBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    questions.forEach((q) => {
      const topicName = q.topic_title || q.topic_name || q.subject || 'General Logic';
      const existing = map.get(topicName) || { total: 0, correct: 0 };
      existing.total += 1;
      if (q.is_correct) existing.correct += 1;
      map.set(topicName, existing);
    });

    return Array.from(map.entries()).map(([topic, data]) => {
      const percent = Math.round((data.correct / data.total) * 100);
      return {
        topic,
        total: data.total,
        correct: data.correct,
        percent,
      };
    });
  }, [questions]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-28 space-y-3">
          <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink-muted font-mono">Generating Test Analysis...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !attempt) {
    return (
      <AppShell>
        <div className="text-center py-24 space-y-3">
          <AlertCircle className="w-8 h-8 text-coral mx-auto" />
          <p className="text-xs text-ink">{error || 'Could not load analysis'}</p>
          <Link
            href="/tests"
            className="inline-block px-4 py-1.5 bg-ink text-canvas rounded-full text-xs font-semibold"
          >
            Return to Tests
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalQuestions = questions.length || 10;
  const correctCount = attempt.correct_answers || 0;
  const incorrectCount = attempt.incorrect_answers || 0;
  const unansweredCount = attempt.unanswered_questions || Math.max(0, totalQuestions - correctCount - incorrectCount);
  const percentage = Math.round(attempt.percentage || (totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0));
  const timeTaken = attempt.time_taken_seconds || 1338; // 22m 18s fallback
  const avgTimePerQ = Math.round(timeTaken / Math.max(1, totalQuestions));

  // Big Radial Ring parameters
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percentage / 100) * ringCircumference;

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-2xl mx-auto space-y-6 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER */}
        {/* ========================================================= */}
        <div className="pt-1 space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Test Analysis
          </h1>

          {/* Meta card pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-card border border-line bg-surface text-xs text-ink-muted">
            <span className="font-medium text-ink">
              {attempt.test_title || 'CAT Custom Test'}
            </span>
            <span>•</span>
            <span>{totalQuestions} Questions</span>
            <span>•</span>
            <span>{Math.round((attempt.duration_seconds || 1800) / 60)} mins</span>
            <span>•</span>
            <span>{new Date(attempt.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. BIG RADIAL SCORE RING CARD */}
        {/* ========================================================= */}
        <div className="bg-surface border border-line rounded-hero p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="7"
                fill="none"
                className="text-line"
              />
              <circle
                cx="55"
                cy="55"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="7"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="text-accent transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute text-center space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider block">
                Your Score
              </span>
              <div className="text-xl font-bold font-mono text-ink">
                {correctCount} / {totalQuestions}
              </div>
              <span className="text-xs font-semibold text-accent block">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. METRIC PILLS / SUMMARY GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {/* Correct */}
          <div className="p-3 rounded-card border border-green/30 bg-green/10 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-green/80 block">
              Correct
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-green">
              {correctCount}
            </span>
          </div>

          {/* Incorrect */}
          <div className="p-3 rounded-card border border-coral/30 bg-coral/10 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-coral/80 block">
              Incorrect
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-coral">
              {incorrectCount}
            </span>
          </div>

          {/* Skipped */}
          <div className="p-3 rounded-card border border-line bg-surface text-center space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-ink-muted block">
              Skipped
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-ink">
              {unansweredCount}
            </span>
          </div>

          {/* Time Taken */}
          <div className="p-3 rounded-card border border-line bg-surface text-center space-y-0.5 col-span-1 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-ink-muted block">
              Time Taken
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-ink block pt-0.5">
              {formatTime(timeTaken)}
            </span>
          </div>

          {/* Avg / Question */}
          <div className="p-3 rounded-card border border-line bg-surface text-center space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-ink-muted block">
              Avg / Q
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-ink block pt-0.5">
              {formatTime(avgTimePerQ)}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. TOPIC PERFORMANCE BARS */}
        {/* ========================================================= */}
        <section className="bg-surface border border-line rounded-hero p-5 space-y-4 shadow-2xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Topic Performance
          </h2>

          <div className="space-y-3.5">
            {topicBreakdown.map((item, idx) => {
              // Color accents
              const colors = [
                'bg-green text-green',
                'bg-lavender text-lavender',
                'bg-gold text-gold',
                'bg-accent text-accent',
                'bg-coral text-coral',
              ];
              const barColor = colors[idx % colors.length].split(' ')[0];

              return (
                <div key={item.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink truncate pr-2">
                      {item.topic}
                    </span>
                    <span className="font-mono font-semibold text-ink shrink-0">
                      {item.percent}%
                    </span>
                  </div>

                  <div className="w-full bg-line/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. PRIMARY CTA BUTTON */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full py-3 px-6 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{showReview ? 'Hide Questions' : 'Review Questions →'}</span>
          </button>

          <button
            onClick={handleRetakeTest}
            disabled={retaking}
            className="w-full sm:w-auto py-3 px-5 rounded-full border border-line bg-surface hover:bg-secondary text-ink text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{retaking ? 'Retaking...' : 'Retake'}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 6. QUESTION-BY-QUESTION REVIEW LIST */}
        {/* ========================================================= */}
        {showReview && (
          <div className="space-y-4 pt-4 border-t border-line animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Detailed Question Review ({questions.length})
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isCorrect = q.is_correct;
                const isSkipped = !q.user_answer;

                return (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-card border border-line bg-surface space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-secondary text-ink font-mono text-[10px] font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          Question {idx + 1}
                        </span>
                      </div>

                      {isCorrect ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green/15 text-green flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Correct (+3)
                        </span>
                      ) : isSkipped ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-line text-ink-muted">
                          Skipped (0)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1">
                          <X className="w-3 h-3 stroke-[3]" /> Incorrect (-1)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
                      {q.question_text}
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5 pt-1">
                      {(q.options || []).map((opt: any) => {
                        const isUserChoice = q.user_answer === opt.label;
                        const isAnswerKey = q.correct_answer === opt.label;

                        return (
                          <div
                            key={opt.label}
                            className={`p-2.5 rounded-control text-xs flex items-center justify-between border ${
                              isAnswerKey
                                ? 'bg-green/10 border-green/40 text-green font-medium'
                                : isUserChoice && !isCorrect
                                ? 'bg-coral/10 border-coral/40 text-coral'
                                : 'bg-surface border-line text-ink-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                                {opt.label}
                              </span>
                              <span>{opt.text}</span>
                            </div>

                            {isAnswerKey && (
                              <span className="text-[10px] font-semibold text-green">
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span className="text-[10px] font-semibold text-coral">
                                Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 rounded-control bg-secondary/50 border border-line text-[11px] text-ink-muted leading-relaxed space-y-1">
                        <span className="font-semibold text-ink block">Explanation:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
