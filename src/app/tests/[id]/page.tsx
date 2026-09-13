'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Award,
  Layers,
  Play,
  RotateCcw,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  AlertCircle,
} from 'lucide-react';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${testId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Test not found');
        return res.json();
      })
      .then((data) => {
        if (data.test) setTest(data.test);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900">Test Not Found</h3>
        <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const attempts = test.attempts || [];
  const questions = test.questions || [];

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No time limit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins} mins`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Hero Test Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {test.subject || 'General'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{test.title}</h1>
          </div>

          <Link
            href={`/tests/${test.id}/start`}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-white" />
            {attempts.length > 0 ? 'Retake Exam' : 'Start Exam'}
          </Link>
        </div>

        {test.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{test.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Layers className="w-4 h-4 text-indigo-500" />
            {questions.length} Questions
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            {formatDuration(test.duration_seconds)}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Award className="w-4 h-4 text-emerald-500" />
            +{test.default_correct_marks} / -{test.default_negative_marks} marks
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <RotateCcw className="w-4 h-4 text-blue-500" />
            {attempts.length} Attempts recorded
          </span>
        </div>
      </div>

      {/* Attempt History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Attempt Progression & Performance History
        </h2>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-500">You haven&apos;t attempted this test paper yet.</p>
            <Link
              href={`/tests/${test.id}/start`}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Take Test Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Attempt</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Accuracy</th>
                    <th className="py-3.5 px-4">Time Taken</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((att: any, idx: number) => {
                    const attemptNumber = attempts.length - idx;
                    return (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          Attempt {attemptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(att.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                          {att.final_score} / {att.maximum_marks}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {att.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {att.accuracy}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {Math.floor(att.time_taken_seconds / 60)}m {att.time_taken_seconds % 60}s
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/exam/${att.id}/result`}
                            className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                          >
                            Review Solutions <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Question Paper Content Drawer / Collapsible */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Question Paper Content ({questions.length} Questions)
          </h3>
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            {showQuestions ? 'Hide Questions' : 'Preview Questions'}
            {showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showQuestions && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {questions.map((q: any, idx: number) => (
              <div key={q.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Question {q.question_number}</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    Correct: {q.correct_answer} (+{q.correct_marks} / -{q.negative_marks})
                  </span>
                </div>
                <p className="text-slate-800 font-medium">{q.question_text}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt: any, oIdx: number) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border ${
                        opt.label === q.correct_answer
                          ? 'border-emerald-300 bg-emerald-50/50 font-bold text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-2">{opt.label}.</span>
                      {opt.text}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-slate-500 italic pt-1 text-[11px]">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
