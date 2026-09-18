'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Star,
  Users,
  Layers,
  BookOpen,
  ArrowLeft,
  Share2,
  Play,
  Clock,
  Award,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrustLabel } from '@/components/ui/TrustLabel';

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;

  // In learner-first workspace mode, creator profiles redirect to the public assessment library
  useEffect(() => {
    router.replace('/library');
  }, [router]);

  const [creator, setCreator] = useState<any | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [contentFilter, setContentFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCreatorData = () => {
    fetch(`/api/creators/${creatorId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Creator not found');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCreator(data.creator);
          setTests(data.tests || []);
          setTestSeries(data.test_series || []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCreatorData();
  }, [creatorId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFollowToggle = async () => {
    if (!creator) return;
    try {
      const res = await fetch(`/api/creators/${creatorId}/follow`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCreator((prev: any) => ({
          ...prev,
          is_following: data.following,
          followers_count: data.followers_count,
        }));
        showToast(data.message);
      } else {
        showToast(data.error || 'Failed to update follow status');
      }
    } catch (err: any) {
      showToast(err.message || 'Error following creator');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Creator profile link copied to clipboard');
    } else {
      showToast(`Profile: ${url}`);
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
          <p className="text-xs text-[#787774]">Loading educator faculty portfolio...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !creator) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-md border border-[#E6E6E3] text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#eb5757] mx-auto" />
          <h3 className="font-semibold text-[#202124] text-base">Creator Not Found</h3>
          <p className="text-xs text-[#787774]">
            The requested faculty profile could not be located in the academic registry.
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

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Public Library', href: '/library' },
        { label: 'Verified Creators', href: '/library' },
        { label: creator.name, href: `/creators/${creator.id}` },
      ]}
    >
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white text-xs px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 max-w-5xl mx-auto">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Library
        </Link>

        {/* Creator Hero Header */}
        <div className="bg-white rounded-md p-5 sm:p-6 border border-[#E6E6E3] space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[4px] bg-[#FFFBEB] border border-[#f1e0b5] text-[#4d3800] flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
                {creator.name?.charAt(0) || 'F'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-[#202124] tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-[3px] bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Faculty
                  </span>
                </div>
                <p className="text-xs font-medium text-[#787774]">
                  {creator.headline}
                </p>
                <p className="text-[11px] text-[#9b9a97]">
                  {creator.institute_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleFollowToggle}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  creator.is_following
                    ? 'bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3] hover:bg-[#f1f1ef]'
                    : 'bg-[#202124] text-white hover:bg-[#2f2d28]'
                }`}
              >
                {creator.is_following ? 'Following Educator' : 'Follow Faculty'}
              </button>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-[4px] border border-[#E6E6E3] bg-white text-[#787774] hover:bg-[#F1F1EF] transition-colors"
                title="Share faculty profile"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#E6E6E3]">
            <h4 className="text-[10px] uppercase tracking-wider font-semibold text-[#787774]">
              Academic Pedagogical Philosophy
            </h4>
            <p className="text-xs sm:text-sm text-[#202124] leading-relaxed max-w-3xl">
              {creator.bio}
            </p>
          </div>

          {/* Specialization Tags */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase tracking-wider font-semibold text-[#787774]">
              Subject Specializations
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(creator.specializations || []).map((subj: string) => (
                <span
                  key={subj}
                  className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E6E6E3]">
            <div className="p-3 rounded-[4px] bg-[#fcfbf9] border border-[#E6E6E3]">
              <span className="text-[10px] uppercase tracking-wider text-[#787774] block">
                Total Learners
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-3.5 h-3.5 text-[#787774]" />
                <span className="font-semibold text-sm text-[#202124]">
                  {(creator.total_students || 1200).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-[#fcfbf9] border border-[#E6E6E3]">
              <span className="text-[10px] uppercase tracking-wider text-[#787774] block">
                Free Resources
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Layers className="w-3.5 h-3.5 text-[#787774]" />
                <span className="font-semibold text-sm text-[#202124]">
                  {creator.free_resources_count ?? tests.filter((t: any) => !t.is_paid).length} Free
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-[#fcfbf9] border border-[#E6E6E3]">
              <span className="text-[10px] uppercase tracking-wider text-[#787774] block">
                Paid / Master Series
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Award className="w-3.5 h-3.5 text-[#B7791F]" />
                <span className="font-semibold text-sm text-[#202124]">
                  {creator.paid_resources_count ?? (tests.filter((t: any) => t.is_paid).length + testSeries.length)} Premium
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-[#fcfbf9] border border-[#E6E6E3]">
              <span className="text-[10px] uppercase tracking-wider text-[#787774] block">
                Quality Index
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-3.5 h-3.5 fill-[#B7791F] text-[#B7791F]" />
                <span className="font-semibold text-sm text-[#202124]">
                  {Number(creator.average_rating || 4.9).toFixed(1)} / 5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Type Filter Bar */}
        <div className="p-1.5 bg-white rounded-md border border-[#E6E6E3] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#787774] uppercase text-[10px] font-semibold px-2">Filter:</span>
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'free', label: 'Free Resources' },
              { id: 'paid', label: 'Paid Series & Mocks' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setContentFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                  contentFilter === f.id
                    ? 'bg-[#202124] text-white'
                    : 'text-[#787774] hover:bg-[#F1F1EF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-[#787774] text-[11px] pr-2 hidden sm:inline">
            Curated pedagogical assessments
          </span>
        </div>

        {/* Test Series by this Creator */}
        {testSeries.filter((s: any) => {
          if (contentFilter === 'free' && s.is_paid) return false;
          if (contentFilter === 'paid' && !s.is_paid) return false;
          return true;
        }).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2 border-b border-[#E6E6E3] pb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
              Published Master Test Series
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testSeries
                .filter((s: any) => {
                  if (contentFilter === 'free' && s.is_paid) return false;
                  if (contentFilter === 'paid' && !s.is_paid) return false;
                  return true;
                })
                .map((s) => (
                  <div key={s.id} className="p-4 bg-white rounded-md border border-[#E6E6E3] flex flex-col justify-between space-y-3 hover:bg-[#fcfbf9] transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] border border-[#f1e0b5]">
                          {s.exam_title || 'Target Exam 2026'}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${
                          s.is_paid
                            ? 'bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb]'
                            : 'bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]'
                        }`}>
                          {s.is_paid ? `₹${s.price_inr}` : 'Free Access'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#202124]">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[#787774] line-clamp-2">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-[#787774]">{s.total_tests || 5} Full Mocks</span>
                      <Link href={`/series/${s.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Explore Series <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tests Authored by this Creator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-1.5">
            <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#787774]" />
              Individual Diagnostic Papers
            </h2>
          </div>

          {tests.filter((t: any) => {
            if (contentFilter === 'free' && t.is_paid) return false;
            if (contentFilter === 'paid' && !t.is_paid) return false;
            return true;
          }).length === 0 ? (
            <div className="bg-white border border-[#E6E6E3] rounded-md p-6 text-center text-xs text-[#787774]">
              No individual test papers match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tests
                .filter((t: any) => {
                  if (contentFilter === 'free' && t.is_paid) return false;
                  if (contentFilter === 'paid' && !t.is_paid) return false;
                  return true;
                })
                .map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-md border border-[#E6E6E3] p-4 hover:bg-[#fcfbf9] transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <TrustLabel label={test.trust_label} size="sm" showTooltip />
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${
                          test.is_paid
                            ? 'bg-[#edf6f9] text-[#1e6074] border border-[#cbe4eb]'
                            : 'bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]'
                        }`}>
                          {test.is_paid ? `₹${test.price_inr}` : 'Free'}
                        </span>
                      </div>

                      <Link
                        href={`/tests/${test.id}`}
                        className="font-semibold text-sm text-[#202124] hover:underline transition-colors line-clamp-2"
                      >
                        {test.title}
                      </Link>

                      {test.description && (
                        <p className="text-xs text-[#787774] line-clamp-2">
                          {test.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]">
                          {test.subject || 'General Studies'}
                        </span>
                        <span className="text-[10px] font-mono text-[#787774]">
                          {test.question_count || 25} Qs • {formatDuration(test.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6E6E3] flex items-center gap-2">
                      <Link href={`/tests/${test.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full text-xs">
                          Details
                        </Button>
                      </Link>
                      <Link href={`/tests/${test.id}/start`} className="flex-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs"
                          icon={<Play className="w-3 h-3 fill-current" />}
                        >
                          {test.is_paid ? 'Unlock' : 'Attempt'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Academic Trust & Copyright Integrity Notice */}
        <div className="p-3.5 bg-[#F1F1EF] rounded-md border border-[#E6E6E3] text-xs text-[#787774] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#787774] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-medium text-[#202124]">Academic Pedagogy & Copyright Integrity Notice</span>
            <p className="text-[11px] text-[#787774] leading-relaxed">
              All questions, solutions, and forensic explanations on this faculty portfolio are authored under the Nalanda Educational Code of Honor. Authors retain copyright for original assessment compilations; unverified copying, scraping, or external monetization without permission is subject to intellectual property enforcement.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
