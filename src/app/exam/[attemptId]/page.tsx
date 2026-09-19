'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
  Check,
  AlertCircle,
  LayoutGrid,
  X,
  Send,
} from 'lucide-react';

interface ExamQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_image_url?: string | null;
  question_type: string;
  options: { label: string; text: string }[];
  correct_marks: number;
  negative_marks: number;
  subject?: string;
  section_name?: string;
  topic_id?: string;
}

interface ExamTestInfo {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration_seconds: number;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testInfo, setTestInfo] = useState<ExamTestInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User responses: question_id -> { selected_answer, is_marked_for_review, visited }
  const [responses, setResponses] = useState<
    Record<
      string,
      { selected_answer: string | null; is_marked_for_review: boolean; visited: boolean }
    >
  >({});

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Exam Session
  useEffect(() => {
    fetch(`/api/exam/${attemptId}/result`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.attempt?.status === 'completed') {
            router.push(`/exam/${attemptId}/result`);
            return;
          }
        }
      })
      .catch(() => {});

    // Fetch attempt details
    fetch(`/api/exam/${attemptId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load test session');
        const data = await res.json();
        if (data.success) {
          setTestInfo(data.test);
          setQuestions(data.questions || []);

          // Initialize responses
          const initialMap: any = {};
          (data.questions || []).forEach((q: any, idx: number) => {
            initialMap[q.id] = {
              selected_answer: q.user_answer || null,
              is_marked_for_review: false,
              visited: idx === 0,
            };
          });
          setResponses(initialMap);

          // Timer calculation
          const duration = data.attempt.duration_seconds || 1800;
          const started = new Date(data.attempt.started_at).getTime();
          const elapsed = Math.floor((Date.now() - started) / 1000);
          const remaining = Math.max(0, duration - elapsed);
          setSecondsRemaining(remaining);
        }
      })
      .catch((err) => {
        console.error('Session load error:', err);
        setError('Failed to load exam session.');
      })
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  // Mark current question as visited
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      setResponses((prev) => {
        if (!prev[qId]?.visited) {
          return {
            ...prev,
            [qId]: {
              selected_answer: prev[qId]?.selected_answer || null,
              is_marked_for_review: prev[qId]?.is_marked_for_review || false,
              visited: true,
            },
          };
        }
        return prev;
      });
    }
  }, [currentIndex, questions]);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining === null || isPaused) return;

    if (secondsRemaining <= 0) {
      setIsTimeUp(true);
      handleSubmitTest();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimeUp(true);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining, isPaused]);

  // Handle Option Select
  const handleSelectOption = (label: string) => {
    const q = questions[currentIndex];
    if (!q) return;

    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        selected_answer: prev[q.id]?.selected_answer === label ? null : label,
        visited: true,
      },
    }));
  };

  // Toggle Bookmark for Review
  const handleToggleBookmark = () => {
    const q = questions[currentIndex];
    if (!q) return;

    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        is_marked_for_review: !prev[q.id]?.is_marked_for_review,
      },
    }));
  };

  // Submit test
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersPayload = Object.entries(responses).map(([qId, r]) => ({
        question_id: qId,
        selected_answer: r.selected_answer,
        is_marked_for_review: r.is_marked_for_review,
      }));

      const res = await fetch(`/api/exam/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      router.push(`/exam/${attemptId}/result`);
    } catch (err: any) {
      alert('Error submitting test: ' + err.message);
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, responses, router]);

  // Format Seconds to HH:MM:SS
  const formatTimer = (totalSecs: number | null) => {
    if (totalSecs === null) return '00:30:00';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-ink space-y-3">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-ink-muted font-mono">Loading distraction-free test...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-ink p-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-coral mx-auto" />
        <p className="text-sm font-medium">{error || 'No questions available in this test.'}</p>
        <button
          onClick={() => router.push('/tests')}
          className="px-4 py-2 bg-ink text-canvas rounded-full text-xs font-semibold"
        >
          Return to Tests
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentResp = responses[currentQ.id];
  const isBookmarked = Boolean(currentResp?.is_marked_for_review);
  const answeredCount = Object.values(responses).filter((r) => Boolean(r.selected_answer)).length;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between select-none">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Title on left, End Test in red on right) */}
      {/* ========================================================= */}
      <header className="px-5 sm:px-8 py-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-ink truncate">
            {testInfo?.title || 'DILR - Custom Test'}
          </h1>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="text-xs sm:text-sm font-semibold text-coral hover:opacity-80 transition-opacity"
        >
          End Test
        </button>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN TEST CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        
        {/* Progress Strip & Bookmark */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xs font-semibold text-ink shrink-0">
              Q {currentIndex + 1} of {questions.length}
            </span>

            {/* Horizontal Progress Bar */}
            <div className="flex-1 bg-line/60 rounded-full h-1 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Bookmark toggle */}
          <button
            onClick={handleToggleBookmark}
            title="Bookmark Question"
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked ? 'text-accent bg-accent/10' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-accent' : ''}`} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. DEDICATED TIMER BOX */}
        {/* ========================================================= */}
        <div className="bg-surface border border-line rounded-hero p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-ink-muted">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-ink tracking-tight">
                {formatTimer(secondsRemaining)}
              </div>
              <div className="text-[11px] text-ink-muted">
                Time remaining
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Timer' : 'Pause Timer'}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-muted hover:text-ink hover:bg-secondary transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 4. QUESTION STATEMENT */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-2">
          <p className="text-sm sm:text-base font-normal text-ink leading-relaxed whitespace-pre-line">
            {currentQ.question_text}
          </p>

          {currentQ.question_image_url && (
            <div className="rounded-card overflow-hidden border border-line my-3">
              <img
                src={currentQ.question_image_url}
                alt="Question Diagram"
                className="max-h-64 mx-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. OPTIONS AS CLEAN BORDER CARDS */}
        {/* ========================================================= */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map((option) => {
            const isSelected = currentResp?.selected_answer === option.label;

            return (
              <div
                key={option.label}
                onClick={() => handleSelectOption(option.label)}
                className={`flex items-center gap-3.5 p-3.5 rounded-card border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-ink bg-surface shadow-xs'
                    : 'border-line bg-surface hover:border-line/80'
                }`}
              >
                {/* Letter Circle Pill */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-ink text-canvas'
                      : 'border border-line bg-secondary text-ink-muted'
                  }`}
                >
                  {option.label}
                </div>

                {/* Option Text */}
                <div className="text-xs sm:text-sm font-normal text-ink leading-normal">
                  {option.text}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* ========================================================= */}
      {/* 6. BOTTOM ACTION BAR (< Previous and Next >) */}
      {/* ========================================================= */}
      <footer className="border-t border-line px-5 sm:px-8 py-3.5 bg-surface/90 backdrop-blur-md flex items-center justify-between max-w-xl w-full mx-auto">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-xs font-medium text-ink hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Quick Palette Button */}
        <button
          onClick={() => setShowPaletteDrawer(true)}
          className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
        >
          {answeredCount}/{questions.length} answered
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs"
          >
            <span>Finish</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </footer>

      {/* ========================================================= */}
      {/* QUESTION PALETTE DRAWER */}
      {/* ========================================================= */}
      {showPaletteDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowPaletteDrawer(false)}
          />
          <div className="relative bg-surface rounded-t-2xl border-t border-line p-5 max-w-md w-full mx-auto max-h-[70vh] overflow-y-auto space-y-4 animate-slide-up z-10 shadow-2xl">
            <div className="w-10 h-1 bg-line rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="text-sm font-semibold text-ink">Question Palette</h3>
              <button
                onClick={() => setShowPaletteDrawer(false)}
                className="p-1 text-ink-muted hover:text-ink rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const resp = responses[q.id];
                const isAns = Boolean(resp?.selected_answer);
                const isMark = Boolean(resp?.is_marked_for_review);
                const isCurr = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPaletteDrawer(false);
                    }}
                    className={`h-10 rounded-control font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                      isCurr
                        ? 'border-2 border-accent text-accent font-bold'
                        : isAns
                        ? 'bg-ink text-canvas'
                        : isMark
                        ? 'bg-lavender/20 text-lavender border border-lavender/40'
                        : 'bg-secondary text-ink-muted border border-line'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* END TEST CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="bg-surface rounded-hero border border-line p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-base font-semibold text-ink">End Test?</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              You have answered {answeredCount} of {questions.length} questions. Are you sure you want to end the test and calculate your final score?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 rounded-full border border-line text-xs font-medium text-ink hover:bg-secondary"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitTest();
                }}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-full bg-coral text-white text-xs font-semibold hover:bg-coral/90 shadow-xs"
              >
                {isSubmitting ? 'Ending...' : 'End & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
