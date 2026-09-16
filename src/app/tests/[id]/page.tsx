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
  Bookmark,
  Share2,
  Copy,
  Flag,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Check,
  FileText,
  HelpCircle,
  Users,
  Star,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrustLabel } from '@/components/ui/TrustLabel';
import { ReportModal } from '@/components/modals/ReportModal';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTestDetails = () => {
    fetch(`/api/tests/${testId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Test not found');
        return res.json();
      })
      .then((data) => {
        if (data.test) {
          setTest(data.test);
          setIsBookmarked(Boolean(data.test.is_bookmarked));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookmarkToggle = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsBookmarked(data.bookmarked);
        showToast(data.message);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Test link copied to clipboard');
    } else {
      showToast(`URL: ${url}`);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/tests/${testId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Test copied into your creator studio draft!');
        setTimeout(() => {
          router.push(`/tests/create?cloneId=${data.newTestId}`);
        }, 1200);
      } else {
        showToast(data.error || 'Failed to duplicate test');
      }
    } catch (err: any) {
      showToast(err.message || 'Duplicate failed');
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Loading assessment metadata...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !test) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-stone-900 font-serif text-lg">Test Not Found</h3>
          <p className="text-xs text-stone-500">
            The requested assessment paper does not exist or has been made private.
          </p>
          <Link href="/library" className="inline-block">
            <Button variant="primary" size="sm">
              Return to Public Library
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const attempts = test.attempts || [];
  const questions = test.questions || [];

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No time limit (Untimed)';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m (${seconds / 60} minutes)`;
    if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    return `${mins} minutes`;
  };

  const formatTestType = (type: string) => {
    if (!type) return 'Practice Test';
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Public Library', href: '/library' },
        { label: test.title, href: `/tests/${test.id}` },
      ]}
    >
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        testId={test.id}
        testTitle={test.title}
        totalQuestions={questions.length}
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Library
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? 'Saved in Library' : 'Save Test'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Clone this test to customize in Test Studio"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{duplicating ? 'Duplicating...' : 'Duplicate & Edit'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-rose-600 hover:border-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Report an error or formatting issue"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <TrustLabel label={test.trust_label} size="md" showTooltip />
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {test.subject || 'General Studies'}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-50 text-stone-600 border border-stone-200">
                  {formatTestType(test.test_type)}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                  {test.difficulty || 'Medium'} Difficulty
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {test.is_paid ? `₹${test.price_inr}` : 'Free Access'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {test.title}
              </h1>

              {test.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                  {test.description}
                </p>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <Link href={`/tests/${test.id}/start`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full min-h-[48px] px-8 text-sm font-bold shadow-md flex items-center justify-center gap-2"
                  icon={<Play className="w-4 h-4 fill-current" />}
                >
                  {attempts.length > 0 ? 'Retake Exam Paper' : 'Start Assessment'}
                </Button>
              </Link>
              <p className="text-[11px] text-center text-stone-400 font-medium">
                Full CBT interface with countdown timer
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Total Items
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Layers className="w-4 h-4 text-stone-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {questions.length} Questions
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Duration Limit
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-stone-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {formatDuration(test.duration_seconds)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Marking Scheme
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  +{test.default_correct_marks} / -{test.default_negative_marks}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Community Attempts
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {test.total_attempts_count || attempts.length} Recorded
                </span>
              </div>
            </div>
          </div>

          {/* Creator Attribution Profile Card */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              href={`/creators/${test.user_id}`}
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-serif font-bold text-base">
                {test.creator_name?.charAt(0) || 'E'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-stone-900 group-hover:underline text-sm">
                    {test.creator_name || 'Academic Faculty'}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs text-stone-500">
                  {test.creator_headline || 'Senior Assessment Chair'} • {test.creator_institute || 'Nalanda Academic Board'}
                </p>
              </div>
            </Link>

            <Link href={`/creators/${test.user_id}`}>
              <Button variant="secondary" size="sm" className="text-xs">
                View Creator Profile <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Test Attempt History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-stone-700" />
              Your Personal Attempt Progression
            </h2>
            <span className="text-xs font-mono text-stone-500 font-medium">
              {attempts.length} Attempt{attempts.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 text-center space-y-3">
              <p className="text-xs text-stone-500">You haven&apos;t attempted this test paper yet.</p>
              <Link
                href={`/tests/${test.id}/start`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-stone-800"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Take Test Now
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
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
                  <tbody className="divide-y divide-stone-100">
                    {attempts.map((att: any, idx: number) => {
                      const attemptNumber = attempts.length - idx;
                      return (
                        <tr key={att.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            Attempt #{attemptNumber}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500">
                            {new Date(att.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                            {att.final_score} / {att.maximum_marks}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            {att.percentage}%
                          </td>
                          <td className="py-3.5 px-4 text-stone-700 font-semibold font-mono">
                            {att.accuracy}%
                          </td>
                          <td className="py-3.5 px-4 text-stone-500 font-mono">
                            {Math.floor(att.time_taken_seconds / 60)}m {att.time_taken_seconds % 60}s
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/exam/${att.id}/result`}
                              className="inline-flex items-center gap-1 text-stone-900 font-bold hover:underline"
                            >
                              Forensics & Solutions <ExternalLink className="w-3 h-3" />
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

        {/* Question Paper Preview Drawer */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Question Paper Structure ({questions.length} Items)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Inspect question distribution, answer keys, and pedagogical solutions.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
              icon={showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            >
              {showQuestions ? 'Hide Questions' : 'Preview Questions'}
            </Button>
          </div>

          {showQuestions && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              {questions.map((q: any) => (
                <div
                  key={q.id || q.question_number}
                  className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 font-mono">
                      Question #{q.question_number}
                    </span>
                    <span className="font-mono text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Correct: Key {q.correct_answer} (+{q.correct_marks} / -{q.negative_marks})
                    </span>
                  </div>

                  <p className="text-stone-800 font-medium leading-relaxed">{q.question_text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt: any, oIdx: number) => {
                      const isCorrect = opt.label === q.correct_answer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs transition-colors ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-900'
                              : 'border-stone-200 bg-white text-stone-700'
                          }`}
                        >
                          <span className="font-bold mr-2 font-mono">{opt.label}.</span>
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-stone-100/70 border border-stone-200 text-stone-600 text-[11px] leading-relaxed">
                      <strong className="text-stone-800 block mb-0.5">Pedagogical Solution:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
