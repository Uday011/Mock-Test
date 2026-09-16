'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function PerformanceAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/overview')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-stone-500 font-mono">
          Loading Diagnostic Metrics & Readiness Curves...
        </div>
      </AppShell>
    );
  }

  const exam = data?.activeExam || { title: 'SSC CGL 2026' };
  const stats = data?.stats || {
    predictedScore: 142.0,
    maxScore: 200,
    targetScore: 165.0,
    accuracyRate: 78.5,
    syllabusProgress: 42.0,
  };
  const subjects = data?.subjects || [];

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Performance Analytics' },
      ]}
    >
      <PageHeader
        title="Performance & Examination Readiness"
        description="Empirical diagnostic analysis of score trajectories, accuracy calibration, speed pacing, and subject competencies."
        badge={<Badge variant="emerald" size="md" dot>Readiness Index: 71%</Badge>}
        actions={
          <Link href="/tests">
            <Button variant="saffron" size="sm">
              <Zap className="w-4 h-4 mr-1.5" />
              Attempt Diagnostic Mock
            </Button>
          </Link>
        }
      />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Predicted Tier-I Score"
          value={stats.predictedScore.toFixed(0)}
          max={stats.maxScore}
          subtext={`Cutoff Est: ~138 (Target: ${stats.targetScore})`}
          accent="saffron"
          trend={{ value: '+14 pts vs baseline', isPositive: true }}
        />
        <MetricCallout
          label="Overall Accuracy"
          value={`${stats.accuracyRate}%`}
          subtext="Target benchmark: 82.0%"
          accent="emerald"
          trend={{ value: '+3.1% this month', isPositive: true }}
        />
        <MetricCallout
          label="Pacing Cadence"
          value="52s"
          subtext="Avg time per question (Target: 45-55s)"
          accent="navy"
        />
        <MetricCallout
          label="Readiness Rating"
          value="Competitive"
          subtext="Qualified for Tier-II cutoff tier"
          accent="emerald"
        />
      </div>

      {/* Score Trajectory & Cutoff Comparison */}
      <Card className="p-6 mb-8 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">Score Benchmark Comparison</h3>
            <p className="text-xs text-stone-500">Tier-I Marks distribution against previous year general cutoff</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Your Predicted: 142.0</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> Cutoff Bar: 138.0</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Target: 165.0</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-stone-600">Your Current Predicted Level</span>
              <strong className="text-amber-800">142 / 200 (71.0%)</strong>
            </div>
            <ProgressBar value={142} max={200} size="md" variant="saffron" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-stone-600">SSC CGL Tier-I General Cutoff (UR Benchmark)</span>
              <strong className="text-stone-700">138 / 200 (69.0%)</strong>
            </div>
            <ProgressBar value={138} max={200} size="sm" variant="stone" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-stone-600">Aspirational Target Score</span>
              <strong className="text-emerald-700">165 / 200 (82.5%)</strong>
            </div>
            <ProgressBar value={165} max={200} size="sm" variant="emerald" />
          </div>
        </div>
      </Card>

      {/* Subject Competency Table */}
      <div className="space-y-4 mb-8">
        <h3 className="text-base font-serif font-bold text-stone-900">Subject Competencies & Speed Matrix</h3>
        <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Mastery</th>
                <th className="py-3 px-4">Practiced</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Avg Pacing</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {subjects.map((sub: any) => {
                const mastery = sub.avg_mastery ? Math.round(sub.avg_mastery) : 65;
                const practiced = sub.total_practiced || 50;
                const acc = sub.total_practiced > 0
                  ? Math.round((sub.total_correct / sub.total_practiced) * 100)
                  : 75;

                return (
                  <tr key={sub.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {sub.code}
                        </span>
                        <span>{sub.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                      {mastery}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {practiced} Qs
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {acc}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      48s / Q
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/exams/exam-ssc-cgl-2026?subject=${sub.id}`}
                        className="text-amber-700 font-semibold hover:underline"
                      >
                        Syllabus →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
