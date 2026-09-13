'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  RotateCcw,
  Send,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Check,
  X,
  Layers,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { QuestionPaletteState } from '@/lib/types';

interface ExamQuestion {
  id: string;
  question_number: number;
  original_question_number: number;
  question_text: string;
  question_image_url?: string | null;
  question_type: string;
  options: { label: string; text: string }[];
  correct_marks: number;
  negative_marks: number;
}

interface ExamTestInfo {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration_seconds: number;
  allow_navigation: boolean;
  show_palette: boolean;
  allow_review_marking: boolean;
  show_immediate_results: boolean;
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
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'answered' | 'unanswered' | 'marked'>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Exam Session
  useEffect(() => {
    // Check if we have cached start time or fetch attempt
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

    // Try to load attempt session from localStorage if present
    const localKey = `mocktest_attempt_${attemptId}`;
    const localData = localStorage.getItem(localKey);
    let cachedStartedAt: string | null = null;
    let initialResponses: any = {};

    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        cachedStartedAt = parsed.started_at;
        initialResponses = parsed.responses || {};
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.testInfo) setTestInfo(parsed.testInfo);
      } catch (e) {}
    }

    // Always fetch latest session details from backend
    fetch(`/api/tests`)
      .then((res) => res.json())
      .then((data) => {
        // If needed, check user session
      });

    // In our implementation, start API returned attemptId and initial payload.
    // If user refreshed directly, let's ensure we have questions from attempt result or test
    fetch(`/api/exam/${attemptId}/result`)
      .then((res) => res.json())
      .then((data) => {
        if (data.attempt) {
          const tInfo: ExamTestInfo = {
            id: data.attempt.test_id,
            title: data.attempt.test_title,
            description: data.attempt.description || '',
            subject: data.attempt.subject || '',
            duration_seconds: data.attempt.duration_seconds !== undefined ? Number(data.attempt.duration_seconds) : 1800,
            allow_navigation: true,
            show_palette: true,
            allow_review_marking: true,
            show_immediate_results: true,
          };
          setTestInfo(tInfo);

          // Strip solutions for exam view
          const cleanQuestions: ExamQuestion[] = (data.questions || []).map((q: any, i: number) => ({
            id: q.id,
            question_number: i + 1,
            original_question_number: q.question_number,
            question_text: q.question_text,
            question_image_url: q.question_image_url,
            question_type: q.question_type,
            options: q.options || [],
            correct_marks: q.correct_marks || 4,
            negative_marks: q.negative_marks || 1,
          }));

          setQuestions(cleanQuestions);

          // Populate existing answers
          const restoredResponses: typeof responses = { ...initialResponses };
          cleanQuestions.forEach((q, idx) => {
            if (!restoredResponses[q.id]) {
              const prevAns = (data.questions || [])[idx]?.user_answer;
              restoredResponses[q.id] = {
                selected_answer: prevAns || null,
                is_marked_for_review: false,
                visited: idx === 0,
              };
            }
          });
          setResponses(restoredResponses);

          // Calculate timer
          const duration = data.attempt.duration_seconds !== undefined ? Number(data.attempt.duration_seconds) : 1800;
          if (duration > 0) {
            const started = new Date(data.attempt.started_at).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - started) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            setSecondsRemaining(remaining);
            if (remaining <= 0) {
              setIsTimeUp(true);
            }
          } else {
            // Duration is 0 -> No Time Limit
            setSecondsRemaining(null);
          }
        }
      })
      .catch((err) => {
        console.error('Session load error:', err);
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

  // Submit test callback
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

      // Clear local storage cache
      localStorage.removeItem(`mocktest_attempt_${attemptId}`);
      router.push(`/exam/${attemptId}/result`);
    } catch (err: any) {
      alert('Error submitting test: ' + err.message);
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, responses, router]);

  // Timer Loop (Countdown if duration > 0, or Count-up if No Limit)
  useEffect(() => {
    if (secondsRemaining === null) {
      const elapsedInterval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(elapsedInterval);
    }

    if (secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining]);

  // Auto-submit when time expires
  useEffect(() => {
    if (isTimeUp && !isSubmitting) {
      handleSubmitTest();
    }
  }, [isTimeUp, isSubmitting, handleSubmitTest]);

  // Auto-save to server & local storage
  const saveAnswerToServer = (qId: string, answer: string | null, marked: boolean) => {
    // 1. Update local storage immediately
    const localKey = `mocktest_attempt_${attemptId}`;
    try {
      const current = JSON.parse(localStorage.getItem(localKey) || '{}');
      current.responses = {
        ...(current.responses || {}),
        [qId]: { selected_answer: answer, is_marked_for_review: marked, visited: true },
      };
      localStorage.setItem(localKey, JSON.stringify(current));
    } catch (e) {}

    // 2. Debounced save to server
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/exam/${attemptId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: qId,
          selected_answer: answer,
          is_marked_for_review: marked,
        }),
      }).catch(() => {});
    }, 300);
  };

  // Option selection
  const handleSelectOption = (label: string) => {
    if (isTimeUp || isSubmitting) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const currentResp = responses[currentQ.id];
    // If clicking same option, keep it or toggle
    const newSelected = currentResp?.selected_answer === label ? label : label;
    const isMarked = currentResp?.is_marked_for_review || false;

    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_answer: newSelected,
        is_marked_for_review: isMarked,
        visited: true,
      },
    }));

    saveAnswerToServer(currentQ.id, newSelected, isMarked);
  };

  // Clear current response
  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const isMarked = responses[currentQ.id]?.is_marked_for_review || false;
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_answer: null,
        is_marked_for_review: isMarked,
        visited: true,
      },
    }));

    saveAnswerToServer(currentQ.id, null, isMarked);
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const currentResp = responses[currentQ.id];
    const newMarked = !currentResp?.is_marked_for_review;
    const selected = currentResp?.selected_answer || null;

    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_answer: selected,
        is_marked_for_review: newMarked,
        visited: true,
      },
    }));

    saveAnswerToServer(currentQ.id, selected, newMarked);
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkAndNext = () => {
    const currentQ = questions[currentIndex];
    if (currentQ) {
      const currentResp = responses[currentQ.id];
      const selected = currentResp?.selected_answer || null;
      setResponses((prev) => ({
        ...prev,
        [currentQ.id]: {
          selected_answer: selected,
          is_marked_for_review: true,
          visited: true,
        },
      }));
      saveAnswerToServer(currentQ.id, selected, true);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Determine Question Palette State for each question
  const getQuestionState = (qId: string): QuestionPaletteState => {
    const resp = responses[qId];
    if (!resp || !resp.visited) return 'not_visited';
    if (resp.selected_answer && resp.is_marked_for_review) return 'answered_and_marked';
    if (resp.is_marked_for_review) return 'marked_for_review';
    if (resp.selected_answer) return 'answered';
    return 'visited_unanswered';
  };

  // Format timer display: HH:MM:SS (or Elapsed for no limit)
  const formatTimer = (totalSecs: number | null) => {
    if (totalSecs === null) {
      const hrs = Math.floor(elapsedSeconds / 3600);
      const mins = Math.floor((elapsedSeconds % 3600) / 60);
      const secs = elapsedSeconds % 60;
      return `Elapsed ${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Calculate Palette Counters
  const answeredCount = Object.values(responses).filter((r) => Boolean(r.selected_answer)).length;
  const markedCount = Object.values(responses).filter((r) => r.is_marked_for_review).length;
  const unansweredVisitedCount = Object.values(responses).filter((r) => r.visited && !r.selected_answer).length;
  const notVisitedCount = questions.length - Object.values(responses).filter((r) => r.visited).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Initializing Examination Environment...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentResp = currentQ ? responses[currentQ.id] : null;
  const isTimeLow = secondsRemaining !== null && secondsRemaining <= 300; // < 5 mins
  const isTimeCritical = secondsRemaining !== null && secondsRemaining <= 60; // < 1 min

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-100/80 pb-20 lg:pb-6">
      {/* EXAM STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h1 className="font-bold text-xs sm:text-base tracking-tight truncate max-w-[130px] sm:max-w-md">
            {testInfo?.title || 'Mock Examination'}
          </h1>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
            {questions.length} Questions
          </span>
        </div>

        {/* Right side: Timer & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Real-time Persistent Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black transition-all ${
              isTimeCritical
                ? 'bg-rose-600 text-white animate-bounce'
                : isTimeLow
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-blue-400 border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER PROGRESS STRIP */}
      <div className="bg-white border-b border-slate-200/80 px-3.5 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-bold text-slate-900">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
            +{currentQ?.correct_marks || 4} / -{currentQ?.negative_marks || 1}
          </span>
        </div>

        {/* Mobile quick palette trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobilePalette(true)}
            className="lg:hidden px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 border border-slate-300"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            <span>Palette ({answeredCount}/{questions.length})</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 font-medium text-[11px]">
            <span className="text-emerald-700 font-bold">{answeredCount} Answered</span>
            <span className="text-amber-700">{unansweredVisitedCount} Unanswered</span>
            <span className="text-purple-700">{markedCount} Review</span>
            <span className="text-slate-400">{notVisitedCount} Left</span>
          </div>
        </div>
      </div>

      {/* MAIN EXAM BODY (Split: Question View + Desktop Palette Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* LEFT / CENTER: QUESTION DISPLAY (Span 3 on desktop) */}
        <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm flex flex-col min-h-[480px] sm:min-h-[560px] justify-between overflow-hidden">
          {/* Question Text Area */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            <div className="flex items-start justify-between gap-3">
              <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-lg font-mono shadow-2xs">
                Question {currentQ?.question_number || currentIndex + 1}
              </span>
              {currentResp?.is_marked_for_review && (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1 border border-amber-300">
                  <Flag className="w-3 h-3 text-amber-600" /> Marked for Review
                </span>
              )}
            </div>

            <div className="text-sm sm:text-base md:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQ?.question_text}
            </div>

            {/* Optional Question Image */}
            {currentQ?.question_image_url && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQ.question_image_url}
                  alt="Question illustration"
                  className="w-full h-auto object-contain"
                />
              </div>
            )}

            {/* MCQ Options List */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              {(currentQ?.options || []).map((opt) => {
                const isSelected = currentResp?.selected_answer === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 sm:gap-4 active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <span
                      className={`text-xs sm:text-sm md:text-base leading-relaxed ${
                        isSelected ? 'font-bold text-slate-950' : 'text-slate-800'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESKTOP / TABLET CONTROLS & NAVIGATION BAR */}
          <div className="hidden sm:flex p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!currentResp?.selected_answer}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
              >
                Clear Response
              </button>

              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  currentResp?.is_marked_for_review
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {currentResp?.is_marked_for_review ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-40 flex items-center gap-1 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleMarkAndNext}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
              >
                Mark & Next
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DESKTOP 5-STATE QUESTION PALETTE SIDEBAR (Hidden on mobile, visible lg:) */}
        <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {answeredCount}/{questions.length}
            </span>
          </div>

          {/* Palette Status Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                {answeredCount}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                {unansweredVisitedCount}
              </span>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                {markedCount}
              </span>
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                {notVisitedCount}
              </span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Jump Bubble Grid */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Jump Directly to Question:
            </span>
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const state = getQuestionState(q.id);
                const isCurrent = currentIndex === idx;

                let styleClass = 'bg-slate-100 text-slate-600 border border-slate-200'; // not visited
                if (state === 'answered') {
                  styleClass = 'bg-emerald-600 text-white font-bold shadow-xs';
                } else if (state === 'visited_unanswered') {
                  styleClass = 'bg-amber-500 text-white font-bold shadow-xs';
                } else if (state === 'marked_for_review') {
                  styleClass = 'bg-purple-600 text-white font-bold shadow-xs';
                } else if (state === 'answered_and_marked') {
                  styleClass = 'bg-purple-600 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${styleClass} ${
                      isCurrent ? 'ring-2 ring-slate-900 ring-offset-2 scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {idx + 1}
                    {state === 'answered_and_marked' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Test CTA in desktop palette */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Complete & Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM DOCK (Visible only on smartphone screens < sm:) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-30 flex items-center justify-between gap-1.5 shadow-xl pb-safe">
        <button
          type="button"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
          aria-label="Previous Question"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleToggleMarkForReview}
          className={`p-2 rounded-xl border transition-all ${
            currentResp?.is_marked_for_review
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-slate-50 text-amber-700 border-slate-200'
          }`}
          title="Mark for Review"
        >
          <Flag className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setShowMobilePalette(true)}
          className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <LayoutGrid className="w-4 h-4 text-blue-600" />
          <span>Palette ({answeredCount}/{questions.length})</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndNext}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1"
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* MOBILE QUESTION PALETTE BOTTOM SHEET (SLIDE-UP DRAWER) */}
      {showMobilePalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl max-h-[82dvh] overflow-y-auto space-y-4 animate-slide-up pb-safe">
            {/* Drawer handle & header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 mb-3" />
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Question Palette</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {answeredCount}/{questions.length}
                  </span>
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Legend Counters */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                  {unansweredVisitedCount}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-900">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  {markedCount}
                </span>
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-xs">
                  {notVisitedCount}
                </span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Questions Number Grid */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tap any question to jump:
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-1">
                {questions.map((q, idx) => {
                  const state = getQuestionState(q.id);
                  const isCurrent = currentIndex === idx;

                  let styleClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                  if (state === 'answered') {
                    styleClass = 'bg-emerald-600 text-white font-bold';
                  } else if (state === 'visited_unanswered') {
                    styleClass = 'bg-amber-500 text-white font-bold';
                  } else if (state === 'marked_for_review') {
                    styleClass = 'bg-purple-600 text-white font-bold';
                  } else if (state === 'answered_and_marked') {
                    styleClass = 'bg-purple-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobilePalette(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center active:scale-95 ${styleClass} ${
                        isCurrent ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                      {state === 'answered_and_marked' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button inside drawer */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setShowMobilePalette(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Confirm Test Submission</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to submit? Once submitted, your answers will be evaluated server-side against the answer key.
              </p>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 divide-y divide-slate-200/80 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Total Questions</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-emerald-700 font-semibold">Answered</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-amber-700 font-semibold">Unanswered</span>
                <span className="font-bold text-amber-700">
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-purple-700 font-semibold">Marked for Review</span>
                <span className="font-bold text-purple-700">{markedCount}</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                ⚠️ You still have {questions.length - answeredCount} unanswered questions.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Yes, Submit Test
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
