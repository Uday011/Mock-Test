'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Award,
  Layers,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Info,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MockCheckoutModal } from '@/components/modals/MockCheckoutModal';

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [declared, setDeclared] = useState(false);
  const [starting, setStarting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const fetchTest = () => {
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
  };

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const handleStartExam = async () => {
    if (!declared) {
      alert('Please confirm that you have read and agree to the examination declaration.');
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
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m (${seconds / 60} mins)`;
    if (hrs > 0) return `${hrs} Hour${hrs > 1 ? 's' : ''}`;
    return `${mins} Minutes`;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-9 h-9 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-600 tracking-wide">Loading examination specifications...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !test) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-sans font-bold text-lg text-stone-900">Exam Specification Not Found</h3>
          <p className="text-xs text-stone-600">{error || 'This test does not exist or has been modified.'}</p>
          <Link href="/tests">
            <Button variant="primary" size="sm">
              Return to Test Catalog
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Access Restriction State for unpurchased paid tests
  if (test.is_paid && !test.has_access) {
    return (
      <AppShell>
        <MockCheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          itemType="test"
          itemId={test.id}
          itemTitle={test.title}
          creatorName={test.creator_name}
          priceInr={test.price_inr}
          onSuccess={() => {
            fetchTest();
          }}
        />

        <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-7 h-7 text-amber-800" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Premium Assessment Restricted
              </span>
              <h2 className="font-sans font-bold text-xl text-stone-900">{test.title}</h2>
              <p className="text-xs text-stone-500">
                Authored by {test.creator_name || 'Verified Educator Faculty'} • ₹{test.price_inr}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px] font-mono">
              Included with Premium Access:
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Standard TCS Computer-Based Examination interface with full timing controls</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Complete pedagogical derivations and examiner trap annotations for all questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All-India percentile rankings and sectional cognitive speed analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automatic integration into your Nalanda Spaced Repetition Mistake Notebook</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-100">
            <Link href={`/tests/${test.id}`} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full text-xs" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Test Overview
              </Button>
            </Link>

            <Button
              variant="primary"
              size="md"
              onClick={() => setCheckoutOpen(true)}
              className="w-full sm:w-auto text-xs px-6 shadow-md"
              icon={<Lock className="w-3.5 h-3.5" />}
            >
              Unlock Assessment (₹{test.price_inr})
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const questionCount = test.questions?.length || 0;
  const maxPossibleMarks = test.questions?.reduce(
    (sum: number, q: any) => sum + (Number(q.correct_marks) || Number(test.default_correct_marks) || 2),
    0
  ) || questionCount * (Number(test.default_correct_marks) || 2);

  // Group questions by Section / Subject for CBE breakdown
  const sectionBreakdown: Record<string, { count: number; marks: number }> = {};
  if (test.questions && test.questions.length > 0) {
    for (const q of test.questions) {
      const secName = q.subject || test.subject || 'General Assessment';
      if (!sectionBreakdown[secName]) {
        sectionBreakdown[secName] = { count: 0, marks: 0 };
      }
      sectionBreakdown[secName].count += 1;
      sectionBreakdown[secName].marks += Number(q.correct_marks) || Number(test.default_correct_marks) || 2;
    }
  } else {
    sectionBreakdown[test.subject || 'General Assessment'] = { count: questionCount, marks: maxPossibleMarks };
  }

  const sectionsList = Object.entries(sectionBreakdown);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Nalanda', href: '/dashboard' },
        { label: 'Test Catalog', href: '/tests' },
        { label: test.title, href: `/tests/${testId}/start` },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Top Header Card */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#E6E6E3] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="saffron">{test.subject || 'Comprehensive'}</Badge>
              <Badge variant="stone" className="capitalize">
                {test.test_type?.replace(/_/g, ' ') || 'Mock Test'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {test.difficulty || 'Medium'} Difficulty
              </Badge>
              {test.source && (
                <span className="text-[11px] text-[#787774] flex items-center gap-1">
                  Source: <strong className="text-[#202124] font-medium">{test.source}</strong>
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-[#787774] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E6E6E3]">
              CBE Guidelines v2.4
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#202124] tracking-tight">
              {test.title}
            </h1>
            {test.description && (
              <p className="text-xs sm:text-sm text-[#787774] leading-relaxed max-w-3xl">
                {test.description}
              </p>
            )}
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#E6E6E3]">
            <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] space-y-0.5">
              <span className="text-[10px] text-[#9b9a97] uppercase tracking-wider block">Duration</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#202124] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#B7791F] shrink-0" />
                <span>{formatDuration(test.duration_seconds)}</span>
              </div>
            </div>

            <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] space-y-0.5">
              <span className="text-[10px] text-[#9b9a97] uppercase tracking-wider block">Questions</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#202124] font-mono">
                <Layers className="w-3.5 h-3.5 text-[#787774] shrink-0" />
                <span>{questionCount} MCQs</span>
              </div>
            </div>

            <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] space-y-0.5">
              <span className="text-[10px] text-[#9b9a97] uppercase tracking-wider block">Total Marks</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#202124] font-mono">
                <Award className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                <span>{maxPossibleMarks} Pts</span>
              </div>
            </div>

            <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] space-y-0.5">
              <span className="text-[10px] text-[#9b9a97] uppercase tracking-wider block">Marking Scheme</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#202124] font-mono">
                <span className="text-[#1B5E20]">+{test.default_correct_marks || 2}</span>
                <span className="text-[#E6E6E3]">/</span>
                <span className="text-[#C53030]">-{test.default_negative_marks || 0.5}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Breakdown Summary Table */}
        {sectionsList.length > 0 && (
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#E6E6E3] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2.5">
              <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#787774]" />
                Section-Wise Exam Pattern & Marking Scheme
              </h2>
              <span className="text-[11px] font-mono text-[#787774] bg-[#f1f1ef] px-2 py-0.5 rounded">
                {sectionsList.length} Section{sectionsList.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E6E3] bg-[#F7F7F5] text-[#787774]">
                    <th className="py-2 px-3 font-medium uppercase tracking-wider text-[10px]">Section / Subject</th>
                    <th className="py-2 px-3 font-medium uppercase tracking-wider text-[10px] text-center">Questions</th>
                    <th className="py-2 px-3 font-medium uppercase tracking-wider text-[10px] text-center">Max Marks</th>
                    <th className="py-2 px-3 font-medium uppercase tracking-wider text-[10px] text-center">Correct / Wrong</th>
                    <th className="py-2 px-3 font-medium uppercase tracking-wider text-[10px] text-right">Time Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6E3]">
                  {sectionsList.map(([secTitle, data], idx) => (
                    <tr key={idx} className="hover:bg-[#F1F1EF] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#202124]">
                        {secTitle}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#202124]">
                        {data.count}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#202124]">
                        {data.marks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="text-[#1B5E20] font-medium">+{test.default_correct_marks || 2}</span>
                        <span className="text-[#E6E6E3] mx-1">/</span>
                        <span className="text-[#C53030] font-medium">-{test.default_negative_marks || 0.5}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#787774]">
                        Composite
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F7F7F5] font-semibold border-t border-[#E6E6E3] text-[#202124]">
                    <td className="py-2.5 px-3">Total Composite Exam</td>
                    <td className="py-2.5 px-3 text-center font-mono">{questionCount}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{maxPossibleMarks}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#787774]">—</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatDuration(test.duration_seconds)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Examination Guidelines Card */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#E6E6E3] space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E6E6E3] pb-2.5">
            <FileText className="w-4 h-4 text-[#787774]" />
            <h2 className="text-sm font-semibold text-[#202124]">
              Standard Computer-Based Examination Rules
            </h2>
          </div>

          <div className="space-y-3.5 text-xs text-[#202124] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-[#f1f1ef] text-[#202124] font-mono font-medium flex items-center justify-center shrink-0 text-xs mt-0.5">
                1
              </span>
              <p>
                <strong>Clock & Time Management:</strong> The countdown timer in the top-right header will display the remaining time available to complete the exam. When the timer reaches <strong>0:00:00</strong>, your test will be <strong>automatically locked and submitted</strong> for scoring.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-[#f1f1ef] text-[#202124] font-mono font-medium flex items-center justify-center shrink-0 text-xs mt-0.5">
                2
              </span>
              <p>
                <strong>Navigation Between Questions:</strong> You can jump directly to any question by clicking its number in the <strong>Question Palette</strong>. You can switch between sections (e.g., Quant, Reasoning, English) freely at any time.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-[#f1f1ef] text-[#202124] font-mono font-medium flex items-center justify-center shrink-0 text-xs mt-0.5">
                3
              </span>
              <p>
                <strong>Saving Responses:</strong> To select an answer, click the corresponding option card or press its key (A, B, C, D). Click <strong>&quot;Save & Next&quot;</strong> to save your answer and move to the next question. You may also click <strong>&quot;Clear Response&quot;</strong> to deselect an answer.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-[#f1f1ef] text-[#202124] font-mono font-medium flex items-center justify-center shrink-0 text-xs mt-0.5">
                4
              </span>
              <p>
                <strong>Autosave & Network Resilience:</strong> Every answer you select is immediately persisted to local storage and asynchronously synced to Nalanda servers. If your browser window is accidentally closed or refreshed, your answers and remaining time will be seamlessly restored.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-[#f1f1ef] text-[#202124] font-mono font-medium flex items-center justify-center shrink-0 text-xs mt-0.5">
                5
              </span>
              <p>
                <strong>Review Marking Protocol:</strong> If you are unsure of an answer, you can flag the question using <strong>&quot;Mark for Review&quot;</strong>. Questions marked for review that have an option selected will still be <strong>evaluated in your final score</strong>.
              </p>
            </div>
          </div>

          {/* Question Palette Legend Box */}
          <div className="pt-3 border-t border-[#E6E6E3] space-y-2.5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#787774] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#B7791F]" />
              Question Palette Color State Legend
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs">
                <span className="w-6 h-6 rounded bg-[#f1f1ef] text-[#787774] font-mono font-medium flex items-center justify-center shrink-0">
                  01
                </span>
                <span className="text-[#202124]">Not Visited Yet</span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[#FFFBEB]/50 border border-[#FEF3C7] text-xs">
                <span className="w-6 h-6 rounded bg-[#8f6b10] text-white font-mono font-medium flex items-center justify-center shrink-0">
                  02
                </span>
                <span className="text-[#493a19] font-medium">Visited but Unanswered</span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[#EDF7ED]/60 border border-[#C8E6C9] text-xs">
                <span className="w-6 h-6 rounded bg-[#1B5E20] text-white font-mono font-medium flex items-center justify-center shrink-0">
                  03
                </span>
                <span className="text-[#1c3829] font-medium">Answered</span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[#EEF0FB]/60 border border-[#DCDDF7] text-xs">
                <span className="w-6 h-6 rounded bg-[#4F46A5] text-white font-mono font-medium flex items-center justify-center shrink-0">
                  04
                </span>
                <span className="text-[#3d2459] font-medium">Marked for Review</span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[#EEF0FB]/60 border border-[#DCDDF7] text-xs sm:col-span-2 lg:col-span-2">
                <span className="w-6 h-6 rounded bg-[#4F46A5] text-white font-mono font-medium flex items-center justify-center shrink-0 relative">
                  05
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1B5E20] border border-white" />
                </span>
                <span className="text-[#3d2459] font-medium">
                  Answered & Marked for Review <span className="font-semibold text-[#1B5E20]">(evaluated)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Declaration Checkbox and Start CTA */}
          <div className="pt-4 border-t border-[#E6E6E3] space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-md bg-[#FFFBEB]/40 border border-[#FEF3C7] cursor-pointer select-none hover:bg-[#FFFBEB]/60 transition-colors">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-[#202124] rounded border-[#E6E6E3] shrink-0"
              />
              <span className="text-xs text-[#202124] leading-relaxed">
                I have read, understood, and agreed to follow all instructions and examination rules mentioned above. I confirm that all computer hardware and connectivity are verified and I will not engage in any unfair practices.
              </span>
            </label>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <Link href="/tests">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Cancel & Return to Catalog
                </Button>
              </Link>

              <button
                onClick={handleStartExam}
                disabled={!declared || starting}
                className={`px-5 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  declared && !starting
                    ? 'bg-[#202124] hover:bg-[#22211e] text-white'
                    : 'bg-[#f1f1ef] text-[#9b9a97] cursor-not-allowed'
                }`}
              >
                {starting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Launching Examination Engine...
                  </>
                ) : (
                  <>
                    Begin Examination
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
