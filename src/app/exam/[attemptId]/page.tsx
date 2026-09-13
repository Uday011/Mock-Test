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
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-indigo-100">
      {/* EXAM STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="font-bold text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-md">
            {testInfo?.title || 'Mock Examination'}
          </h1>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
            {questions.length} Questions
          </span>
        </div>

        {/* Right side: Timer & Action */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Real-time Persistent Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black transition-all ${
              isTimeCritical
                ? 'bg-rose-600 text-white animate-bounce'
                : isTimeLow
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-indigo-400 border border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER PROGRESS STRIP */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-900">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            +{currentQ?.correct_marks || 4} Marks / -{currentQ?.negative_marks || 1} Negative
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 font-medium">
          <span className="text-emerald-600 font-bold">{answeredCount} Answered</span>
          <span className="text-amber-600">{unansweredVisitedCount} Visited Unanswered</span>
          <span className="text-purple-600">{markedCount} Marked Review</span>
          <span className="text-slate-400">{notVisitedCount} Not Visited</span>
        </div>
      </div>

      {/* MAIN EXAM BODY (Split: Question View + Palette Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT / CENTER: QUESTION DISPLAY (Span 3 on desktop) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[540px] justify-between overflow-hidden">
          {/* Question Text Area */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-sm rounded-lg border border-indigo-200 font-mono">
                Q.{currentQ?.question_number || currentIndex + 1}
              </span>
              {currentResp?.is_marked_for_review && (
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-full flex items-center gap-1 border border-purple-300">
                  <Flag className="w-3 h-3 text-purple-600" /> Marked for Review
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line">
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
            <div className="space-y-3 pt-2">
              {(currentQ?.options || []).map((opt) => {
                const isSelected = currentResp?.selected_answer === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <span
                      className={`text-sm sm:text-base leading-relaxed ${
                        isSelected ? 'font-bold text-indigo-950' : 'text-slate-800'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CONTROLS & NAVIGATION BAR */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
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
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
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
                className="hidden sm:flex px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors"
              >
                Mark & Next
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1 transition-all"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: 5-STATE QUESTION PALETTE SIDEBAR */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
              {answeredCount}/{questions.length}
            </span>
          </div>

          {/* Palette Status Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                {answeredCount}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                {unansweredVisitedCount}
              </span>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
              <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                {markedCount}
              </span>
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
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
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {idx + 1}
                    {/* Badge indicator for answered & marked */}
                    {state === 'answered_and_marked' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Test CTA in palette */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Complete & Submit Test
            </button>
          </div>
        </div>
      </div>

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
