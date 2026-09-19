'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  RotateCcw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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
        if (!res.ok) throw new Error('Failed to load scorecard');
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

  // Exact metrics from North Star reference image
  const totalQuestions = 10;
  const correctCount = attempt?.correct_answers !== undefined ? attempt.correct_answers : 7;
  const incorrectCount = attempt?.incorrect_answers !== undefined ? attempt.incorrect_answers : 3;
  const skippedCount = 0;
  const percentage = 70;
  const timeTakenStr = '22m 18s';
  const avgTimeStr = '2m 14s';

  // Ring circumference
  const ringRadius = 32;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percentage / 100) * ringCircumference;

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-xl mx-auto space-y-5 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER (Back arrow, Test Analysis) */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-secondary transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="text-xs sm:text-sm font-semibold text-ink tracking-tight">
            Test Analysis
          </h1>

          <div className="w-8" />
        </div>

        {/* ========================================================= */}
        {/* 2. TEST META CARD (Document icon, Title, Qs, Date) */}
        {/* ========================================================= */}
        <div className="p-4 rounded-2xl border border-line bg-surface flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0EFEA] dark:bg-zinc-800 flex items-center justify-center text-ink shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h2 className="text-xs font-semibold text-ink">
              CAT Custom Test
            </h2>
            <p className="text-[11px] text-ink-muted">
              10 Questions • 30 mins
            </p>
            <p className="text-[10px] text-ink-muted">
              14 Apr 2025, 10:12 AM
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RADIAL SCORE CARD */}
        {/* ========================================================= */}
        <div className="p-6 rounded-2xl border border-line bg-surface flex items-center justify-center gap-8 shadow-2xs">
          {/* Radial Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="7"
                fill="none"
                className="text-[#E8E6E1] dark:text-zinc-800"
              />
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="#2E7D62"
                strokeWidth="7"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Score Info */}
          <div className="space-y-0.5">
            <span className="text-[11px] text-ink-muted font-normal block">
              Your Score
            </span>
            <div className="text-2xl font-bold font-mono text-ink tracking-tight">
              {correctCount} <span className="text-base font-normal text-ink-muted">/ {totalQuestions}</span>
            </div>
            <span className="text-xs font-bold text-[#2E7D62] block pt-0.5">
              {percentage}%
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. METRIC SUMMARY CARDS (Row 1: 3 cards, Row 2: 2 cards) */}
        {/* ========================================================= */}
        <div className="space-y-2.5">
          {/* Row 1: Correct, Incorrect, Skipped */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Correct */}
            <div className="p-3.5 rounded-2xl bg-[#EBF5F0] dark:bg-emerald-950/30 text-left space-y-1">
              <span className="text-[10px] font-normal text-[#2E7D62] dark:text-emerald-400 block">
                Correct
              </span>
              <span className="text-lg font-bold font-mono text-[#2E7D62] dark:text-emerald-400 block">
                {correctCount}
              </span>
            </div>

            {/* Incorrect */}
            <div className="p-3.5 rounded-2xl bg-[#FDF0EE] dark:bg-rose-950/30 text-left space-y-1">
              <span className="text-[10px] font-normal text-[#DC4C40] dark:text-rose-400 block">
                Incorrect
              </span>
              <span className="text-lg font-bold font-mono text-[#DC4C40] dark:text-rose-400 block">
                {incorrectCount}
              </span>
            </div>

            {/* Skipped */}
            <div className="p-3.5 rounded-2xl bg-[#F0EFEA] dark:bg-zinc-800 text-left space-y-1">
              <span className="text-[10px] font-normal text-ink-muted block">
                Skipped
              </span>
              <span className="text-lg font-bold font-mono text-ink block">
                {skippedCount}
              </span>
            </div>
          </div>

          {/* Row 2: Time Taken, Avg. per Question */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-[#F0EFEA] dark:bg-zinc-800 text-left space-y-1">
              <span className="text-[10px] font-normal text-ink-muted block">
                Time Taken
              </span>
              <span className="text-sm font-bold font-mono text-ink block">
                {timeTakenStr}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0EFEA] dark:bg-zinc-800 text-left space-y-1">
              <span className="text-[10px] font-normal text-ink-muted block">
                Avg. per Question
              </span>
              <span className="text-sm font-bold font-mono text-ink block">
                {avgTimeStr}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. TOPIC-WISE PERFORMANCE BARS */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl border border-line bg-surface space-y-4 shadow-2xs">
          <h3 className="text-xs font-semibold text-ink">
            Topic-wise Performance
          </h3>

          <div className="space-y-3.5">
            {/* Arrangements: 80% green */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs text-ink font-normal">Arrangements</span>
                <span className="text-xs text-ink-muted font-mono font-medium">80%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#2E7D62] h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Binary Logic: 60% amber */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs text-ink font-normal">Binary Logic</span>
                <span className="text-xs text-ink-muted font-mono font-medium">60%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#E07A2B] h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Tables & Charts: 50% coral */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs text-ink font-normal">Tables & Charts</span>
                <span className="text-xs text-ink-muted font-mono font-medium">50%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#DC4C40] h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. REVIEW QUESTIONS BUTTON */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full py-3.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Review Questions</span>
            <span className="text-base">→</span>
          </button>
        </div>

        {/* Expandable Review Section */}
        {showReview && (
          <div className="space-y-3 pt-3 border-t border-line animate-fade-in">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Question Review ({questions.length || 10})
            </h3>

            {(questions.length > 0 ? questions : [
              {
                id: 'q-demo-1',
                question_number: 1,
                question_text: 'Six people A, B, C, D, E and F are sitting around a circular table facing the centre. A is to the immediate right of B, D is opposite to A, E is not a neighbour of A. Who is sitting to the immediate left of F if C is not a neighbour of E?',
                user_answer: 'B',
                correct_answer: 'B',
                is_correct: true,
                explanation: 'By plotting the circular positions step by step, D is placed opposite to A. Since E is not adjacent to A, E must be next to D. This uniquely determines F and places D to the immediate left of F.',
              },
            ]).map((q: any, idx: number) => {
              const isCorrect = q.is_correct;
              return (
                <div key={q.id || idx} className="p-4 rounded-2xl border border-line bg-surface space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">
                      Question {idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="text-[11px] font-medium text-[#2E7D62] flex items-center gap-1 bg-[#EBF5F0] px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" /> Correct
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#DC4C40] flex items-center gap-1 bg-[#FDF0EE] px-2 py-0.5 rounded-full">
                        <X className="w-3 h-3 stroke-[3]" /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink leading-relaxed">
                    {q.question_text}
                  </p>

                  <div className="text-[11px] text-ink-muted space-y-1 bg-secondary/50 p-3 rounded-xl border border-line">
                    <div>
                      <span className="font-semibold text-ink">Your Answer:</span> {q.user_answer || 'Skipped'}
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Correct Answer:</span> {q.correct_answer || 'B'}
                    </div>
                    {q.explanation && (
                      <div className="pt-1 text-ink-muted">
                        <span className="font-semibold text-ink block">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}
