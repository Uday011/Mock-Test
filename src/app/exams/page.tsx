'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  BookOpen,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ExamsCatalogPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [primaryEnrollment, setPrimaryEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) setExams(data.exams);
        if (data.primaryEnrollment) setPrimaryEnrollment(data.primaryEnrollment);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = categoryFilter === 'all'
    ? exams
    : exams.filter((e) => e.category === categoryFilter);

  const categories = [
    { id: 'all', label: 'All Catalog' },
    { id: 'government_job', label: 'Staff Selection (SSC)' },
    { id: 'medical', label: 'Medical Entrance (NEET)' },
    { id: 'civil_services', label: 'Civil Services (UPSC)' },
    { id: 'engineering', label: 'Engineering (JEE)' },
  ];

  return (
    <AppShell breadcrumbs={[{ label: 'Target Exams', href: '/exams' }]}>
      <PageHeader
        title="Examination Directory"
        description="Explore national examination frameworks with structured multi-stage blueprints, subject distributions, and syllabus trees."
        badge={<Badge variant="saffron" size="md">Master Catalog</Badge>}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              categoryFilter === c.id
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500 font-mono">
          Loading Examination Frameworks...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((ex) => {
            const isPrimary = primaryEnrollment?.exam_id === ex.id;
            return (
              <Card
                key={ex.id}
                className={`p-5 flex flex-col justify-between transition-all ${
                  isPrimary ? 'ring-2 ring-amber-500/80 bg-amber-50/20' : 'hover:border-stone-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {ex.code}
                        </span>
                        <Badge variant="stone" size="sm">
                          {ex.pattern_type === 'stage_based' ? 'Stage-Based' : 'Multi-Subject'}
                        </Badge>
                        {isPrimary && (
                          <Badge variant="emerald" size="sm" dot>
                            Your Target Exam
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-serif font-bold text-stone-900 pt-1">
                        {ex.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {ex.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-xs text-stone-600 font-mono">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Total Marks</span>
                      <strong className="text-stone-900 text-sm">{ex.total_marks}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Duration</span>
                      <strong className="text-stone-900 text-sm">{ex.total_duration_minutes}m</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Target Year</span>
                      <strong className="text-stone-900 text-sm">{ex.target_year}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    <span>{ex.subjects_count || 4} Subjects</span> • <span>{ex.topics_count || 14} Core Topics</span>
                  </div>

                  <Link href={`/exams/${ex.id}`}>
                    <Button variant={isPrimary ? 'saffron' : 'outline'} size="sm">
                      Open Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
