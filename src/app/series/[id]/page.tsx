'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Star,
  Users,
  ShieldCheck,
  Clock,
  Award,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Share2,
  Calendar,
  Sparkles,
  BookOpen,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MockCheckoutModal } from '@/components/modals/MockCheckoutModal';

export default function TestSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;

  const [series, setSeries] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const fetchSeriesData = () => {
    fetch(`/api/series/${seriesId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Test series could not be found');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setSeries(data.series);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSeriesData();
  }, [seriesId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Series link copied to clipboard');
    }
  };

  const handleEnrollFree = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/series/${seriesId}/enroll`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Enrolled successfully!');
        fetchSeriesData();
      } else {
        showToast(data.error || 'Failed to enroll');
      }
    } catch {
      showToast('Error during enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Untimed';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#202124] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#787774]">Loading test series curriculum...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !series) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-md border border-[#E6E6E3] text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#eb5757] mx-auto" />
          <h3 className="font-semibold text-[#202124] text-base">Test Series Not Found</h3>
          <p className="text-xs text-[#787774]">{error || 'This series does not exist or has been unpublished.'}</p>
          <Link href="/library" className="inline-block">
            <Button variant="primary" size="sm">
              Return to Public Library
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const items = series.items || [];
  const nextIncompleteTest = items.find((it: any) => it.has_access && !it.is_attempted) || items[0];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Public Library', href: '/library' },
        { label: 'Test Series', href: '/library' },
        { label: series.title, href: `/series/${series.id}` },
      ]}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white text-xs px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Checkout Modal */}
      <MockCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        itemType="test_series"
        itemId={series.id}
        itemTitle={series.title}
        creatorName={series.creator_name}
        priceInr={series.price_inr}
        onSuccess={() => {
          showToast('Payment confirmed! Series unlocked.');
          fetchSeriesData();
        }}
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#202124] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Library
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-[4px] border border-[#E6E6E3] bg-white text-[#202124] hover:bg-[#F1F1EF] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#787774]" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-md p-5 sm:p-6 border border-[#E6E6E3] space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] border border-[#f1e0b5]">
                  {series.exam_title || 'SSC CGL 2026'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                  {items.length} Mock Examinations
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[3px] bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb]">
                  {series.is_paid ? `₹${series.price_inr} Premium Access` : 'Free Public Series'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
                {series.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#787774] leading-relaxed max-w-3xl">
                {series.description}
              </p>

              {/* Creator Attribution */}
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/creators/${series.creator_id}`}
                  className="flex items-center gap-2 text-xs text-[#202124] hover:text-black group"
                >
                  <div className="w-7 h-7 rounded-[4px] bg-[#FFFBEB] text-[#4d3800] flex items-center justify-center font-bold text-xs border border-[#f1e0b5]">
                    {series.creator_name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <div className="font-medium text-[#202124] flex items-center gap-1 group-hover:underline">
                      <span>{series.creator_name || 'Academic Faculty'}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-[#787774]">
                      {series.creator_institute || 'Nalanda Faculty Board'}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* CTA Pricing & Action Box */}
            <div className="bg-[#fcfbf9] p-4 rounded-md border border-[#E6E6E3] text-center space-y-3 shrink-0 w-full md:w-60">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#787774] block">
                  Series Enrollment
                </span>
                <div className="font-bold text-xl text-[#202124] mt-1">
                  {series.is_paid ? `₹${series.price_inr}` : 'Free'}
                </div>
                {series.is_paid && (
                  <p className="text-[10px] text-[#787774]">Includes all {items.length} mock tests & forensics</p>
                )}
              </div>

              {series.has_access ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-[#edf6f9] px-2.5 py-0.5 rounded-[3px] border border-[#cbe4eb]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Access Active</span>
                  </div>
                  {nextIncompleteTest && (
                    <Link href={`/tests/${nextIncompleteTest.test_id}/start`} className="block">
                      <Button variant="primary" size="sm" className="w-full text-xs" icon={<Play className="w-3 h-3 fill-current" />}>
                        Continue Series
                      </Button>
                    </Link>
                  )}
                </div>
              ) : series.is_paid ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full text-xs"
                  icon={<Lock className="w-3.5 h-3.5" />}
                >
                  Unlock Series Access
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnrollFree}
                  disabled={enrolling}
                  className="w-full text-xs"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Free Series'}
                </Button>
              )}

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#E6E6E3] text-[11px] text-[#787774]">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#B7791F] text-[#B7791F]" />
                  <span>{Number(series.rating || 4.9).toFixed(2)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#787774]" />
                  <span>{(series.enrolled_count || 500).toLocaleString()} Enrolled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learner Progression Bar (if enrolled) */}
          {series.user_progress && (
            <div className="p-3.5 rounded-md bg-[#F1F1EF] border border-[#E6E6E3] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#202124]">Series Completion Progress</span>
                <span className="font-mono text-[11px] text-[#787774]">
                  {series.user_progress.completed_tests_count} of {series.user_progress.total_tests} Tests Completed ({series.user_progress.progress_percentage}%)
                </span>
              </div>
              <ProgressBar value={series.user_progress.progress_percentage} max={100} variant="default" size="sm" />
            </div>
          )}
        </div>

        {/* Ordered Test Curriculum List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
            <div>
              <h3 className="text-sm font-semibold text-[#202124]">
                Recommended Examination Sequence
              </h3>
              <p className="text-[11px] text-[#787774]">
                Tests are structured in progressive cognitive difficulty according to syllabus coverage.
              </p>
            </div>
            <span className="text-xs font-mono text-[#787774]">
              {items.length} Units
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item: any, idx: number) => {
              const isLocked = !item.has_access;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-md border p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isLocked
                      ? 'border-[#E6E6E3] opacity-85'
                      : 'border-[#E6E6E3] hover:bg-[#fcfbf9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-[4px] bg-[#F1F1EF] text-[#787774] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 border border-[#E6E6E3]">
                      {String(item.sequence_order || idx + 1).padStart(2, '0')}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-[#202124] text-sm">
                          {item.test_title}
                        </h4>

                        {item.is_free_preview && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb]">
                            Free Preview
                          </span>
                        )}

                        {isLocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                            <Lock className="w-2.5 h-2.5" />
                            Locked
                          </span>
                        )}

                        {item.is_attempted && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] border border-[#f1e0b5]">
                            Score: {item.best_score}
                          </span>
                        )}
                      </div>

                      {item.test_description && (
                        <p className="text-xs text-[#787774] line-clamp-1">
                          {item.test_description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-[#787774] font-mono pt-0.5">
                        <span>{item.question_count || 25} Questions</span>
                        <span>•</span>
                        <span>{formatDuration(item.duration_seconds)}</span>
                        <span>•</span>
                        <span className="capitalize">{item.difficulty || 'Medium'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <Link href={`/tests/${item.test_id}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>

                    {item.has_access ? (
                      <Link href={`/tests/${item.test_id}/start`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          icon={<Play className="w-3 h-3 fill-current" />}
                        >
                          {item.is_attempted ? 'Retake' : 'Start Mock'}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCheckoutOpen(true)}
                        className="text-xs"
                        icon={<Lock className="w-3 h-3 text-[#787774]" />}
                      >
                        Unlock Test
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
