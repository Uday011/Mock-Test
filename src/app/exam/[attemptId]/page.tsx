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
  Check,
  X,
  Layers,
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
    const localKey = `nalanda_attempt_${attemptId}`;
    try {
      const current = JSON.parse(localStorage.getItem(localKey) || '{}');
      current.responses = {
        ...(current.responses || {}),
        [qId]: { selected_answer: answer, is_marked_for_review: marked, visited: true },
      };
      localStorage.setItem(localKey, JSON.stringify(current));
    } catch (e) {}

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

  // Determine Question Palette State
  const getQuestionState = (qId: string): QuestionPaletteState => {
    const resp = responses[qId];
    if (!resp || !resp.visited) return 'not_visited';
    if (resp.selected_answer && resp.is_marked_for_review) return 'answered_and_marked';
    if (resp.is_marked_for_review) return 'marked_for_review';
    if (resp.selected_answer) return 'answered';
    return 'visited_unanswered';
  };

  // Format timer display
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

  // Extract sections
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

  // Palette Counters
  const answeredCount = Object.values(responses).filter((r) => Boolean(r.selected_answer)).length;
  const markedCount = Object.values(responses).filter((r) => r.is_marked_for_review).length;
  const unansweredVisitedCount = Object.values(responses).filter((r) => r.visited && !r.selected_answer).length;
  const notVisitedCount = questions.length - Object.values(responses).filter((r) => r.visited).length;

  const isTimeLow = secondsRemaining !== null && secondsRemaining <= 300; // < 5 mins
  const isTimeCritical = secondsRemaining !== null && secondsRemaining <= 60; // < 1 min

  // Filtered questions for palette
  const paletteQuestions = useMemo(() => {
    if (paletteSectionFilter === 'all') return questions.map((q, i) => ({ q, index: i }));
    return questions
      .map((q, i) => ({ q, index: i }))
      .filter(({ q }) => (q.section_name || q.subject || testInfo?.subject) === paletteSectionFilter);
  }, [questions, paletteSectionFilter, testInfo?.subject]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] text-[#37352f] space-y-3">
        <div className="w-8 h-8 border-2 border-[#37352f] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#787774] font-medium">
          Initializing Examination Environment...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#fbfbfa] pb-20 lg:pb-6 text-[#37352f] select-none">
      {/* NOTION EXAM STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#2f2d28] text-white border-b border-[#3e3b35] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold text-xs sm:text-sm tracking-tight truncate max-w-[180px] sm:max-w-md text-white">
              {testInfo?.title || 'Examination Workspace'}
            </h1>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              CBT Engine • {questions.length} MCQs
            </span>
          </div>
        </div>

        {/* Right side: Timer & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-mono text-xs font-semibold transition-colors ${
              isTimeCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : isTimeLow
                ? 'bg-amber-600 text-white'
                : 'bg-stone-800 text-amber-300 border border-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-[4px] transition-colors hidden md:block"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-[4px] text-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* SECTION SWITCHER BAR */}
      {sections.length > 1 && (
        <div className="bg-white border-b border-[#ebebeb] px-4 sm:px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-semibold text-[#787774] shrink-0 mr-1">
            Sections:
          </span>
          {sections.map((sec) => {
            const isActive = sec.name === currentSectionName;
            return (
              <button
                key={sec.name}
                onClick={() => setCurrentIndex(sec.firstIndex)}
                className={`px-2.5 py-1 rounded-[4px] text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#37352f] text-white font-medium'
                    : 'bg-[#f7f6f3] text-[#787774] hover:text-[#37352f] hover:bg-[#ebebeb] border border-[#ebebeb]'
                }`}
              >
                <span>{sec.name}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded-[2px] ${
                    isActive ? 'bg-[#22211e] text-stone-300' : 'bg-[#ebebeb] text-[#787774]'
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
      <div className="bg-[#fcfbf9] border-b border-[#ebebeb] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#787774]">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-semibold text-[#37352f] font-mono">
            Q {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-[#787774] hidden md:inline">
            [{currentSectionName}]
          </span>
          <span className="text-[#1e6074] bg-[#edf6f9] px-1.5 py-0.5 rounded-[3px] border border-[#cbe4eb] text-[10px] font-mono font-medium">
            +{currentQ?.correct_marks || 2} / -{currentQ?.negative_marks || 0.5} Marks
          </span>
        </div>

        {/* Mobile quick palette trigger & Desktop summary counters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobilePalette(true)}
            className="lg:hidden px-2 py-1 rounded-[4px] bg-white hover:bg-[#f7f6f3] text-[#37352f] text-xs font-medium flex items-center gap-1 border border-[#ebebeb]"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#787774]" />
            <span>Palette ({answeredCount}/{questions.length})</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {answeredCount} Answered
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {unansweredVisitedCount} Unanswered
            </span>
            <span className="text-purple-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              {markedCount} Review
            </span>
            <span className="text-[#787774] font-mono">
              {notVisitedCount} Left
            </span>
          </div>
        </div>
      </div>

      {/* MAIN EXAM BODY (Split: Question View + Desktop Palette Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* LEFT / CENTER: QUESTION DISPLAY (Span 3 on desktop) */}
        <div className="lg:col-span-3 bg-white rounded-md border border-[#ebebeb] flex flex-col min-h-[480px] justify-between overflow-hidden">
          {/* Question Text Area */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#37352f] text-white text-xs font-medium rounded-[3px] font-mono">
                  Question {currentQ?.question_number || currentIndex + 1}
                </span>
                <span className="text-xs text-[#787774]">
                  {currentQ?.question_type === 'single' ? 'Single Choice MCQ' : 'Multiple Choice'}
                </span>
              </div>

              {currentResp?.is_marked_for_review && (
                <span className="px-2 py-0.5 bg-[#fbf3db] text-[#4d3800] text-xs font-medium rounded-[3px] flex items-center gap-1 border border-[#f1e0b5]">
                  <Flag className="w-3 h-3 text-[#d9730d]" /> Marked for Review
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-normal text-[#37352f] leading-relaxed whitespace-pre-line">
              {currentQ?.question_text}
            </div>

            {/* Optional Question Image */}
            {currentQ?.question_image_url && (
              <div className="rounded-md overflow-hidden border border-[#ebebeb] max-h-80 max-w-md bg-[#fcfbf9] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQ.question_image_url}
                  alt="Question Diagram"
                  className="w-full h-auto object-contain max-h-72 rounded-[4px]"
                />
              </div>
            )}

            {/* MCQ Options List */}
            <div className="space-y-2.5 pt-1">
              {(currentQ?.options || []).map((opt) => {
                const isSelected = currentResp?.selected_answer === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`p-3 rounded-md border transition-colors cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#37352f] bg-[#f7f6f3]'
                        : 'border-[#ebebeb] bg-white hover:bg-[#fcfbf9]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-[4px] text-xs font-semibold flex items-center justify-center shrink-0 font-mono transition-colors ${
                        isSelected
                          ? 'bg-[#37352f] text-white'
                          : 'bg-[#f7f6f3] text-[#37352f] border border-[#ebebeb]'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isSelected ? 'font-medium text-[#37352f]' : 'text-[#37352f]'
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
          <div className="hidden sm:flex p-3.5 sm:p-4 bg-[#fcfbf9] border-t border-[#ebebeb] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!currentResp?.selected_answer}
                className="px-3 py-1.5 rounded-[4px] text-xs text-[#787774] hover:text-[#37352f] hover:bg-[#ebebeb] disabled:opacity-30 transition-colors"
              >
                Clear Response
              </button>

              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                  currentResp?.is_marked_for_review
                    ? 'bg-[#fbf3db] text-[#4d3800] border-[#f1e0b5]'
                    : 'bg-white text-[#787774] border-[#ebebeb] hover:bg-[#f7f6f3]'
                }`}
              >
                <Flag className="w-3 h-3 text-[#d9730d]" />
                {currentResp?.is_marked_for_review ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-[4px] border border-[#ebebeb] bg-white hover:bg-[#f7f6f3] text-[#37352f] text-xs disabled:opacity-30 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleMarkAndNext}
                className="px-3 py-1.5 rounded-[4px] bg-[#f7f6f3] hover:bg-[#ebebeb] text-[#37352f] border border-[#ebebeb] text-xs font-medium transition-colors"
              >
                Mark & Next
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-4 py-1.5 rounded-[4px] bg-[#37352f] hover:bg-[#2f2d28] text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                Save & Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DESKTOP QUESTION PALETTE SIDEBAR */}
        <div className="hidden lg:block bg-white rounded-md border border-[#ebebeb] p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2.5">
            <h3 className="text-xs font-semibold text-[#37352f] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#787774]" />
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-[#787774] bg-[#f7f6f3] px-2 py-0.5 rounded-[3px] border border-[#ebebeb]">
              {answeredCount}/{questions.length}
            </span>
          </div>

          {/* Section Filter */}
          {sections.length > 1 && (
            <div className="flex items-center text-xs">
              <select
                value={paletteSectionFilter}
                onChange={(e) => setPaletteSectionFilter(e.target.value)}
                className="w-full text-xs py-1 px-2 bg-[#fcfbf9] border border-[#ebebeb] rounded-[4px] text-[#37352f] focus:outline-none"
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
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-[#787774]">
            <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb]">
              <span className="w-4 h-4 rounded-[2px] bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {answeredCount}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb]">
              <span className="w-4 h-4 rounded-[2px] bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {unansweredVisitedCount}
              </span>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb]">
              <span className="w-4 h-4 rounded-[2px] bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {markedCount}
              </span>
              <span>Review</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb]">
              <span className="w-4 h-4 rounded-[2px] bg-[#ebebeb] text-[#787774] font-bold flex items-center justify-center text-[10px] font-mono">
                {notVisitedCount}
              </span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Jump Bubble Grid */}
          <div className="pt-1">
            <span className="text-[10px] uppercase font-semibold text-[#787774] block mb-1.5">
              Jump To Question:
            </span>
            <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto p-0.5">
              {paletteQuestions.map(({ q, index }) => {
                const state = getQuestionState(q.id);
                const isCurrent = currentIndex === index;

                let styleClass = 'bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]';
                if (state === 'answered') {
                  styleClass = 'bg-emerald-600 text-white font-medium';
                } else if (state === 'visited_unanswered') {
                  styleClass = 'bg-amber-500 text-white font-medium';
                } else if (state === 'marked_for_review') {
                  styleClass = 'bg-purple-600 text-white font-medium';
                } else if (state === 'answered_and_marked') {
                  styleClass = 'bg-purple-600 text-white font-medium';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-8 rounded-[4px] text-xs font-mono font-medium transition-colors relative flex items-center justify-center ${styleClass} ${
                      isCurrent ? 'ring-2 ring-[#37352f] ring-offset-1' : 'hover:opacity-90'
                    }`}
                  >
                    {index + 1}
                    {state === 'answered_and_marked' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Test CTA */}
          <div className="pt-2 border-t border-[#ebebeb]">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-[4px] text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              Submit Examination
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM DOCK */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#ebebeb] px-3 py-2 z-30 flex items-center justify-between gap-1.5 shadow-lg pb-safe">
        <button
          type="button"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-[4px] border border-[#ebebeb] bg-[#f7f6f3] text-[#37352f] disabled:opacity-30 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Previous Question"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleMarkForReview}
          className={`p-2 rounded-[4px] border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
            currentResp?.is_marked_for_review
              ? 'bg-[#fbf3db] text-[#4d3800] border-[#f1e0b5]'
              : 'bg-[#f7f6f3] text-[#787774] border-[#ebebeb]'
          }`}
          title="Mark for Review"
        >
          <Flag className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowMobilePalette(true)}
          className="px-3 py-2 rounded-[4px] bg-[#f7f6f3] border border-[#ebebeb] text-[#37352f] text-xs font-medium flex items-center gap-1 min-h-[40px]"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#787774]" />
          <span>Palette ({answeredCount}/{questions.length})</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndNext}
          className="px-3.5 py-2 rounded-[4px] bg-[#37352f] text-white text-xs font-medium flex items-center gap-1 min-h-[40px]"
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MOBILE QUESTION PALETTE DRAWER */}
      {showMobilePalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-lg border-t border-[#ebebeb] p-4 shadow-xl max-h-[80dvh] overflow-y-auto space-y-3.5 pb-safe">
            <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2.5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#787774]" />
                <h3 className="text-sm font-semibold text-[#37352f]">Question Palette</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#787774] bg-[#f7f6f3] px-2 py-0.5 rounded-[3px] border border-[#ebebeb]">
                  {answeredCount}/{questions.length}
                </span>
                <button
                  onClick={() => setShowMobilePalette(false)}
                  className="p-1 rounded text-[#787774] hover:text-[#37352f] min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              <div className="flex items-center gap-1.5 p-1.5 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb] text-[#37352f]">
                <span className="w-4 h-4 rounded-[2px] bg-emerald-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb] text-[#37352f]">
                <span className="w-4 h-4 rounded-[2px] bg-amber-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {unansweredVisitedCount}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb] text-[#37352f]">
                <span className="w-4 h-4 rounded-[2px] bg-purple-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {markedCount}
                </span>
                <span>Marked</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-[3px] bg-[#fcfbf9] border border-[#ebebeb] text-[#37352f]">
                <span className="w-4 h-4 rounded-[2px] bg-[#ebebeb] text-[#787774] font-mono text-[10px] flex items-center justify-center font-bold">
                  {notVisitedCount}
                </span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Questions Number Grid */}
            <div className="pt-1">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-0.5">
                {questions.map((q, idx) => {
                  const state = getQuestionState(q.id);
                  const isCurrent = currentIndex === idx;

                  let styleClass = 'bg-[#f7f6f3] text-[#787774] border border-[#ebebeb]';
                  if (state === 'answered') {
                    styleClass = 'bg-emerald-600 text-white font-medium';
                  } else if (state === 'visited_unanswered') {
                    styleClass = 'bg-amber-500 text-white font-medium';
                  } else if (state === 'marked_for_review') {
                    styleClass = 'bg-purple-600 text-white font-medium';
                  } else if (state === 'answered_and_marked') {
                    styleClass = 'bg-purple-600 text-white font-medium';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobilePalette(false);
                      }}
                      className={`h-9 rounded-[4px] text-xs font-mono font-medium transition-colors relative flex items-center justify-center ${styleClass} ${
                        isCurrent ? 'ring-2 ring-[#37352f] ring-offset-1' : ''
                      }`}
                    >
                      {idx + 1}
                      {state === 'answered_and_marked' && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowMobilePalette(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-2.5 bg-[#37352f] text-white font-medium rounded-[4px] text-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-xl border border-[#ebebeb] space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-[4px] bg-[#fbf3db] text-[#4d3800] flex items-center justify-center mx-auto mb-1 border border-[#f1e0b5]">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#37352f]">Confirm Test Submission</h3>
              <p className="text-xs text-[#787774] leading-relaxed">
                Are you ready to submit your test? Once confirmed, your answers will be evaluated server-side against the official answer key.
              </p>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-[#fcfbf9] rounded-[4px] p-3 border border-[#ebebeb] divide-y divide-[#ebebeb] text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#787774]">Total Questions</span>
                <span className="font-semibold font-mono text-[#37352f]">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-emerald-700">Answered</span>
                <span className="font-semibold font-mono text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-amber-700">Unanswered</span>
                <span className="font-semibold font-mono text-amber-700">
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-purple-700">Marked for Review</span>
                <span className="font-semibold font-mono text-purple-700">{markedCount}</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-[#eb5757] bg-[#fdf3f2] p-2.5 rounded-[4px] border border-[#f5c6cb]">
                Notice: You still have {questions.length - answeredCount} unanswered questions remaining.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 text-xs text-[#787774] hover:bg-[#f7f6f3] rounded-[4px] transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-[4px] text-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Submission
                    <Check className="w-3.5 h-3.5" />
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
