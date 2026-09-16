'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Calendar,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function LearningPathPage() {
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
          Loading Learning Path Units...
        </div>
      </AppShell>
    );
  }

  const exam = data?.activeExam || { title: 'SSC CGL 2026' };
  const path = data?.learningPath;
  const units = path?.units || [];

  return (
    <AppShell
      activeExamTitle={exam.title}
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Strategic Learning Path' },
      ]}
    >
      <PageHeader
        title={path?.title || 'SSC CGL 60-Day Strategic Master Plan'}
        description={path?.description || 'Curated, prerequisite-sequenced curriculum units designed to build deep conceptual stamina and high-speed diagnostic accuracy.'}
        badge={<Badge variant="saffron" size="md">Structured Curriculum</Badge>}
        actions={
          <Link href="/tests">
            <Button variant="saffron" size="sm">
              <Zap className="w-4 h-4 mr-1.5" />
              Practice Diagnostic Drill
            </Button>
          </Link>
        }
      />

      {/* Path Target Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono block">Timeline</span>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">{path?.target_days || 60} Days</div>
          <span className="text-xs text-stone-500">Structured Sprint Duration</span>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono block">Weekly Commitment</span>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">{path?.recommended_hours_per_week || 18.0} hrs/week</div>
          <span className="text-xs text-stone-500">Self-study + practice drills</span>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono block">Curriculum Units</span>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">{units.length} Modules</div>
          <span className="text-xs text-emerald-700 font-medium">4 Completed (50% Milestone)</span>
        </div>
      </div>

      {/* Sequential Unit Cards */}
      <div className="space-y-4">
        {units.map((u: any, idx: number) => {
          const isCompleted = idx < 4;
          const isCurrent = idx === 4;

          return (
            <Card
              key={u.id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isCurrent
                  ? 'ring-2 ring-amber-500/80 bg-amber-50/20'
                  : 'hover:border-stone-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 text-stone-500 border-stone-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      Unit {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-stone-600">
                      {u.subject_name}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs font-mono text-stone-500">
                      Weightage: {u.weightage_percentage || 8}%
                    </span>
                    <Badge variant={isCompleted ? 'emerald' : isCurrent ? 'saffron' : 'stone'} size="sm">
                      {isCompleted ? 'Mastered' : isCurrent ? 'Active Unit' : 'Upcoming'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900">
                    {u.topic_title}
                  </h3>

                  <p className="text-xs text-stone-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated: {u.estimated_minutes} minutes</span>
                    <span>•</span>
                    <span>{u.is_core ? 'Core Essential' : 'Elective Enrichment'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/exams/${exam.id || 'exam-ssc-cgl-2026'}`}>
                  <Button variant="outline" size="sm">
                    View Resources
                  </Button>
                </Link>
                <Link href="/tests">
                  <Button variant={isCurrent ? 'saffron' : 'secondary'} size="sm">
                    {isCompleted ? 'Review Drill' : 'Start Practice'}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
