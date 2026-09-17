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
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={Compass}
          title="Examination Blueprints & Frameworks"
          description="Standardized national examination frameworks featuring conducting bodies, curricular stages, and difficulty benchmarks."
          badge={<Badge variant="saffron" size="sm">National Frameworks</Badge>}
          actions={
            <Link href="/onboarding">
              <Button variant="secondary" size="sm">
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                Rerun Onboarding Wizard
              </Button>
            </Link>
          }
        />

        {actionSuccess && (
          <div className="p-3 bg-[#edf3ec] border border-[#d3e5d2] rounded-md text-xs text-[#1c3829] flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#0f7b6c] shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === c.id
                  ? 'bg-[#37352f] text-white font-medium'
                  : 'bg-white border border-[#ebebeb] text-[#787774] hover:bg-[#f7f6f3]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-[#787774] font-mono">
            Loading Examination Frameworks...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div
                  key={ex.id}
                  className={`p-5 rounded-lg border flex flex-col justify-between transition-colors bg-white ${
                    isPrimary
                      ? 'border-[#37352f] shadow-xs'
                      : 'border-[#ebebeb] hover:border-[#d4d4d4]'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#f1f1ef] text-[#37352f]">
                            {ex.code}
                          </span>
                          {statusBadge}
                        </div>

                        <h3 className="text-base font-semibold text-[#37352f] pt-0.5">
                          {ex.title}
                        </h3>

                        {ex.conducting_body && (
                          <div className="flex items-center gap-1.5 text-xs text-[#787774]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0f7b6c] shrink-0" />
                            <span>Conducting Body: <strong className="text-[#37352f] font-medium">{ex.conducting_body}</strong></span>
                          </div>
                        )}
                      </div>

                      <Badge variant="stone" size="sm">
                        {ex.difficulty_level || 'National Level'}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#787774] leading-relaxed line-clamp-2">
                      {ex.description}
                    </p>

                    {/* Pattern Summary */}
                    {ex.pattern_summary && (
                      <div className="p-2.5 rounded-md bg-[#fbfbfa] border border-[#ebebeb] text-xs text-[#787774]">
                        <strong className="text-[#37352f] block mb-0.5 font-medium">Exam Pattern:</strong>
                        {ex.pattern_summary}
                      </div>
                    )}

                    {/* Subjects List */}
                    {ex.subjects && ex.subjects.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#9b9a97] block">
                          Included Disciplines
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ex.subjects.map((sub: any) => (
                            <span
                              key={sub.id}
                              className="px-1.5 py-0.5 rounded text-[11px] bg-[#f7f6f3] text-[#37352f] border border-[#ebebeb]"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metrics Specs */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#ebebeb] text-xs text-[#787774] font-mono">
                      <div>
                        <span className="text-[10px] text-[#9b9a97] block uppercase">Total Marks</span>
                        <strong className="text-[#37352f] text-sm">{ex.total_marks}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9b9a97] block uppercase">Duration</span>
                        <strong className="text-[#37352f] text-sm">{ex.total_duration_minutes}m</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9b9a97] block uppercase">Target Year</span>
                        <strong className="text-[#37352f] text-sm">{ex.target_year}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-4 flex items-center justify-between gap-3 mt-2 border-t border-[#ebebeb]">
                    {!isPrimary ? (
                      <button
                        onClick={() => handleSetPrimary(ex)}
                        className="text-xs font-medium text-[#787774] hover:text-[#37352f] flex items-center gap-1"
                      >
                        <Target className="w-3.5 h-3.5" />
                        Set as Primary
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-[#0f7b6c] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Primary Target
                      </span>
                    )}

                    <Link href={`/exams/${ex.id}`}>
                      <Button variant={isPrimary ? 'primary' : 'secondary'} size="sm">
                        Open Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
