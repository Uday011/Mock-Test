'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Check,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ExamsCatalogPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [primaryEnrollment, setPrimaryEnrollment] = useState<any>(null);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (data.exams) setExams(data.exams);
      if (data.primaryEnrollment) setPrimaryEnrollment(data.primaryEnrollment);
      if (data.userEnrollments) setUserEnrollments(data.userEnrollments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSetPrimary = async (exam: any) => {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: exam.id }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nalanda_active_exam', exam.title);
        setActionSuccess(`Target exam updated to ${exam.title}`);
        fetchExams();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredExams = categoryFilter === 'all'
    ? exams
    : exams.filter((e) => e.category === categoryFilter);

  const categories = [
    { id: 'all', label: 'All Frameworks' },
    { id: 'government_job', label: 'Staff Selection (SSC)' },
    { id: 'medical', label: 'Medical (NEET UG)' },
    { id: 'civil_services', label: 'Civil Services (UPSC)' },
    { id: 'engineering', label: 'Engineering (JEE)' },
  ];

  return (
    <AppShell
      breadcrumbs={[{ label: 'Target Exams', href: '/exams' }]}
      activeExamTitle={primaryEnrollment?.exam_title || 'SSC CGL 2026'}
    >
      <PageHeader
        title="Examination Discovery & Blueprints"
        description="Standardized national examination frameworks featuring conducting bodies, curricular stages, and difficulty benchmarks."
        badge={<Badge variant="saffron" size="md">National Frameworks</Badge>}
        actions={
          <Link href="/onboarding">
            <Button variant="secondary" size="sm">
              <Compass className="w-4 h-4 mr-1.5" />
              Rerun Onboarding Wizard
            </Button>
          </Link>
        }
      />

      {actionSuccess && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

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
        <div className="py-20 text-center text-xs text-stone-500 font-mono">
          Loading Examination Frameworks...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((ex) => {
            const isPrimary = primaryEnrollment?.exam_id === ex.id;
            const isEnrolled = userEnrollments.some((enr) => enr.exam_id === ex.id);

            let statusBadge = <Badge variant="stone" size="sm">Not Enrolled</Badge>;
            if (isPrimary) {
              statusBadge = <Badge variant="emerald" size="sm" dot>Primary Target</Badge>;
            } else if (isEnrolled) {
              statusBadge = <Badge variant="saffron" size="sm" dot>Enrolled</Badge>;
            }

            return (
              <Card
                key={ex.id}
                className={`p-6 flex flex-col justify-between transition-all bg-white ${
                  isPrimary
                    ? 'ring-2 ring-amber-500/80 bg-amber-50/20 border-amber-300'
                    : 'hover:border-stone-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Header: Badges & Conducting Body */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {ex.code}
                        </span>
                        {statusBadge}
                      </div>

                      <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 pt-1">
                        {ex.title}
                      </h3>

                      {ex.conducting_body && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Conducting Body: <strong className="text-stone-700">{ex.conducting_body}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge variant="stone" size="sm">
                        {ex.difficulty_level || 'National Level'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {ex.description}
                  </p>

                  {/* Pattern Summary */}
                  {ex.pattern_summary && (
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
                      <strong className="text-stone-900 block mb-0.5">Exam Pattern:</strong>
                      {ex.pattern_summary}
                    </div>
                  )}

                  {/* Subjects List */}
                  {ex.subjects && ex.subjects.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                        Included Disciplines & Subjects
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ex.subjects.map((sub: any) => (
                          <span
                            key={sub.id}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metrics Specs */}
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

                {/* Actions Row */}
                <div className="pt-4 flex items-center justify-between gap-3 mt-2">
                  {!isPrimary ? (
                    <button
                      onClick={() => handleSetPrimary(ex)}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
                    >
                      <Target className="w-3.5 h-3.5" />
                      Set as Primary Target
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active Primary
                    </span>
                  )}

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
