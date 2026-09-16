'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MistakeNotebookPage() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, calc_count: 0, concept_count: 0, rush_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMistakes = async () => {
    try {
      const res = await fetch(`/api/mistakes?category=${activeCategory}`);
      const data = await res.json();
      if (data.success) {
        setMistakes(data.mistakes);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, [activeCategory]);

  const handleToggleResolved = async (id: string, currentResolved: number) => {
    try {
      await fetch('/api/mistakes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_resolved: currentResolved === 1 ? 0 : 1 }),
      });
      fetchMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'calculation_error':
        return <Badge variant="saffron" size="sm">Calculation Slip</Badge>;
      case 'conceptual_gap':
        return <Badge variant="rose" size="sm">Conceptual Gap</Badge>;
      case 'time_rush':
        return <Badge variant="stone" size="sm">Time Pressure</Badge>;
      default:
        return <Badge variant="stone" size="sm">{cat}</Badge>;
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.question_text.toLowerCase().includes(q) ||
      m.topic_title?.toLowerCase().includes(q) ||
      m.subject_name?.toLowerCase().includes(q) ||
      m.user_notes?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Mistake Notebook' },
      ]}
    >
      <PageHeader
        title="Cognitive Mistake Notebook"
        description="Forensic error analysis separating mechanical calculation slips from deep conceptual gaps and time pressure rushing."
        badge={<Badge variant="rose" size="md">{counts.total} Logged Errors</Badge>}
        actions={
          <Link href="/tests">
            <Button variant="saffron" size="sm">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Practice Remedial Drill
            </Button>
          </Link>
        }
      />

      {/* Forensic Breakdown Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Total Logged"
          value={counts.total}
          subtext="From diagnostic attempts"
          accent="stone"
        />
        <MetricCallout
          label="Conceptual Gaps"
          value={counts.concept_count || 0}
          subtext="Requires theoretical review"
          accent="rose"
        />
        <MetricCallout
          label="Calculation Slips"
          value={counts.calc_count || 0}
          subtext="Arithmetic & precision errors"
          accent="saffron"
        />
        <MetricCallout
          label="Time Pressure"
          value={counts.rush_count || 0}
          subtext="Rushed reading / cadence"
          accent="navy"
        />
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `All Errors (${counts.total})` },
            { id: 'conceptual_gap', label: `Conceptual Gaps (${counts.concept_count || 0})` },
            { id: 'calculation_error', label: `Calculation Slips (${counts.calc_count || 0})` },
            { id: 'time_rush', label: `Time Rush (${counts.rush_count || 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search questions or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>
      </div>

      {/* Mistakes Ledger */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500 font-mono">
          Loading Error Forensics...
        </div>
      ) : filteredMistakes.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Mistakes In This Category"
          description="You have resolved or have no logged errors under this diagnostic filter. Keep attempting mock tests to refine your cognitive calibration."
          action={
            <Link href="/tests">
              <Button variant="saffron" size="sm">Attempt a Diagnostic Mock</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((m) => {
            const options = m.options_json ? JSON.parse(m.options_json) : [];

            return (
              <Card
                key={m.id}
                className={`p-5 sm:p-6 transition-all ${
                  m.is_resolved ? 'opacity-70 bg-stone-50/50' : 'bg-white hover:border-stone-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(m.error_category)}
                      <span className="text-xs font-semibold text-stone-700">
                        {m.subject_name}
                      </span>
                      {m.topic_title && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs text-stone-500">{m.topic_title}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-stone-400">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleToggleResolved(m.id, m.is_resolved)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                          m.is_resolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {m.is_resolved ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            Resolved
                          </>
                        ) : (
                          'Mark Resolved'
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-stone-900 leading-relaxed">
                    {m.question_text}
                  </p>

                  {/* Options List */}
                  {options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {options.map((opt: any) => {
                        const isSelected = opt.label === m.selected_answer;
                        const isCorrect = opt.label === m.correct_answer;

                        let style = 'bg-stone-50 border-stone-200 text-stone-700';
                        if (isSelected && !isCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold';
                        } else if (isCorrect) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                        }

                        return (
                          <div
                            key={opt.label}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{opt.label}.</span>
                              <span>{opt.text}</span>
                            </div>
                            {isSelected && !isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-rose-600">
                                Your Pick
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-700">
                                Correct Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pedagogical Explanation */}
                  {m.explanation && (
                    <div className="text-xs text-stone-600 bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/80 leading-relaxed">
                      <strong className="text-stone-900 block mb-1">Pedagogical Derivation & Proof:</strong>
                      {m.explanation}
                    </div>
                  )}

                  {/* Reflection Notes */}
                  {m.user_notes && (
                    <div className="text-xs text-amber-900 bg-amber-50/80 p-3 rounded-lg border border-amber-200/80 leading-relaxed">
                      <strong className="block mb-0.5 text-amber-950 font-semibold">Forensic Reflection:</strong>
                      {m.user_notes}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
