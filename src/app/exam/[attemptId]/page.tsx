'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Info,
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
  const [paletteSectionFilter, setPaletteSectionFilter] = useState<'all' | string>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Exam Session
  useEffect(() => {
    // Check if attempt is already completed
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

    // Try to restore from localStorage if present
    const localKey = `nalanda_attempt_${attemptId}`;
    const localData = localStorage.getItem(localKey);
    let initialResponses: any = {};

    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        initialResponses = parsed.responses || {};
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.testInfo) setTestInfo(parsed.testInfo);
      } catch (e) {}
    }

    // Always fetch official session details from backend
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

          // Prepare questions for exam mode (sanitize solutions)
          const cleanQuestions: ExamQuestion[] = (data.questions || []).map((q: any, i: number) => ({
            id: q.id,
            question_number: i + 1,
            original_question_number: q.question_number,
            question_text: q.question_text,
            question_image_url: q.question_image_url,
            question_type: q.question_type,
            options: q.options || [],
            correct_marks: q.correct_marks || 2,
            negative_marks: q.negative_marks || 0.5,
            subject: q.subject || data.attempt.subject || 'General',
            section_name: q.section_name || q.subject || data.attempt.subject || 'General Section',
            topic_id: q.topic_id,
          }));

          setQuestions(cleanQuestions);

          // Populate responses
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

          // Calculate remaining timer
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
      localStorage.removeItem(`nalanda_attempt_${attemptId}`);
      router.push(`/exam/${attemptId}/result`);
    } catch (err: any) {
      alert('Error submitting examination: ' + err.message);
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, responses, router]);

  // Timer loop
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

  // Auto-submit when time runs out
  useEffect(() => {
    if (isTimeUp && !isSubmitting) {
      handleSubmitTest();
    }
  }, [isTimeUp, isSubmitting, handleSubmitTest]);

  // Autosave to server & local storage
  const saveAnswerToServer = (qId: string, answer: string | null, marked: boolean) => {
    // 1. Update local storage immediately
    const localKey = `nalanda_attempt_${attemptId}`;
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

  // Format timer display: HH:MM:SS
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

  // Extract distinct sections for Section Switcher
  const sections = useMemo(() => {
    const list: { name: string; count: number; firstIndex: number }[] = [];
    questions.forEach((q, idx) => {
      const sName = q.section_name || q.subject || testInfo?.subject || 'General Section';
      const existing = list.find((s) => s.name === sName);
      if (existing) {
        existing.count += 1;
      } else {
        list.push({ name: sName, count: 1, firstIndex: idx });
      }
    });
    return list;
  }, [questions, testInfo?.subject]);

  const currentQ = questions[currentIndex];
  const currentResp = currentQ ? responses[currentQ.id] : null;
  const currentSectionName = currentQ?.section_name || currentQ?.subject || testInfo?.subject || 'General Section';

  // Calculate Palette Counters
  const answeredCount = Object.values(responses).filter((r) => Boolean(r.selected_answer)).length;
  const markedCount = Object.values(responses).filter((r) => r.is_marked_for_review).length;
  const unansweredVisitedCount = Object.values(responses).filter((r) => r.visited && !r.selected_answer).length;
  const notVisitedCount = questions.length - Object.values(responses).filter((r) => r.visited).length;

  const isTimeLow = secondsRemaining !== null && secondsRemaining <= 300; // < 5 mins
  const isTimeCritical = secondsRemaining !== null && secondsRemaining <= 60; // < 1 min

  // Filtered questions for palette jump list
  const paletteQuestions = useMemo(() => {
    if (paletteSectionFilter === 'all') return questions.map((q, i) => ({ q, index: i }));
    return questions
      .map((q, i) => ({ q, index: i }))
      .filter(({ q }) => (q.section_name || q.subject || testInfo?.subject) === paletteSectionFilter);
  }, [questions, paletteSectionFilter, testInfo?.subject]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white space-y-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-stone-300">
          Initializing Examination Environment...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#fcfbf9] pb-20 lg:pb-6 text-stone-900 select-none">
      {/* EXAM STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-stone-950 text-white border-b border-stone-800 shadow-md px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-xs sm:text-base tracking-tight truncate max-w-[160px] sm:max-w-md">
              {testInfo?.title || 'Examination Workspace'}
            </h1>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              Nalanda CBE Engine • {questions.length} Total MCQs
            </span>
          </div>
        </div>

        {/* Right side: Timer & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Real-time Persistent Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all ${
              isTimeCritical
                ? 'bg-rose-600 text-white animate-bounce shadow-md'
                : isTimeLow
                ? 'bg-amber-500 text-stone-950 font-black'
                : 'bg-stone-900 text-amber-400 border border-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors hidden md:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 min-h-[38px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </header>

      {/* SECTION SWITCHER BAR (Crucial for SSC CGL / Multidisciplinary Tests) */}
      {sections.length > 1 && (
        <div className="bg-white border-b border-stone-200 px-3.5 sm:px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 shrink-0 mr-1.5">
            Sections:
          </span>
          {sections.map((sec) => {
            const isActive = sec.name === currentSectionName;
            return (
              <button
                key={sec.name}
                onClick={() => setCurrentIndex(sec.firstIndex)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs font-bold'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                <span>{sec.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {sec.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* SUB-HEADER PROGRESS STRIP */}
      <div className="bg-stone-50 border-b border-stone-200 px-3.5 sm:px-6 py-2 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-bold text-stone-900 font-mono">
            Q {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-stone-500 font-serif italic hidden md:inline">
            [{currentSectionName}]
          </span>
          <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-mono">
            +{currentQ?.correct_marks || 2} / -{currentQ?.negative_marks || 0.5} Marks
          </span>
        </div>

        {/* Mobile quick palette trigger & Desktop summary counters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobilePalette(true)}
            className="lg:hidden px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-800 font-bold text-[11px] flex items-center gap-1.5 border border-stone-300 shadow-2xs min-h-[32px]"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>Palette ({answeredCount}/{questions.length})</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 font-medium text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              {answeredCount} Answered
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {unansweredVisitedCount} Unanswered
            </span>
            <span className="text-purple-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              {markedCount} Review
            </span>
            <span className="text-stone-400 font-mono">
              {notVisitedCount} Left
            </span>
          </div>
        </div>
      </div>

      {/* MAIN EXAM BODY (Split: Question View + Desktop Palette Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* LEFT / CENTER: QUESTION DISPLAY (Span 3 on desktop) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col min-h-[500px] justify-between overflow-hidden">
          {/* Question Text Area */}
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-stone-900 text-white font-bold text-xs sm:text-sm rounded-lg font-mono shadow-2xs">
                  Question {currentQ?.question_number || currentIndex + 1}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {currentQ?.question_type === 'single' ? 'Single Choice MCQ' : 'Multiple Choice'}
                </span>
              </div>

              {currentResp?.is_marked_for_review && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-lg flex items-center gap-1 border border-purple-200">
                  <Flag className="w-3.5 h-3.5 text-purple-600" /> Marked for Review
                </span>
              )}
            </div>

            {/* Question Text with refined typography */}
            <div className="text-sm sm:text-base md:text-lg font-medium text-stone-900 leading-relaxed whitespace-pre-line">
              {currentQ?.question_text}
            </div>

            {/* Optional Question Image */}
            {currentQ?.question_image_url && (
              <div className="rounded-xl overflow-hidden border border-stone-200 max-h-80 max-w-md bg-stone-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQ.question_image_url}
                  alt="Question Diagram"
                  className="w-full h-auto object-contain max-h-72 rounded-lg"
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
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 sm:gap-4 active:scale-[0.99] min-h-[48px] ${
                      isSelected
                        ? 'border-stone-900 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 font-mono transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <span
                      className={`text-xs sm:text-sm md:text-base leading-relaxed ${
                        isSelected ? 'font-bold text-stone-950' : 'text-stone-800'
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
          <div className="hidden sm:flex p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!currentResp?.selected_answer}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 disabled:opacity-35 transition-colors min-h-[40px]"
              >
                Clear Response
              </button>

              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[40px] ${
                  currentResp?.is_marked_for_review
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
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
                className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold disabled:opacity-35 flex items-center gap-1 shadow-xs min-h-[40px]"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleMarkAndNext}
                className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors min-h-[40px]"
              >
                Mark & Next
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all min-h-[40px]"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DESKTOP 5-STATE QUESTION PALETTE SIDEBAR */}
        <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5 font-serif">
              <Layers className="w-4 h-4 text-amber-700" />
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-stone-900 font-bold bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
              {answeredCount}/{questions.length}
            </span>
          </div>

          {/* Section Filter Dropdown / Buttons if multiple sections */}
          {sections.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={paletteSectionFilter}
                onChange={(e) => setPaletteSectionFilter(e.target.value)}
                className="w-full text-xs font-medium py-1.5 px-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="all">Filter: All Sections ({questions.length})</option>
                {sections.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Palette Status Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-stone-700">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {answeredCount}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {unansweredVisitedCount}
              </span>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {markedCount}
              </span>
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px] font-mono">
                {notVisitedCount}
              </span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Jump Bubble Grid */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Jump To Question:
            </span>
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {paletteQuestions.map(({ q, index }) => {
                const state = getQuestionState(q.id);
                const isCurrent = currentIndex === index;

                let styleClass = 'bg-stone-100 text-stone-600 border border-stone-200';
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
                    onClick={() => setCurrentIndex(index)}
                    className={`h-9 rounded-xl text-xs font-mono font-bold transition-all relative flex items-center justify-center ${styleClass} ${
                      isCurrent ? 'ring-2 ring-stone-900 ring-offset-2 scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {index + 1}
                    {state === 'answered_and_marked' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Test CTA */}
          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              Complete & Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM DOCK (Visible on < sm: screens) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 z-30 flex items-center justify-between gap-1.5 shadow-xl pb-safe">
        <button
          type="button"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 disabled:opacity-35 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous Question"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleToggleMarkForReview}
          className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            currentResp?.is_marked_for_review
              ? 'bg-purple-600 text-white border-purple-700'
              : 'bg-stone-50 text-purple-700 border-stone-200'
          }`}
          title="Mark for Review"
        >
          <Flag className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setShowMobilePalette(true)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-300 text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs min-h-[44px]"
        >
          <LayoutGrid className="w-4 h-4 text-amber-600" />
          <span>Palette ({answeredCount}/{questions.length})</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndNext}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm flex items-center gap-1 min-h-[44px]"
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* MOBILE QUESTION PALETTE BOTTOM SHEET (SLIDE-UP DRAWER) */}
      {showMobilePalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-3xl border-t border-stone-200 p-5 shadow-2xl max-h-[82dvh] overflow-y-auto space-y-4 pb-safe">
            {/* Drawer handle & header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-stone-300 mb-3" />
              <div className="w-full flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-amber-700" />
                  <h3 className="text-sm font-serif font-bold text-stone-900">Question Palette</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                    {answeredCount}/{questions.length}
                  </span>
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Legend Counters */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-mono font-bold flex items-center justify-center text-xs">
                  {unansweredVisitedCount}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-900">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                  {markedCount}
                </span>
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
                <span className="w-6 h-6 rounded-lg bg-stone-300 text-stone-800 font-mono font-bold flex items-center justify-center text-xs">
                  {notVisitedCount}
                </span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Questions Number Grid */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Tap Any Question to Navigate:
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-1">
                {questions.map((q, idx) => {
                  const state = getQuestionState(q.id);
                  const isCurrent = currentIndex === idx;

                  let styleClass = 'bg-stone-100 text-stone-600 border border-stone-200';
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
                      className={`h-11 rounded-xl text-xs font-mono font-bold transition-all relative flex items-center justify-center active:scale-95 ${styleClass} ${
                        isCurrent ? 'ring-2 ring-stone-900 ring-offset-2' : ''
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
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                Proceed to Submit Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">Confirm Test Submission</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you ready to submit your test? Once confirmed, your answers will be evaluated server-side against the official answer key and recorded to your learning pathway.
              </p>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 divide-y divide-stone-200/80 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-stone-600 font-medium">Total Questions</span>
                <span className="font-bold font-mono text-stone-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-emerald-700 font-semibold">Answered</span>
                <span className="font-bold font-mono text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-amber-700 font-semibold">Unanswered</span>
                <span className="font-bold font-mono text-amber-700">
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-purple-700 font-semibold">Marked for Review</span>
                <span className="font-bold font-mono text-purple-700">{markedCount}</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-rose-700 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                ⚠️ You still have {questions.length - answeredCount} unanswered questions remaining.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors min-h-[44px]"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Yes, Submit Now
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
