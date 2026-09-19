'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  RotateCcw,
  Bookmark,
  Check,
  X,
  Target,
  Filter,
  Eye,
  Play,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface QuestionBankItem {
  id: string;
  creator_id?: string;
  topic_id?: string | null;
  subject_id?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
  topic_title?: string | null;
  exam_id?: string | null;
  question_text: string;
  question_type: string;
  options: any[];
  correct_answer: string;
  explanation?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  source_reference?: string | null;
  tags: string[];
  marks: number;
  negative_marks: number;
  estimated_seconds: number;
  correctness_status: 'verified' | 'review_needed';
  created_at: string;
}

function FormattedMathText({ text }: { text: any }) {
  if (!text) return null;
  const str = typeof text === 'string' ? text : text.text || String(text);
  if (!str) return null;
  const parts = str.split(/(\$[^$]+\$)/g);
  return (
    <span>
      {parts.map((part: string, i: number) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return (
            <span
              key={i}
              className="inline-block font-mono text-[0.9em] bg-[#F1F1EF] text-[#202124] px-1.5 py-0.5 rounded border border-[#E6E6E3] mx-0.5 font-medium"
            >
              {formula}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function QuestionBankContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial params from URL
  const initialSubject = searchParams.get('subject') || 'all';
  const initialTopic = searchParams.get('topic') || '';
  const initialDifficulty = searchParams.get('difficulty') || 'all';

  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  // Modes: 'practice' (interactive with instant feedback) vs 'browse' (read with solutions visible)
  const [practiceMode, setPracticeMode] = useState<'practice' | 'browse'>('practice');

  // Interactive practice state: map questionId -> selectedOptionKey
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Set<string>>(new Set());
  const [loggedMistakes, setLoggedMistakes] = useState<Set<string>>(new Set());
  const [loggingMistakeId, setLoggingMistakeId] = useState<string | null>(null);

  // Sync state if URL searchParams change
  useEffect(() => {
    const sub = searchParams.get('subject');
    const top = searchParams.get('topic');
    const diff = searchParams.get('difficulty');
    if (sub) setSelectedSubject(sub);
    if (top) setSelectedTopic(top);
    if (diff) setSelectedDifficulty(diff);
  }, [searchParams]);

  // Fetch questions
  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedSubject !== 'all') params.set('subject', selectedSubject);
      if (selectedTopic.trim()) params.set('topic', selectedTopic.trim());
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);

      const res = await fetch(`/api/question-bank?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch questions');

      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || 'Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestions();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject, selectedTopic, selectedDifficulty]);

  // Handle Option Select in Practice Mode
  const handleSelectOption = (q: QuestionBankItem, optKey: string) => {
    if (practiceMode !== 'practice') return;
    if (userAnswers[q.id]) return; // Already answered, use reset to try again

    setUserAnswers((prev) => ({ ...prev, [q.id]: optKey }));

    // Auto reveal explanation
    setRevealedSolutions((prev) => new Set(prev).add(q.id));

    // If incorrect, prompt/offer mistake logging
    if (optKey !== q.correct_answer) {
      // Auto-log mistake to Mistake Book in background
      handleLogMistake(q, optKey, false);
    }
  };

  // Reset a question to re-attempt
  const handleResetQuestion = (questionId: string) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setRevealedSolutions((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  // Log to Mistake Book
  const handleLogMistake = async (q: QuestionBankItem, selectedOpt: string, manual: boolean = true) => {
    try {
      setLoggingMistakeId(q.id);
      const res = await fetch('/api/mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: q.id,
          test_id: 'practice_mode',
          exam_id: q.exam_id || 'exam-cat-2026',
          subject_id: q.subject_id,
          topic_id: q.topic_id,
          question_text: q.question_text,
          options: q.options,
          selected_answer: selectedOpt,
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          error_category: 'conceptual_gap',
          user_notes: `Logged during CAT Practice Engine session on topic ${q.topic_title || q.topic_id || 'General'}.`,
        }),
      });
      if (res.ok) {
        setLoggedMistakes((prev) => new Set(prev).add(q.id));
      }
    } catch (err) {
      console.error('Error logging mistake:', err);
    } finally {
      setLoggingMistakeId(null);
    }
  };

  // Compute Practice Session Stats
  const sessionStats = useMemo(() => {
    const answeredIds = Object.keys(userAnswers);
    const totalAttempted = answeredIds.length;
    let correctCount = 0;
    for (const qId of answeredIds) {
      const q = questions.find((item) => item.id === qId);
      if (q && userAnswers[qId] === q.correct_answer) {
        correctCount++;
      }
    }
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
    return { totalAttempted, correctCount, accuracy };
  }, [userAnswers, questions]);

  const clearTopicFilter = () => {
    setSelectedTopic('');
    router.replace(`/question-bank?subject=${selectedSubject}`);
  };

  const clearAllFilters = () => {
    setSelectedSubject('all');
    setSelectedTopic('');
    setSelectedDifficulty('all');
    setSearchQuery('');
    router.replace('/question-bank');
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Practice', href: '/question-bank' },
        ...(selectedTopic ? [{ label: selectedTopic }] : []),
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Header with Mode Switcher */}
        <div className="border-b border-[#E6E6E3] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#787774] mb-1">
              <span>CAT 2026 Engine</span>
              <span>•</span>
              <span>High-Yield Question Repository</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
              Practice Mode & Question Bank
            </h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#EAEAE7] p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setPracticeMode('practice')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-semibold transition-all min-h-[38px] ${
                practiceMode === 'practice'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#787774] hover:text-[#202124]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Practice Mode</span>
            </button>
            <button
              onClick={() => setPracticeMode('browse')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-semibold transition-all min-h-[38px] ${
                practiceMode === 'browse'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#787774] hover:text-[#202124]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#787774]" />
              <span>Browse & Solutions</span>
            </button>
          </div>
        </div>

        {/* Practice Session Scorecard Bar */}
        {sessionStats.totalAttempted > 0 && (
          <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#202124]">Current Session Performance:</span>
              <span className="text-[#787774]">
                {sessionStats.totalAttempted} answered
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="text-emerald-700 font-semibold">
                ✓ {sessionStats.correctCount} Correct
              </div>
              <div className="text-rose-700 font-semibold">
                ✗ {sessionStats.totalAttempted - sessionStats.correctCount} Mistakes
              </div>
              <div className="bg-white border border-[#E6E6E3] px-2 py-0.5 rounded text-[#202124] font-medium">
                Accuracy: {sessionStats.accuracy}%
              </div>
            </div>
          </div>
        )}

        {/* Active Focus / Topic Filter Banner */}
        {selectedTopic && (
          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#4338CA] shrink-0" />
              <div>
                <span className="text-[#4338CA] font-medium">Practicing Focused Topic: </span>
                <span className="font-semibold text-[#1E1B4B]">{selectedTopic}</span>
              </div>
            </div>
            <button
              onClick={clearTopicFilter}
              className="text-[#4338CA] hover:text-[#1E1B4B] font-medium underline underline-offset-2 shrink-0 cursor-pointer"
            >
              Show all topics
            </button>
          </div>
        )}

        {/* Quick Filter Bar */}
        <div className="bg-white border border-[#E6E6E3] rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'All Sections' },
                { id: 'varc', label: 'VARC' },
                { id: 'dilr', label: 'DILR' },
                { id: 'qa', label: 'QA' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 min-h-[34px] cursor-pointer ${
                    selectedSubject.toLowerCase() === sub.id
                      ? 'bg-[#202124] text-white shadow-2xs'
                      : 'bg-[#F7F7F5] text-[#787774] hover:text-[#202124] hover:bg-[#EAEAE7]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Difficulty & Search */}
            <div className="flex items-center gap-2">
              {/* Difficulty Dropdown */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg px-2.5 py-1.5 text-xs text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#202124] min-h-[34px]"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Search Input */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg text-xs text-[#202124] placeholder:text-[#9b9a97] focus:outline-none focus:ring-1 focus:ring-[#202124] min-h-[34px]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#787774] pt-1 border-t border-[#F1F1EF]">
            <div>
              Showing <span className="font-semibold text-[#202124]">{questions.length}</span> questions
              {selectedTopic && <span> in topic &quot;{selectedTopic}&quot;</span>}
            </div>
            {(selectedSubject !== 'all' || selectedTopic || selectedDifficulty !== 'all' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-[#787774] hover:text-[#202124] underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Questions Listing */}
        {loading ? (
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading CAT practice questions...
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#f5c2c2] text-[#e03e3e]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#e03e3e]" />
            <p className="text-sm font-semibold">Failed to load question bank</p>
            <p className="text-xs text-[#787774] mt-1">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E6E6E3] space-y-3">
            <Layers className="w-8 h-8 text-[#9b9a97] mx-auto" />
            <h3 className="text-sm font-semibold text-[#202124]">No questions match current criteria</h3>
            <p className="text-xs text-[#787774] max-w-sm mx-auto">
              Try adjusting your section, topic, or difficulty filters to see more CAT questions.
            </p>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selectedAnswer = userAnswers[q.id];
              const isAnswered = !!selectedAnswer;
              const isCorrect = selectedAnswer === q.correct_answer;
              const isSolutionOpen = practiceMode === 'browse' || revealedSolutions.has(q.id);
              const isLogged = loggedMistakes.has(q.id);

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-[#E6E6E3] shadow-2xs overflow-hidden transition-all hover:border-[#d4d4d4]"
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3 border-b border-[#F1F1EF] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-[#787774] bg-[#F1F1EF] px-2 py-0.5 rounded font-medium">
                        Q{idx + 1} • {q.id.slice(0, 8)}
                      </span>

                      <span className="text-xs font-semibold text-[#202124]">
                        {q.subject_code || (q.subject_id?.includes('varc') ? 'VARC' : q.subject_id?.includes('dilr') ? 'DILR' : 'QA')}
                      </span>

                      {(q.topic_title || q.topic_id) && (
                        <span className="text-xs text-[#787774] truncate max-w-[200px]">
                          • {q.topic_title || q.topic_id?.replace('topic-cat-', '').replace(/-/g, ' ')}
                        </span>
                      )}

                      {q.correctness_status === 'verified' && (
                        <Badge variant="emerald" size="sm">
                          Verified Proof
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Badge
                        variant={
                          q.difficulty === 'hard'
                            ? 'rose'
                            : q.difficulty === 'medium'
                            ? 'amber'
                            : 'emerald'
                        }
                        size="sm"
                      >
                        {q.difficulty}
                      </Badge>
                      <span className="text-[#787774] text-[11px]">
                        +3 / -1
                      </span>
                      {q.estimated_seconds && (
                        <span className="text-[#9b9a97] text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {q.estimated_seconds}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="text-sm sm:text-base text-[#202124] leading-relaxed font-normal">
                      <FormattedMathText text={q.question_text} />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(q.options || []).map((opt, i) => {
                        const optKey = typeof opt === 'object' && opt?.label ? opt.label : String.fromCharCode(65 + i);
                        const optText = typeof opt === 'object' && opt?.text ? opt.text : (typeof opt === 'string' ? opt : String(opt));

                        let optionStyle = 'bg-[#FAFAFA] border-[#E6E6E3] text-[#202124] hover:bg-[#F1F1EF] hover:border-[#c8c8c5] cursor-pointer';

                        if (practiceMode === 'practice') {
                          if (isAnswered) {
                            if (optKey === q.correct_answer) {
                              optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium shadow-xs';
                            } else if (optKey === selectedAnswer) {
                              optionStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-medium shadow-xs';
                            } else {
                              optionStyle = 'bg-[#FAFAFA] border-[#E6E6E3] opacity-60 cursor-default';
                            }
                          }
                        } else {
                          // Browse Mode: Always highlight correct answer
                          if (optKey === q.correct_answer) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                          }
                        }

                        return (
                          <div
                            key={i}
                            onClick={() => handleSelectOption(q, optKey)}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all min-h-[46px] select-none ${optionStyle}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
                                (practiceMode === 'practice' && isAnswered && optKey === q.correct_answer) ||
                                (practiceMode === 'browse' && optKey === q.correct_answer)
                                  ? 'bg-emerald-700 text-white font-bold'
                                  : practiceMode === 'practice' && isAnswered && optKey === selectedAnswer
                                  ? 'bg-rose-700 text-white font-bold'
                                  : 'bg-[#EAEAE7] text-[#787774] font-medium'
                              }`}
                            >
                              {optKey}
                            </span>
                            <div className="flex-1 pt-0.5 leading-snug">
                              <FormattedMathText text={optText} />
                            </div>
                            {practiceMode === 'practice' && isAnswered && optKey === q.correct_answer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {practiceMode === 'practice' && isAnswered && optKey === selectedAnswer && !isCorrect && (
                              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Instant Feedback Banner in Practice Mode */}
                    {practiceMode === 'practice' && isAnswered && (
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">Correct Answer! (+3 CAT Marks)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <div>
                                <span className="font-semibold">Incorrect Answer (-1 Mark). </span>
                                <span>Correct option is <strong>{q.correct_answer}</strong>.</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isCorrect && (
                            <button
                              onClick={() => handleLogMistake(q, selectedAnswer, true)}
                              disabled={isLogged || loggingMistakeId === q.id}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                                isLogged
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-white text-[#202124] border-[#E6E6E3] hover:bg-[#F7F7F5]'
                              }`}
                            >
                              {isLogged ? '✓ In Mistake Book' : '⚑ Log Mistake'}
                            </button>
                          )}
                          <button
                            onClick={() => handleResetQuestion(q.id)}
                            className="text-[#787774] hover:text-[#202124] flex items-center gap-1 font-medium underline underline-offset-2 ml-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Solution & Derivation Drawer */}
                  {isSolutionOpen && (
                    <div className="bg-[#F7F7F5] border-t border-[#E6E6E3] p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-1 border-b border-[#E6E6E3]">
                        <div className="font-semibold text-[#202124] flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#787774]" />
                          <span>Pedagogical Derivation & CAT Approach</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          Correct: Option {q.correct_answer}
                        </span>
                      </div>

                      {q.explanation ? (
                        <div className="text-[#37352f] leading-relaxed pl-2.5 border-l-2 border-[#202124]">
                          <FormattedMathText text={q.explanation} />
                        </div>
                      ) : (
                        <p className="text-[#9b9a97] italic text-xs">
                          Step-by-step mathematical proof is being verified for this item.
                        </p>
                      )}

                      {/* Source & Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6E6E3] text-[11px] text-[#787774]">
                        {q.source_reference ? (
                          <div>
                            <span className="font-medium text-[#202124]">Benchmark Source: </span>
                            <span>{q.source_reference}</span>
                          </div>
                        ) : (
                          <div>CAT Benchmark Series</div>
                        )}

                        {q.tags && q.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            {q.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="bg-white text-[#787774] text-[10px] px-1.5 py-0.5 rounded border border-[#E6E6E3]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Bar for Browse Mode */}
                  {practiceMode === 'browse' && !revealedSolutions.has(q.id) && (
                    <div className="px-4 py-2 border-t border-[#F1F1EF] bg-white flex justify-end">
                      <button
                        onClick={() =>
                          setRevealedSolutions((prev) => new Set(prev).add(q.id))
                        }
                        className="text-xs text-[#787774] hover:text-[#202124] flex items-center gap-1 font-medium"
                      >
                        <span>Show Detailed Explanation</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function QuestionBankPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading Practice Engine...
          </div>
        </AppShell>
      }
    >
      <QuestionBankContent />
    </Suspense>
  );
}
