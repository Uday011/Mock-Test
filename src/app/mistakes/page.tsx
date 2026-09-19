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
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';

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
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
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

  const openRetryModal = (m: any) => {
    setRetryMistake(m);
    setSelectedRetryAnswer('');
    setRetryResult(null);
  };

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
        return <Badge variant="orange" size="sm">Calculation Slip</Badge>;
      case 'misread_question':
        return <Badge variant="blue" size="sm">Misread Question</Badge>;
      case 'formula_recall':
        return <Badge variant="purple" size="sm">Formula Recall</Badge>;
      case 'time_rush':
        return <Badge variant="gray" size="sm">Time Pressure</Badge>;
      case 'guessing_error':
        return <Badge variant="rose" size="sm">Guessing Error</Badge>;
      case 'carelessness':
        return <Badge variant="amber" size="sm">Carelessness</Badge>;
      case 'knowledge_gap':
        return <Badge variant="emerald" size="sm">Knowledge Gap</Badge>;
      default:
        return <Badge variant="gray" size="sm">{cat}</Badge>;
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Review', href: '/mistakes' },
        { label: 'Mistakes' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={AlertTriangle}
          title="Mistakes"
          description="Review questions you answered incorrectly, study the correct solutions, and practice again to master each topic."
          badge={
            <Badge variant="rose" size="sm">
              {counts.total || 0} Mistakes ({counts.repeated_count || 0} Repeated)
            </Badge>
          }
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowTestModal(true)}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Practice Mistakes
            </Button>
          }
        />

        {/* Overview Properties Table */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-3.5">
          <PropertyTable>
            <PropertyRow icon={AlertCircle} label="Unresolved Mistakes">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#e03e3e]">
                  {counts.unresolved_count || 0}
                </span>
                <span className="text-xs text-[#787774]">
                  ({counts.resolved_count || 0} resolved)
                </span>
              </div>
            </PropertyRow>

            <PropertyRow icon={RotateCcw} label="Repeated Mistakes">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {counts.repeated_count || 0}
                </span>
                <span className="text-xs text-[#787774]">Missed in more than one test</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={HelpCircle} label="Conceptual Gaps">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {counts.concept_count || 0}
                </span>
                <span className="text-xs text-[#787774]">Topics requiring syllabus study</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={Clock} label="Calculation Slips">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#202124]">
                  {counts.calc_count || 0}
                </span>
                <span className="text-xs text-[#787774]">Arithmetic and precision errors</span>
              </div>
            </PropertyRow>
          </PropertyTable>
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-[#E6E6E3] overflow-x-auto no-scrollbar gap-1">
          {[
            { id: 'all', label: `All Mistakes (${counts.total || 0})` },
            { id: 'unresolved', label: `Unresolved (${counts.unresolved_count || 0})` },
            { id: 'repeated', label: `Repeated (${counts.repeated_count || 0})` },
            { id: 'bookmarked', label: `Saved Mistakes (${counts.bookmarked_count || 0})` },
            { id: 'resolved', label: `Resolved (${counts.resolved_count || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeStatus === tab.id
                  ? 'border-[#202124] text-[#202124]'
                  : 'border-transparent text-[#787774] hover:text-[#202124]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar: Subject, Category, Search */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="py-2 px-3 text-xs rounded-lg border border-[#E6E6E3] bg-white text-[#202124] focus:outline-none focus:border-[#202124] min-h-[40px] w-full sm:w-auto"
              >
                <option value="all">All Subjects</option>
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="General Intelligence & Reasoning">Reasoning</option>
                <option value="English Comprehension">English</option>
                <option value="General Awareness">General Awareness</option>
              </select>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
              <input
                type="text"
                placeholder="Search mistakes or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E6E6E3] focus:outline-none focus:border-[#202124] bg-white text-[#202124] placeholder:text-[#9b9a97] min-h-[40px]"
              />
            </form>
          </div>

          {/* Horizontal Swipeable Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar select-none">
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
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-[#202124] text-white font-medium shadow-2xs'
                      : 'bg-white border border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F1EF] text-[#787774]'}`}>
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mistakes Database */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#787774] font-mono">
            Loading mistakes...
          </div>
        ) : mistakes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E6E6E3] rounded-xl space-y-3 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-semibold text-sm text-[#202124]">No Mistakes Found</h3>
            <p className="text-xs text-[#787774] max-w-sm mx-auto">
              You have zero logged errors matching your current filter criteria.
            </p>
            <Link href="/tests" className="inline-block">
              <Button variant="primary" size="sm">Take a Practice Test</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {mistakes
              .filter((m) => selectedSubject === 'all' || m.subject_name === selectedSubject)
              .map((m) => {
                const options = m.options_json ? JSON.parse(m.options_json) : [];
                const isEditingNotes = editingNotesId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition-colors space-y-3.5 shadow-2xs ${
                      m.is_resolved
                        ? 'border-[#E6E6E3] bg-[#F7F7F5] opacity-85'
                        : 'border-[#E6E6E3] bg-white hover:border-[#d4d4d4]'
                    }`}
                  >
                    {/* Card Header & Mobile Responsive Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(m.error_category)}
                        <span className="text-xs font-semibold text-[#202124]">
                          {m.subject_name}
                        </span>
                        {m.topic_title && (
                          <>
                            <span className="text-[#E6E6E3]">•</span>
                            {m.topic_id ? (
                              <Link
                                href={`/learn/${m.topic_id}`}
                                className="text-xs text-indigo-700 hover:text-indigo-900 hover:underline font-medium flex items-center gap-1"
                              >
                                <span>{m.topic_title}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-xs text-[#787774]">{m.topic_title}</span>
                            )}
                          </>
                        )}
                        {m.attempt_count > 1 && (
                          <Badge variant="rose" size="sm">
                            {m.attempt_count}x Repeated
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F1EF] w-full sm:w-auto justify-between sm:justify-end">
                        {/* Bookmark Toggle */}
                        <button
                          onClick={() => handleToggleBookmark(m.id, m.is_bookmarked)}
                          title={m.is_bookmarked ? 'Remove from Saved' : 'Save for Revision'}
                          className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border text-xs transition-all active:scale-95 ${
                            m.is_bookmarked
                              ? 'bg-[#fdf5e8] border-[#fae2be] text-[#8f4f00]'
                              : 'bg-white border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF]'
                          }`}
                          aria-label="Bookmark mistake"
                        >
                          {m.is_bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {/* Practice Again Action */}
                        <button
                          onClick={() => openRetryModal(m)}
                          className="flex-1 sm:flex-none px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-lg bg-[#202124] hover:bg-[#333] active:scale-95 text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Practice Again</span>
                        </button>

                        {/* Mark Resolved */}
                        <button
                          onClick={() => handleToggleResolved(m.id, m.is_resolved)}
                          className={`text-xs px-3 py-2 min-h-[40px] rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 border ${
                            m.is_resolved
                              ? 'bg-[#ebf5e8] text-[#2b593f] border-[#c4e2b8]'
                              : 'bg-white hover:bg-[#F1F1EF] text-[#787774] border-[#E6E6E3]'
                          }`}
                        >
                          {m.is_resolved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              Resolved
                            </>
                          ) : (
                            'Resolve'
                          )}
                        </button>
                      </div>
                    </div>

                  {/* Question Stem */}
                  <p className="text-xs sm:text-sm font-medium text-[#202124] leading-relaxed">
                    {m.question_text}
                  </p>

                  {/* Options List */}
                  {options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {options.map((opt: any) => {
                        const isSelected = opt.label === m.selected_answer;
                        const isCorrect = opt.label === m.correct_answer;

                        let style = 'bg-[#F7F7F5] border-[#E6E6E3] text-[#202124]';
                        if (isSelected && !isCorrect) {
                          style = 'bg-[#fff0f0] border-[#f5c2c2] text-[#e03e3e] font-medium';
                        } else if (isCorrect) {
                          style = 'bg-[#ebf5e8] border-[#c4e2b8] text-[#2b593f] font-medium';
                        }

                        return (
                          <div
                            key={opt.label}
                            className={`p-2 rounded-md border flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{opt.label}.</span>
                              <span>{opt.text}</span>
                            </div>
                            {isSelected && !isCorrect && (
                              <span className="text-[10px] uppercase font-mono text-rose-600 font-semibold">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-mono text-emerald-700 font-semibold">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {m.explanation && (
                    <div className="text-xs text-[#202124] bg-[#F7F7F5] p-3 rounded-md border border-[#E6E6E3] leading-relaxed">
                      <strong className="text-[#787774] block mb-0.5">Solution & Explanation:</strong>
                      {m.explanation}
                    </div>
                  )}

                  {/* Reflection Notes & Controls */}
                  <div className="pt-2 border-t border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    {/* Category Reassignment */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#9b9a97] font-mono text-[11px]">Reclassify:</span>
                      <select
                        value={m.error_category}
                        onChange={(e) => handleChangeCategory(m.id, e.target.value)}
                        className="py-0.5 px-1.5 text-xs rounded border border-[#E6E6E3] bg-[#F7F7F5] text-[#202124] focus:outline-none"
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
                            <span className="text-[#8f4f00] bg-[#fdf5e8] px-2 py-0.5 rounded border border-[#fae2be] text-[11px] max-w-md truncate">
                              "{m.user_notes}"
                            </span>
                          ) : null}
                          <button
                            onClick={() => {
                              setEditingNotesId(m.id);
                              setTempNotes(m.user_notes || '');
                            }}
                            className="text-[#787774] hover:text-[#202124] text-[11px] underline"
                          >
                            {m.user_notes ? 'Edit Note' : '+ Reflection Note'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Why did this mistake happen?..."
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="px-2 py-1 text-xs border border-[#E6E6E3] rounded focus:outline-none focus:border-[#202124] sm:w-60 bg-white text-[#202124]"
                          />
                          <button
                            onClick={() => handleSaveNotes(m.id)}
                            className="px-2 py-1 bg-[#202124] text-white rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="text-[#787774] text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Retry Modal */}
        {retryMistake && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-[#E6E6E3] max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2.5">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#202124]" />
                  <span className="font-semibold text-sm text-[#202124]">
                    Practice Question Again
                  </span>
                </div>
                <button
                  onClick={() => setRetryMistake(null)}
                  className="text-[#787774] hover:text-[#202124]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#787774]">
                Select the correct answer to resolve this mistake.
              </div>

              <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] text-xs text-[#202124] leading-relaxed">
                {retryMistake.question_text}
              </div>

              <div className="space-y-1.5">
                {retryMistake.options_json &&
                  JSON.parse(retryMistake.options_json).map((opt: any) => {
                    const isSelected = selectedRetryAnswer === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => !retryResult && setSelectedRetryAnswer(opt.label)}
                        disabled={Boolean(retryResult)}
                        className={`w-full p-2.5 rounded-md border text-xs text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#202124] bg-[#F1F1EF] text-[#202124] font-medium'
                            : 'border-[#E6E6E3] bg-white hover:bg-[#F7F7F5] text-[#202124]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{opt.label}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#202124]" />}
                      </button>
                    );
                  })}
              </div>

              {retryResult && (
                <div className={`p-3 rounded-md border text-xs space-y-1.5 ${
                  retryResult.is_correct ? 'bg-[#ebf5e8] border-[#c4e2b8] text-[#2b593f]' : 'bg-[#fff0f0] border-[#f5c2c2] text-[#e03e3e]'
                }`}>
                  <div className="flex items-center gap-1.5 font-medium">
                    {retryResult.is_correct ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Correct! Error resolved.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span>Incorrect. Key is Option {retryResult.correct_answer}.</span>
                      </>
                    )}
                  </div>
                  {retryResult.explanation && (
                    <div className="text-[11px] leading-relaxed pt-1 border-t border-black/10">
                      <strong>Solution:</strong> {retryResult.explanation}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                {!retryResult ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setRetryMistake(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!selectedRetryAnswer || retrySubmitting}
                      onClick={handleSubmitRetry}
                    >
                      {retrySubmitting ? 'Verifying...' : 'Submit Answer'}
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setRetryMistake(null)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Practice Set Generator Modal */}
        {showTestModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl border border-[#E6E6E3] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#202124]" />
                  <span className="font-semibold text-sm text-[#202124]">
                    Practice Set from Mistakes
                  </span>
                </div>
                <button onClick={() => setShowTestModal(false)} className="text-[#787774] hover:text-[#202124]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#787774] leading-relaxed">
                Assemble a custom practice set generated from your past mistakes to reinforce weak areas and prevent repeated slips.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#202124]">Question Volume:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setTestCount(cnt)}
                      className={`py-1.5 px-2 text-xs rounded-md border transition-colors ${
                        testCount === cnt
                          ? 'border-[#202124] bg-[#202124] text-white font-medium'
                          : 'border-[#E6E6E3] bg-white text-[#202124] hover:bg-[#F1F1EF]'
                      }`}
                    >
                      {cnt} Qs ({Math.round(cnt * 1.5)}m)
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] text-[11px] text-[#787774] space-y-0.5 font-mono">
                <div>• Section: Error Simulation</div>
                <div>• Marking Scheme: +2.0 / -0.5</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                <Button variant="outline" size="sm" onClick={() => setShowTestModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={testCreating}
                  onClick={handleCreateRemedialTest}
                >
                  {testCreating ? 'Assembling...' : 'Launch Test'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
