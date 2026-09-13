'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Award,
  Layers,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sliders,
} from 'lucide-react';

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [declared, setDeclared] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${testId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load test details');
        return res.json();
      })
      .then((data) => {
        if (data.test) setTest(data.test);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [testId]);

  const handleStartExam = async () => {
    if (!declared) {
      alert('Please read and agree to the declaration before starting.');
      return;
    }

    setStarting(true);
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start exam');

      router.push(`/exam/${data.attemptId}`);
    } catch (err: any) {
      alert(err.message);
      setStarting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No Time Limit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs} Hour${hrs > 1 ? 's' : ''} ${mins} Mins`;
    if (hrs > 0) return `${hrs} Hour${hrs > 1 ? 's' : ''}`;
    return `${mins} Minutes`;
  };

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
        <h3 className="font-bold text-slate-900">Exam Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'This exam does not exist or has been removed.'}</p>
        <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const questionCount = test.questions?.length || 0;
  const maxPossibleMarks = test.questions?.reduce(
    (sum: number, q: any) => sum + (Number(q.correct_marks) || 4),
    0
  ) || questionCount * 4;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {test.subject || 'General Assessment'}
          </span>
          <span className="text-xs text-slate-400 font-mono">Exam Instructions</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{test.title}</h1>

        {test.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{test.description}</p>
        )}

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {formatDuration(test.duration_seconds)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              {questionCount} MCQs
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Marks</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              {maxPossibleMarks} Pts
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Marking</span>
            <span className="text-sm font-bold text-indigo-700 flex items-center gap-1 mt-0.5 font-mono">
              +{test.default_correct_marks} / -{test.default_negative_marks}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions & Palette Legend Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          General Examination Guidelines
        </h3>

        <ul className="space-y-3 text-xs sm:text-sm text-slate-600 list-disc list-inside leading-relaxed">
          <li>
            The test clock will begin counting down as soon as you click <strong>&quot;Begin Mock Exam&quot;</strong>.
          </li>
          <li>
            Each correct answer awards <strong>+{test.default_correct_marks} marks</strong>.
          </li>
          <li>
            Each incorrect answer deducts <strong>-{test.default_negative_marks} marks</strong>.
          </li>
          <li>
            Unanswered questions receive <strong>{test.default_unanswered_marks} marks</strong>. No negative marks are deducted for unattempted questions.
          </li>
          <li>
            You can flag questions for later review using the <strong>&quot;Mark for Review&quot;</strong> button.
          </li>
          <li>
            The exam automatically saves your answers as you select them. If the page is refreshed, your answers and remaining time will persist.
          </li>
          <li>
            When the timer hits 0:00:00, your test will be <strong>automatically locked and submitted</strong> for evaluation.
          </li>
        </ul>

        {/* Palette Color Reference */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Question Palette Legend
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-slate-700">Not Visited yet</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-slate-700">Visited but Unanswered</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-slate-700 font-semibold">Answered</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <span className="text-slate-700">Marked for Review</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs sm:col-span-2 lg:col-span-2">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 relative">
                5
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </span>
              <span className="text-slate-700">Answered & Marked for Review (will be evaluated)</span>
            </div>
          </div>
        </div>

        {/* Declaration & CTA */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed font-medium">
              I have read and understood all the above instructions and rules for this examination. I am ready to begin the test.
            </span>
          </label>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel & Return
            </Link>

            <button
              onClick={handleStartExam}
              disabled={!declared || starting}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all ${
                declared && !starting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading Exam Engine...
                </>
              ) : (
                <>
                  Begin Mock Exam
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
