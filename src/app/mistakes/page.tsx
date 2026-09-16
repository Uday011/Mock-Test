'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Bookmark,
  BookmarkCheck,
  Zap,
  Tag,
  MessageSquare,
  X,
  Play,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const MISTAKE_CATEGORIES = [
  { id: 'all', label: 'All Errors' },
  { id: 'conceptual_gap', label: 'Conceptual Gap' },
  { id: 'calculation_error', label: 'Calculation Slip' },
  { id: 'misread_question', label: 'Misread Question' },
  { id: 'formula_recall', label: 'Formula Recall' },
  { id: 'time_rush', label: 'Time Pressure' },
  { id: 'guessing_error', label: 'Guessing Error' },
  { id: 'carelessness', label: 'Carelessness' },
  { id: 'knowledge_gap', label: 'Knowledge Gap' },
];

export default function MistakeNotebookPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Retry Modal State
  const [retryMistake, setRetryMistake] = useState<any>(null);
  const [selectedRetryAnswer, setSelectedRetryAnswer] = useState<string>('');
  const [retryResult, setRetryResult] = useState<any>(null);
  const [retrySubmitting, setRetrySubmitting] = useState(false);

  // Remedial Test Generator State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testCount, setTestCount] = useState<number>(5);
  const [testCreating, setTestCreating] = useState(false);

  // Inline notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      const url = `/api/mistakes?category=${activeCategory}&status=${activeStatus}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMistakes(data.mistakes || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, [activeCategory, activeStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMistakes();
  };

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

  const handleToggleBookmark = async (id: string, currentBookmarked: number) => {
    try {
      await fetch('/api/mistakes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_bookmarked: currentBookmarked === 1 ? 0 : 1 }),
      });
      fetchMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await fetch('/api/mistakes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_notes: tempNotes }),
      });
      setEditingNotesId(null);
      fetchMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeCategory = async (id: string, newCategory: string) => {
    try {
      await fetch('/api/mistakes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, error_category: newCategory }),
      });
      fetchMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  // Open Retry Modal
  const openRetryModal = (m: any) => {
    setRetryMistake(m);
    setSelectedRetryAnswer('');
    setRetryResult(null);
  };

  // Submit Retry
  const handleSubmitRetry = async () => {
    if (!retryMistake || !selectedRetryAnswer) return;
    try {
      setRetrySubmitting(true);
      const res = await fetch('/api/mistakes/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mistake_id: retryMistake.id,
          selected_answer: selectedRetryAnswer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRetryResult(data);
        fetchMistakes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetrySubmitting(false);
    }
  };

  // Create Remedial Test
  const handleCreateRemedialTest = async () => {
    try {
      setTestCreating(true);
      const res = await fetch('/api/mistakes/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory,
          count: testCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.test_id) {
        router.push(`/tests/${data.test_id}/start`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestCreating(false);
      setShowTestModal(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'conceptual_gap':
        return <Badge variant="rose" size="sm">Conceptual Gap</Badge>;
      case 'calculation_error':
        return <Badge variant="saffron" size="sm">Calculation Slip</Badge>;
      case 'misread_question':
        return <Badge variant="navy" size="sm">Misread Question</Badge>;
      case 'formula_recall':
        return <Badge variant="stone" size="sm">Formula Recall</Badge>;
      case 'time_rush':
        return <Badge variant="stone" size="sm">Time Pressure</Badge>;
      case 'guessing_error':
        return <Badge variant="rose" size="sm">Guessing Error</Badge>;
      case 'carelessness':
        return <Badge variant="saffron" size="sm">Carelessness</Badge>;
      case 'knowledge_gap':
        return <Badge variant="emerald" size="sm">Knowledge Gap</Badge>;
      default:
        return <Badge variant="stone" size="sm">{cat}</Badge>;
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Learner Workspace', href: '/dashboard' },
        { label: 'Mistake Notebook' },
      ]}
    >
      <PageHeader
        title="Forensic Mistake Notebook"
        description="Cognitive error management separating mechanical calculation slips from deep conceptual gaps, misread constraints, and time pressure rushing."
        badge={
          <Badge variant="rose" size="md">
            {counts.total || 0} Logged Errors ({counts.repeated_count || 0} Repeated)
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="saffron"
              size="sm"
              onClick={() => setShowTestModal(true)}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Generate Remedial Mini-Test
            </Button>
          </div>
        }
      />

      {/* Forensic Breakdown Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Unresolved Errors"
          value={counts.unresolved_count || 0}
          subtext={`${counts.resolved_count || 0} already resolved`}
          accent="rose"
        />
        <MetricCallout
          label="Repeated Mistakes"
          value={counts.repeated_count || 0}
          subtext="Missed across multiple attempts"
          accent="saffron"
        />
        <MetricCallout
          label="Conceptual Gaps"
          value={counts.concept_count || 0}
          subtext="Requires theoretical re-derivation"
          accent="navy"
        />
        <MetricCallout
          label="Calculation Slips"
          value={counts.calc_count || 0}
          subtext="Arithmetic & precision errors"
          accent="stone"
        />
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex border-b border-stone-200 mb-6 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'all', label: `All Errors (${counts.total || 0})` },
          { id: 'unresolved', label: `Unresolved (${counts.unresolved_count || 0})` },
          { id: 'repeated', label: `Repeated Mistakes (${counts.repeated_count || 0})` },
          { id: 'bookmarked', label: `Saved for Revision (${counts.bookmarked_count || 0})` },
          { id: 'resolved', label: `Resolved (${counts.resolved_count || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeStatus === tab.id
                ? 'border-amber-600 text-amber-900 bg-amber-50/40'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 8 Categories Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {MISTAKE_CATEGORIES.map((cat) => {
            const countKey =
              cat.id === 'all' ? 'total' :
              cat.id === 'conceptual_gap' ? 'concept_count' :
              cat.id === 'calculation_error' ? 'calc_count' :
              cat.id === 'misread_question' ? 'misread_count' :
              cat.id === 'formula_recall' ? 'formula_count' :
              cat.id === 'time_rush' ? 'rush_count' :
              cat.id === 'guessing_error' ? 'guess_count' :
              cat.id === 'carelessness' ? 'careless_count' :
              cat.id === 'knowledge_gap' ? 'knowledge_count' : 'total';

            const catCount = counts[countKey] || 0;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'}`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search questions or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </form>
      </div>

      {/* Mistakes Ledger */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500 font-mono">
          Filtering and loading forensic error records...
        </div>
      ) : mistakes.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Mistakes In This Diagnostic Filter"
          description="You have zero logged errors matching your current filter criteria. Continue attempting CBT mocks to maintain your forensic error log."
          action={
            <Link href="/tests">
              <Button variant="saffron" size="sm">Attempt a Mock Test</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {mistakes.map((m) => {
            const options = m.options_json ? JSON.parse(m.options_json) : [];
            const isEditingNotes = editingNotesId === m.id;

            return (
              <Card
                key={m.id}
                className={`p-5 sm:p-6 transition-all ${
                  m.is_resolved ? 'opacity-75 bg-stone-50/50' : 'bg-white hover:border-stone-300'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(m.error_category)}
                      <span className="text-xs font-semibold text-stone-800">
                        {m.subject_name}
                      </span>
                      {m.topic_title && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs text-stone-500">{m.topic_title}</span>
                        </>
                      )}
                      {m.attempt_count > 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          {m.attempt_count}x Repeated Mistake
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bookmark Toggle */}
                      <button
                        onClick={() => handleToggleBookmark(m.id, m.is_bookmarked)}
                        title={m.is_bookmarked ? 'Remove Bookmark' : 'Save for Revision'}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          m.is_bookmarked
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        {m.is_bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      {/* Retry Action */}
                      <button
                        onClick={() => openRetryModal(m)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry Blind</span>
                      </button>

                      {/* Mark Resolved */}
                      <button
                        onClick={() => handleToggleResolved(m.id, m.is_resolved)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          m.is_resolved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
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

                  {/* Question Stem */}
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

                  {/* Pedagogical Explanation & Theorem Proof */}
                  {m.explanation && (
                    <div className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-lg border border-stone-200/80 leading-relaxed">
                      <strong className="text-stone-900 block mb-1 font-semibold">Pedagogical Derivation & Proof:</strong>
                      {m.explanation}
                    </div>
                  )}

                  {/* Reflection Notes & Categorization Controls */}
                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Category Reassignment */}
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 font-mono text-[11px]">Reclassify:</span>
                      <select
                        value={m.error_category}
                        onChange={(e) => handleChangeCategory(m.id, e.target.value)}
                        className="py-1 px-2 text-xs rounded border border-stone-200 bg-stone-50 text-stone-700 focus:ring-1 focus:ring-amber-500"
                      >
                        {MISTAKE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reflection Notes Trigger */}
                    <div className="flex items-center gap-2">
                      {!isEditingNotes ? (
                        <div className="flex items-center gap-2">
                          {m.user_notes ? (
                            <span className="text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 text-[11px] italic max-w-md truncate">
                              &ldquo;{m.user_notes}&rdquo;
                            </span>
                          ) : null}
                          <button
                            onClick={() => {
                              setEditingNotesId(m.id);
                              setTempNotes(m.user_notes || '');
                            }}
                            className="text-stone-500 hover:text-stone-900 font-medium text-[11px] underline"
                          >
                            {m.user_notes ? 'Edit Note' : '+ Add Reflection Note'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Why did this mistake happen?..."
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="px-2.5 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 sm:w-64"
                          />
                          <button
                            onClick={() => handleSaveNotes(m.id)}
                            className="px-2 py-1 bg-stone-900 text-white rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="text-stone-400 hover:text-stone-600 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE BLIND RETRY MODAL                             */}
      {/* ========================================================= */}
      {retryMistake && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <span className="font-serif font-bold text-sm text-stone-900">
                  Blind Retry Mode
                </span>
              </div>
              <button
                onClick={() => setRetryMistake(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-500">
              Options are randomized and previous selections are hidden. Solve under clean test conditions.
            </div>

            {/* Question Stem */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-sm font-medium text-stone-900 leading-relaxed">
              {retryMistake.question_text}
            </div>

            {/* Selectable Options */}
            <div className="space-y-2">
              {retryMistake.options_json &&
                JSON.parse(retryMistake.options_json).map((opt: any) => {
                  const isSelected = selectedRetryAnswer === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => !retryResult && setSelectedRetryAnswer(opt.label)}
                      disabled={Boolean(retryResult)}
                      className={`w-full p-3 rounded-lg border text-xs text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold">{opt.label}.</span>
                        <span>{opt.text}</span>
                      </div>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                    </button>
                  );
                })}
            </div>

            {/* Retry Result Feedback */}
            {retryResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                retryResult.is_correct ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {retryResult.is_correct ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Correct Answer! Error Marked Resolved.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-700" />
                      <span>Incorrect Attempt. Correct Key is {retryResult.correct_answer}.</span>
                    </>
                  )}
                </div>
                {retryResult.explanation && (
                  <div className="text-[11px] leading-relaxed pt-1 border-t border-stone-200/40">
                    <strong className="block mb-0.5">Pedagogical Solution:</strong>
                    {retryResult.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              {!retryResult ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setRetryMistake(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="saffron"
                    size="sm"
                    disabled={!selectedRetryAnswer || retrySubmitting}
                    onClick={handleSubmitRetry}
                  >
                    {retrySubmitting ? 'Verifying...' : 'Submit Retry Answer'}
                  </Button>
                </>
              ) : (
                <Button variant="saffron" size="sm" onClick={() => setRetryMistake(null)}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REMEDIAL MINI-TEST GENERATOR MODAL                        */}
      {/* ========================================================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="font-serif font-bold text-sm text-stone-900">
                  Generate Remedial Mini-Test
                </span>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Assemble a custom, timed revision test generated exclusively from your unresolved error notebook to eliminate recurring slips.
            </p>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-stone-700">Question Volume:</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setTestCount(cnt)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      testCount === cnt
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {cnt} Questions ({Math.round(cnt * 1.5)}m)
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <div className="font-semibold">Test Parameters:</div>
              <div>• Section: Mixed CBT Error Simulation</div>
              <div>• Marking Scheme: +2.0 Correct / -0.5 Negative</div>
              <div>• Automatic autosave & immediate scorecard review</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <Button variant="outline" size="sm" onClick={() => setShowTestModal(false)}>
                Cancel
              </Button>
              <Button
                variant="saffron"
                size="sm"
                disabled={testCreating}
                onClick={handleCreateRemedialTest}
              >
                {testCreating ? 'Assembling...' : 'Launch Test Simulation →'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
