'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface QuestionItem {
  id: string;
  question_number: number;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer?: string;
  explanation?: string;
  correct_marks?: number;
  negative_marks?: number;
}

interface TopicTestModalProps {
  topicId: string;
  topicTitle: string;
  test: {
    id: string;
    title: string;
    duration_seconds?: number;
    questions: QuestionItem[];
  };
  isOpen: boolean;
  onClose: () => void;
  onTestComplete?: (result: any) => void;
}

export function TopicTestModal({
  topicId,
  topicTitle,
  test,
  isOpen,
  onClose,
  onTestComplete,
}: TopicTestModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  if (!isOpen) return null;

  const questions = test?.questions || [];
  const currentQ = questions[currentQIndex];

  const handleSelectOption = (qId: string, label: string) => {
    if (result) return; // Cannot change answers after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: label,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/learn/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          test_id: test.id,
          answers: selectedAnswers,
          time_taken_seconds: 180,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (onTestComplete) onTestComplete(data);
      }
    } catch (err) {
      console.error('Test submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                TOPIC ASSESSMENT
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {questions.length} Questions • +2.0 / -0.50 TCS Marking
              </span>
            </div>
            <h2 className="text-base font-sans font-bold text-stone-900 mt-1">
              {topicTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!result ? (
            /* Test Taking View */
            <div className="space-y-6">
              {/* Question Navigation Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(selectedAnswers[q.id]);
                    const isCurrent = idx === currentQIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQIndex(idx)}
                        className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'ring-2 ring-amber-500 bg-amber-50 text-amber-900 font-black'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-mono text-stone-500 shrink-0">
                  {answeredCount} / {questions.length} Answered
                </div>
              </div>

              {/* Active Question Box */}
              {currentQ && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      Q{currentQIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      Single Correct (+2 / -0.5)
                    </span>
                  </div>

                  <p className="text-sm font-medium text-stone-900 leading-relaxed">
                    {currentQ.question_text}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = selectedAnswers[currentQ.id] === opt.label;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => handleSelectOption(currentQ.id, opt.label)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500'
                              : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50 text-stone-800'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <span className="text-xs font-medium">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Post-Test Scorecard View */
            <div className="space-y-6">
              {/* Mastery Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  result.is_mastered
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      result.is_mastered ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg">
                      {result.is_mastered
                        ? 'Mastery Validated! 🎉'
                        : 'Topic Studied — Reinforcement Required'}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {result.is_mastered
                        ? 'You scored ≥ 75%. Topic status updated to Mastered in your learning graph.'
                        : 'Score is under 75%. Topic marked as Studied. We have scheduled an active recall revision for tomorrow.'}
                    </p>
                  </div>
                </div>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-200/60 font-mono text-center">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 block">Score</span>
                    <span className="text-lg font-bold text-stone-900">
                      {result.score} / {result.maximum_marks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 block">Percentage</span>
                    <span className="text-lg font-bold text-stone-900">
                      {result.percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 block">Accuracy</span>
                    <span className="text-lg font-bold text-stone-900">
                      {result.accuracy}%
                    </span>
                  </div>
                </div>

                {/* Spaced Repetition Note */}
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-stone-600 bg-white/70 p-2.5 rounded-lg border border-stone-200">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Spaced Repetition scheduled for:{' '}
                    <strong>{new Date(result.next_revision_date).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>

              {/* Recommended Sectional Test Banner if eligible */}
              {result.recommend_sectional_test && (
                <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">
                      Next Recommended Milestone
                    </span>
                    <h4 className="font-sans font-bold text-sm text-stone-100">
                      {result.recommend_sectional_test.title}
                    </h4>
                    <p className="text-xs text-stone-400">
                      You have cleared prerequisite topics in this subject. Test your composite timing.
                    </p>
                  </div>
                  <Link href={`/tests/${result.recommend_sectional_test.id}`}>
                    <Button variant="saffron" size="sm">
                      Take Sectional Test
                    </Button>
                  </Link>
                </div>
              )}

              {/* Forensic Answer Key & Explanations */}
              <div className="space-y-4 pt-2">
                <h4 className="font-sans font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>Questions & Forensic Explanations</span>
                  <Badge variant="stone" size="sm">
                    {questions.length} Qs
                  </Badge>
                </h4>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const userAns = selectedAnswers[q.id];
                    const isCorrect = userAns === q.correct_answer;
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          isCorrect
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-rose-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-stone-900">
                            Q{idx + 1}. {q.question_text}
                          </span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-mono">
                          <span>
                            Your Answer:{' '}
                            <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                              {userAns || 'Unattempted'}
                            </strong>
                          </span>
                          <span>
                            Correct Key: <strong className="text-emerald-700">{q.correct_answer}</strong>
                          </span>
                        </div>

                        {q.explanation && (
                          <div className="p-2.5 rounded bg-white border border-stone-200 text-stone-600 leading-relaxed">
                            <span className="font-mono text-[10px] text-stone-400 block uppercase font-bold">
                              Explanation:
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
          {!result ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === questions.length - 1}
                  onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Next
                </Button>
              </div>

              <Button
                variant="saffron"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
              >
                {submitting ? 'Evaluating...' : `Submit Assessment (${answeredCount}/${questions.length})`}
              </Button>
            </>
          ) : (
            <div className="w-full flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Done & Close
              </Button>
              <Link href="/learn">
                <Button variant="saffron" size="sm">
                  Return to Learning Path
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
