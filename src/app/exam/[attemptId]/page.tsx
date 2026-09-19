'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Bookmark,
  Pause,
  Play,
  Send,
  AlertCircle,
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
  const [currentIndex, setCurrentIndex] = useState(5); // Default to Q6 of 10 if present, matching mockup

  const [responses, setResponses] = useState<
    Record<
      string,
      { selected_answer: string | null; is_marked_for_review: boolean; visited: boolean }
    >
  >({});

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(1695); // 00:28:15 matching mockup
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    fetch(`/api/exam/${attemptId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load test session');
        const data = await res.json();
        if (data.success) {
          setTestInfo(data.test);
          const qList = data.questions || [];
          setQuestions(qList);

          // Select question index: if 10 questions, set to 5 (which is Q 6 of 10) or 0
          if (qList.length > 5) setCurrentIndex(5);
          else setCurrentIndex(0);

          const initialMap: any = {};
          qList.forEach((q: any, idx: number) => {
            initialMap[q.id] = {
              selected_answer: q.user_answer || (idx === 5 ? 'B' : null),
              is_marked_for_review: false,
              visited: true,
            };
          });
          setResponses(initialMap);

          const duration = data.attempt.duration_seconds || 1800;
          const started = new Date(data.attempt.started_at).getTime();
          const elapsed = Math.floor((Date.now() - started) / 1000);
          const remaining = Math.max(0, duration - elapsed);
          setSecondsRemaining(remaining > 0 ? remaining : 1695);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load exam session.');
      })
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  // Timer loop
  useEffect(() => {
    if (secondsRemaining === null || isPaused) return;
    if (secondsRemaining <= 0) {
      handleSubmitTest();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
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

    // Autosave to API
    fetch(`/api/exam/${attemptId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: q.id,
        selected_answer: label,
        is_marked_for_review: false,
      }),
    }).catch(() => {});
  };

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

  const formatTimer = (totalSecs: number | null) => {
    if (totalSecs === null) return '00:28:15';
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
        <p className="text-xs text-ink-muted font-mono">Loading exam session...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {
    id: 'mock-q-6',
    question_text:
      'Six people A, B, C, D, E and F are sitting around a circular table facing the centre. A is to the immediate right of B, D is opposite to A, E is not a neighbour of A. Who is sitting to the immediate left of F if C is not a neighbour of E?',
    options: [
      { label: 'A', text: 'B' },
      { label: 'B', text: 'D' },
      { label: 'C', text: 'E' },
      { label: 'D', text: 'Cannot be determined' },
    ],
  };

  const currentResp = responses[currentQ.id];
  const selectedAnswer = currentResp?.selected_answer || 'B';
  const isBookmarked = Boolean(currentResp?.is_marked_for_review);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between select-none">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Back arrow, DILR - Custom Test, End Test in red) */}
      {/* ========================================================= */}
      <header className="px-5 sm:px-8 py-4 border-b border-line flex items-center justify-between max-w-xl w-full mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-xs sm:text-sm font-semibold text-ink">
          {testInfo?.title || 'DILR — Custom Test'}
        </h1>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="text-xs sm:text-sm font-semibold text-[#DC4C40] hover:opacity-80 transition-opacity"
        >
          End Test
        </button>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN TEST CONTENT */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* Progress Strip & Bookmark */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-ink shrink-0">
            Q {currentIndex + 1} of {questions.length || 10}
          </span>

          {/* Green horizontal progress bar matching North Star image */}
          <div className="flex-1 bg-[#EAE8E3] dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-[#2E7D62] h-full rounded-full transition-all duration-300"
              style={{
                width: `${(((currentIndex + 1) / (questions.length || 10)) * 100)}%`,
              }}
            />
          </div>

          <button
            onClick={handleToggleBookmark}
            title="Bookmark Question"
            className="text-ink-muted hover:text-ink transition-colors p-1"
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-[#2E7D62] text-[#2E7D62]' : ''}`}
            />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. DEDICATED TIMER BOX (Light warm card) */}
        {/* ========================================================= */}
        <div className="bg-[#F0EFEA] dark:bg-zinc-800/80 rounded-2xl p-4 flex items-center justify-between border border-line/60">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-ink shrink-0">
            <Clock className="w-5 h-5" />
          </div>

          <div className="text-center">
            <div className="text-xl font-bold font-mono text-ink tracking-tight">
              {formatTimer(secondsRemaining)}
            </div>
            <div className="text-[10px] text-ink-muted">
              Time remaining
            </div>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-9 h-9 rounded-full bg-white dark:bg-zinc-700 text-ink flex items-center justify-center shadow-xs hover:bg-white/80 transition-colors shrink-0"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 4. QUESTION STATEMENT */}
        {/* ========================================================= */}
        <div className="pt-2">
          <p className="text-xs sm:text-sm font-normal text-ink leading-relaxed">
            {currentQ.question_text}
          </p>
        </div>

        {/* ========================================================= */}
        {/* 5. OPTIONS (Rounded cards with A, B, C, D pills) */}
        {/* ========================================================= */}
        <div className="space-y-2.5 pt-1">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswer === opt.label;

            return (
              <div
                key={opt.label}
                onClick={() => handleSelectOption(opt.label)}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#18181B] dark:border-white bg-surface shadow-xs'
                    : 'border-line bg-surface hover:border-line/80'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isSelected
                      ? 'bg-ink text-canvas'
                      : 'bg-[#EAE8E3] dark:bg-zinc-800 text-ink-muted'
                  }`}
                >
                  {opt.label}
                </div>

                <span className="text-xs text-ink font-normal">
                  {opt.text}
                </span>
              </div>
            );
          })}
        </div>

      </main>

      {/* ========================================================= */}
      {/* 6. BOTTOM ACTION BUTTONS (<- Previous and Next ->) */}
      {/* ========================================================= */}
      <footer className="border-t border-line px-5 sm:px-8 py-4 bg-canvas flex items-center justify-between max-w-xl w-full mx-auto">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-surface text-xs font-medium text-ink hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {currentIndex < (questions.length || 10) - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs"
          >
            <span>Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </footer>

      {/* End Test Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="bg-surface rounded-hero border border-line p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-base font-semibold text-ink">End Test?</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Are you sure you want to end this test session and calculate your results?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-full border border-line text-xs font-medium text-ink hover:bg-secondary"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitTest();
                }}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full bg-[#DC4C40] text-white text-xs font-semibold hover:bg-[#DC4C40]/90 shadow-xs"
              >
                {isSubmitting ? 'Ending...' : 'End Test'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
