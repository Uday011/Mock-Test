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
  Bookmark,
  Play,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrustLabel } from '@/components/ui/TrustLabel';

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Loading educator faculty portfolio...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !creator) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-stone-900 font-serif text-lg">Creator Not Found</h3>
          <p className="text-xs text-stone-500">
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
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 max-w-5xl mx-auto">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Library
        </Link>

        {/* Creator Hero Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-serif font-bold text-2xl sm:text-3xl shrink-0 shadow-2xs">
                {creator.name?.charAt(0) || 'F'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Faculty
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-amber-800">
                  {creator.headline}
                </p>
                <p className="text-xs text-stone-500">
                  {creator.institute_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleFollowToggle}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  creator.is_following
                    ? 'bg-stone-100 text-stone-800 border border-stone-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {creator.is_following ? 'Following Educator' : 'Follow Faculty'}
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                title="Share faculty profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Academic Pedagogical Philosophy
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {creator.bio}
            </p>
          </div>

          {/* Specialization Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Subject Specializations
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(creator.specializations || []).map((subj: string) => (
                <span
                  key={subj}
                  className="text-xs px-3 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 font-medium"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Total Learners
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-stone-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {(creator.total_students || 1200).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Free Resources
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Layers className="w-4 h-4 text-stone-600" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {creator.free_resources_count ?? tests.filter((t: any) => !t.is_paid).length} Free
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Paid / Master Series
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="font-serif font-bold text-base text-amber-900">
                  {creator.paid_resources_count ?? (tests.filter((t: any) => t.is_paid).length + testSeries.length)} Premium
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Quality Index
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-serif font-bold text-base text-stone-900">
                  {Number(creator.average_rating || 4.9).toFixed(1)} / 5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Type Filter Bar */}
        <div className="p-2 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-400 uppercase text-[10px] font-bold px-2">Catalog Filter:</span>
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'free', label: 'Free Resources' },
              { id: 'paid', label: 'Paid Series & Mocks' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setContentFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                  contentFilter === f.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-stone-400 font-mono text-[11px] pr-3 hidden sm:inline">
            Showing curated pedagogical assessments
          </span>
        </div>

        {/* Test Series by this Creator */}
        {testSeries.filter((s: any) => {
          if (contentFilter === 'free' && s.is_paid) return false;
          if (contentFilter === 'paid' && !s.is_paid) return false;
          return true;
        }).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-stone-700" />
              Published Master Test Series
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testSeries
                .filter((s: any) => {
                  if (contentFilter === 'free' && s.is_paid) return false;
                  if (contentFilter === 'paid' && !s.is_paid) return false;
                  return true;
                })
                .map((s) => (
                  <Card key={s.id} className="p-5 bg-white border-stone-200 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {s.exam_title || 'Target Exam 2026'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                          s.is_paid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {s.is_paid ? `₹${s.price_inr}` : 'Free Access'}
                        </span>
                      </div>
                      <h3 className="text-sm font-serif font-bold text-stone-900">
                        {s.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                      <span className="font-mono text-stone-500">{s.total_tests || 5} Full Mocks</span>
                      <Link href={`/series/${s.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Explore Series <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Tests Authored by this Creator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-700" />
              Individual Diagnostic Papers
            </h2>
          </div>

          {tests.filter((t: any) => {
            if (contentFilter === 'free' && t.is_paid) return false;
            if (contentFilter === 'paid' && !t.is_paid) return false;
            return true;
          }).length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500">
              No individual test papers match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests
                .filter((t: any) => {
                  if (contentFilter === 'free' && t.is_paid) return false;
                  if (contentFilter === 'paid' && !t.is_paid) return false;
                  return true;
                })
                .map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <TrustLabel label={test.trust_label} size="sm" showTooltip />
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          test.is_paid
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {test.is_paid ? `₹${test.price_inr}` : 'Free'}
                        </span>
                      </div>

                      <Link
                        href={`/tests/${test.id}`}
                        className="font-serif font-bold text-sm text-stone-900 hover:text-amber-800 transition-colors line-clamp-2"
                      >
                        {test.title}
                      </Link>

                      {test.description && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {test.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {test.subject || 'General Studies'}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {test.question_count || 25} Qs • {formatDuration(test.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
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
                          {test.is_paid ? 'Unlock Test' : 'Attempt Free'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Academic Trust & Copyright Integrity Notice */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-stone-900">Academic Pedagogy & Copyright Integrity Notice</span>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              All questions, solutions, and forensic explanations on this faculty portfolio are authored under the Nalanda Educational Code of Honor. Authors retain copyright for original assessment compilations; unverified copying, scraping, or external monetization without permission is subject to intellectual property enforcement.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
