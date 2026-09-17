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
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrustLabel } from '@/components/ui/TrustLabel';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';
import { ReportModal } from '@/components/modals/ReportModal';
import { MockCheckoutModal } from '@/components/modals/MockCheckoutModal';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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
          <div className="w-5 h-5 border-2 border-[#202124] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#787774] font-medium">Loading assessment metadata...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !test) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-lg border border-[#E6E6E3] text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#e03e3e] mx-auto" />
          <h3 className="font-semibold text-[#202124] text-base">Test Not Found</h3>
          <p className="text-xs text-[#787774]">
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
    if (!seconds || seconds <= 0) return 'Untimed';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m (${seconds / 60} mins)`;
    if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${mins} mins`;
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white text-xs px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
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

      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Navigation & Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#202124] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Library
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBookmarkToggle}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-[#fdf5e8] border-[#fae2be] text-[#8f4f00]'
                  : 'bg-white border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-md border border-[#E6E6E3] bg-white text-[#787774] hover:bg-[#F1F1EF] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>

            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="px-2.5 py-1 rounded-md border border-[#E6E6E3] bg-white text-[#787774] hover:bg-[#F1F1EF] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Clone this test to customize in Test Studio"
            >
              <Copy className="w-3 h-3" />
              <span>{duplicating ? 'Duplicating...' : 'Duplicate'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-2.5 py-1 rounded-md border border-[#E6E6E3] bg-white text-[#787774] hover:text-[#e03e3e] hover:border-[#f5c2c2] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Report an error or formatting issue"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Document Header & Main Overview */}
        <div className="bg-white rounded-lg p-5 border border-[#E6E6E3] space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <TrustLabel label={test.trust_label} size="sm" showTooltip />
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                  {test.subject || 'General Studies'}
                </span>
                <Badge variant="blue" size="sm">
                  {formatTestType(test.test_type)}
                </Badge>
                <Badge
                  variant={test.difficulty === 'hard' ? 'rose' : test.difficulty === 'medium' ? 'amber' : 'emerald'}
                  size="sm"
                >
                  {test.difficulty || 'Medium'} Difficulty
                </Badge>
                <Badge variant={test.is_paid ? 'emerald' : 'gray'} size="sm">
                  {test.is_paid ? `₹${test.price_inr}` : 'Free Access'}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-[#202124] tracking-tight">
                {test.title}
              </h1>

              {test.description && (
                <p className="text-xs sm:text-sm text-[#787774] leading-relaxed max-w-3xl">
                  {test.description}
                </p>
              )}
            </div>

            {/* Launch CTA */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 shrink-0">
              {test.is_paid && !test.has_access ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Unlock Assessment (₹{test.price_inr})
                </Button>
              ) : (
                <Link href={`/tests/${test.id}/start`}>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    {attempts.length > 0 ? 'Retake Exam' : 'Start Assessment'}
                  </Button>
                </Link>
              )}
              <p className="text-[11px] text-center text-[#9b9a97]">
                {test.is_paid && !test.has_access
                  ? 'Premium access required to launch'
                  : 'CBT interface with countdown timer'}
              </p>
            </div>
          </div>

          {/* Properties Table */}
          <div className="pt-4 border-t border-[#E6E6E3]">
            <PropertyTable>
              <PropertyRow icon={Layers} label="Total Items">
                <span className="font-mono text-xs text-[#202124] font-medium">
                  {questions.length} Questions
                </span>
              </PropertyRow>

              <PropertyRow icon={Clock} label="Duration">
                <span className="font-mono text-xs text-[#202124]">
                  {formatDuration(test.duration_seconds)}
                </span>
              </PropertyRow>

              <PropertyRow icon={Award} label="Marking Scheme">
                <span className="font-mono text-xs text-[#202124]">
                  +{test.default_correct_marks} / -{test.default_negative_marks}
                </span>
              </PropertyRow>

              <PropertyRow icon={Users} label="Community Attempts">
                <span className="font-mono text-xs text-[#787774]">
                  {test.total_attempts_count || attempts.length} Recorded
                </span>
              </PropertyRow>
            </PropertyTable>
          </div>

          {/* Creator Attribution */}
          <div className="pt-3 border-t border-[#E6E6E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Link
              href={`/creators/${test.user_id}`}
              className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-md bg-[#F1F1EF] border border-[#E6E6E3] text-[#202124] flex items-center justify-center font-semibold text-xs">
                {test.creator_name?.charAt(0) || 'E'}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[#202124] group-hover:underline text-xs">
                    {test.creator_name || 'Academic Faculty'}
                  </span>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-[11px] text-[#787774]">
                  {test.creator_headline || 'Senior Assessment Chair'} • {test.creator_institute || 'Nalanda Academic Board'}
                </p>
              </div>
            </Link>

            <Link href={`/creators/${test.user_id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                View Creator Profile <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Personal Attempt Progression */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase text-[#787774] tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Your Personal Attempt Progression
            </h2>
            <span className="text-xs font-mono text-[#9b9a97]">
              {attempts.length} Attempt{attempts.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-[#E6E6E3] text-center space-y-2.5">
              <p className="text-xs text-[#787774]">You haven't attempted this test paper yet.</p>
              <Link href={`/tests/${test.id}/start`} className="inline-block">
                <Button variant="primary" size="sm">
                  <Play className="w-3 h-3 mr-1 fill-current" /> Take Test Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E6E6E3] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[#787774] font-medium uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Attempt</th>
                      <th className="py-2.5 px-3.5">Date</th>
                      <th className="py-2.5 px-3.5">Score</th>
                      <th className="py-2.5 px-3.5">Percentage</th>
                      <th className="py-2.5 px-3.5">Accuracy</th>
                      <th className="py-2.5 px-3.5">Time Taken</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E3]">
                    {attempts.map((att: any, idx: number) => {
                      const attemptNumber = attempts.length - idx;
                      return (
                        <tr key={att.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="py-2.5 px-3.5 font-medium text-[#202124]">
                            Attempt #{attemptNumber}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#787774] font-mono">
                            {new Date(att.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono font-medium text-[#202124]">
                            {att.final_score} / {att.maximum_marks}
                          </td>
                          <td className="py-2.5 px-3.5 font-medium text-emerald-700 font-mono">
                            {att.percentage}%
                          </td>
                          <td className="py-2.5 px-3.5 text-[#787774] font-mono">
                            {att.accuracy}%
                          </td>
                          <td className="py-2.5 px-3.5 text-[#787774] font-mono">
                            {Math.floor(att.time_taken_seconds / 60)}m {att.time_taken_seconds % 60}s
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <Link
                              href={`/exam/${att.id}/result`}
                              className="inline-flex items-center gap-1 text-[#202124] hover:underline font-medium"
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
        <div className="bg-white rounded-lg border border-[#E6E6E3] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[#202124]">
                Question Paper Structure ({questions.length} Items)
              </h3>
              <p className="text-[11px] text-[#787774] mt-0.5">
                Inspect question distribution, answer keys, and pedagogical solutions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              {showQuestions ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" /> Hide Questions
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" /> Preview Questions
                </>
              )}
            </Button>
          </div>

          {showQuestions && (
            <div className="space-y-3 pt-3 border-t border-[#E6E6E3]">
              {questions.map((q: any) => (
                <div
                  key={q.id || q.question_number}
                  className="p-3.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#202124] font-mono">
                      Question #{q.question_number}
                    </span>
                    <span className="font-mono text-emerald-800 text-[11px] bg-[#ebf5e8] px-1.5 py-0.5 rounded border border-[#c4e2b8]">
                      Correct: Key {q.correct_answer} (+{q.correct_marks} / -{q.negative_marks})
                    </span>
                  </div>

                  <p className="text-[#202124] leading-relaxed">{q.question_text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt: any, oIdx: number) => {
                      const isCorrect = opt.label === q.correct_answer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border text-xs transition-colors ${
                            isCorrect
                              ? 'border-[#c4e2b8] bg-[#ebf5e8] font-medium text-[#2b593f]'
                              : 'border-[#E6E6E3] bg-white text-[#202124]'
                          }`}
                        >
                          <span className="font-mono mr-1.5">{opt.label}.</span>
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded bg-white border border-[#E6E6E3] text-[#787774] text-[11px] leading-relaxed">
                      <strong className="text-[#202124] block mb-0.5">Solution:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mock Checkout Modal for Paid Tests */}
        <MockCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          itemType="test"
          itemId={test.id}
          itemTitle={test.title}
          creatorName={test.creator_name}
          priceInr={test.price_inr}
          onSuccess={() => {
            showToast('Access granted! Assessment unlocked.');
            fetchTestDetails();
          }}
        />
      </div>
    </AppShell>
  );
}
