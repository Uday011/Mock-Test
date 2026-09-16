'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Hash,
  Copy,
  Archive,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  FileCheck,
  CheckSquare,
  Square,
  HelpCircle,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface QuestionBankItem {
  id: string;
  creator_id: string;
  topic_id?: string | null;
  subject_id?: string | null;
  exam_id?: string | null;
  subtopic_id?: string | null;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  source_reference?: string | null;
  tags: string[];
  usage_count: number;
  used_in_tests: string[];
  status: 'active' | 'archived' | 'draft';
  marks: number;
  negative_marks: number;
  estimated_seconds: number;
  correctness_status: 'verified' | 'review_needed';
  created_at: string;
}

// Utility to render text with inline math formulas highlighted cleanly
function FormattedMathText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return (
            <span
              key={i}
              className="inline-block font-mono text-[0.88em] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 mx-0.5 font-semibold"
            >
              {formula}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, verified: 0, avgUsage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCorrectness, setSelectedCorrectness] = useState('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // In-Place Question Authoring / Edit Modal
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form inputs state
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formMarks, setFormMarks] = useState(4.0);
  const [formNegativeMarks, setFormNegativeMarks] = useState(1.0);
  const [formEstimatedSecs, setFormEstimatedSecs] = useState(60);
  const [formSource, setFormSource] = useState('');
  const [formTagsStr, setFormTagsStr] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Assemble Test Modal
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [assembleTitle, setAssembleTitle] = useState('Custom Assembled Mock Test');
  const [assembleDescription, setAssembleDescription] = useState('Assembled from verified Question Bank items.');
  const [assembleSubject, setAssembleSubject] = useState('Quantitative Aptitude');
  const [assembleDurationMins, setAssembleDurationMins] = useState(30);
  const [assembleMarkingType, setAssembleMarkingType] = useState('standard');
  const [assembleStatus, setAssembleStatus] = useState<'published' | 'draft'>('published');
  const [assembleSubmitting, setAssembleSubmitting] = useState(false);
  const [assembleResult, setAssembleResult] = useState<{ testId: string; title: string } | null>(null);

  // Expandable question IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Popover for usage list
  const [usagePopoverId, setUsagePopoverId] = useState<string | null>(null);

  // Fetch Questions
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedSubject !== 'all') params.set('subject', selectedSubject);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCorrectness !== 'all') params.set('correctness', selectedCorrectness);

      const res = await fetch(`/api/question-bank?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch question bank');

      setQuestions(data.questions || []);
      if (data.summary) setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject, selectedDifficulty, selectedStatus, selectedCorrectness]);

  // Handle Multi-Select
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingQuestionId(null);
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrect('A');
    setFormExplanation('');
    setFormSubject('Quantitative Aptitude');
    setFormTopic('');
    setFormDifficulty('medium');
    setFormMarks(4.0);
    setFormNegativeMarks(1.0);
    setFormEstimatedSecs(60);
    setFormSource('');
    setFormTagsStr('');
    setFormError(null);
    setIsAuthorModalOpen(true);
  };

  // Open Form for Edit / Duplicate
  const handleOpenEdit = (q: QuestionBankItem, mode: 'edit' | 'duplicate' = 'edit') => {
    setFormMode(mode);
    setEditingQuestionId(mode === 'edit' ? q.id : null);
    setFormText(q.question_text);
    setFormOptions(q.options && q.options.length ? [...q.options] : ['', '', '', '']);
    setFormCorrect(q.correct_answer || 'A');
    setFormExplanation(q.explanation || '');
    setFormSubject(q.subject_id || 'Quantitative Aptitude');
    setFormTopic(q.topic_id || '');
    setFormDifficulty(q.difficulty || 'medium');
    setFormMarks(q.marks || 4.0);
    setFormNegativeMarks(q.negative_marks || 1.0);
    setFormEstimatedSecs(q.estimated_seconds || 60);
    setFormSource(q.source_reference || '');
    setFormTagsStr(Array.isArray(q.tags) ? q.tags.join(', ') : '');
    setFormError(null);
    setIsAuthorModalOpen(true);
  };

  // Save Form (Create, Edit, Duplicate)
  const handleSaveQuestion = async () => {
    setFormError(null);
    if (!formText.trim()) {
      setFormError('Question text cannot be blank.');
      return;
    }
    const cleanOpts = formOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      setFormError('Please provide at least 2 valid options.');
      return;
    }

    setFormSaving(true);
    try {
      const parsedTags = formTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        id: editingQuestionId,
        question_text: formText.trim(),
        options: formOptions,
        correct_answer: formCorrect,
        explanation: formExplanation.trim(),
        subject_id: formSubject,
        topic_id: formTopic.trim(),
        difficulty: formDifficulty,
        marks: formMarks,
        negative_marks: formNegativeMarks,
        estimated_seconds: formEstimatedSecs,
        source_reference: formSource.trim(),
        tags: parsedTags,
        status: 'active',
      };

      const method = formMode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch('/api/question-bank', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save question');

      setIsAuthorModalOpen(false);
      loadQuestions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save question.');
    } finally {
      setFormSaving(false);
    }
  };

  // Batch Archive
  const handleBatchArchive = async () => {
    if (selectedIds.size === 0) return;
    try {
      await fetch('/api/question-bank', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: 'archived',
        }),
      });
      setSelectedIds(new Set());
      loadQuestions();
    } catch (err) {
      console.error('Batch archive failed:', err);
    }
  };

  // Open Assemble Test Modal
  const handleOpenAssemble = () => {
    if (selectedIds.size === 0) return;
    setAssembleTitle(`Custom Test Drill (${selectedIds.size} Questions)`);
    setAssembleDescription('Synthesized from verified items in the Nalanda Question Bank.');
    setAssembleResult(null);
    setIsAssembleModalOpen(true);
  };

  // Submit Assemble Test
  const handleSubmitAssemble = async () => {
    setAssembleSubmitting(true);
    try {
      const res = await fetch('/api/question-bank/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assembleTitle.trim(),
          description: assembleDescription.trim(),
          subject: assembleSubject,
          question_ids: Array.from(selectedIds),
          duration_seconds: assembleDurationMins * 60,
          marking_scheme_type: assembleMarkingType,
          status: assembleStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assemble test');

      setAssembleResult({ testId: data.testId, title: data.title });
      setSelectedIds(new Set());
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Failed to assemble test');
    } finally {
      setAssembleSubmitting(false);
    }
  };

  const subjectsList = [
    'Quantitative Aptitude',
    'General Intelligence & Reasoning',
    'English Comprehension',
    'General Awareness',
    'Science & General',
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Studio & Repository', href: '/tests/create' },
        { label: 'Question Bank Repository', href: '/question-bank' },
      ]}
    >
      <PageHeader
        title="Question Bank Repository"
        description="Search, filter, tag, and assemble reusable questions across all examination syllabi with verified answer keys, mathematical LaTeX derivations, and usage tracking."
        badge={<Badge variant="saffron" size="md">Vetted Repository</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenAssemble}
              disabled={selectedIds.size === 0}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Assemble Test ({selectedIds.size})
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Author Question
            </Button>
          </div>
        }
      />

      {/* Summary KPI Callouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCallout
          label="Total Questions"
          value={summary.total}
          subtext="Vetted repository items"
          accent="navy"
          icon={<Hash className="w-4 h-4 text-slate-700" />}
        />
        <MetricCallout
          label="Verified Proofs"
          value={summary.verified}
          subtext="LaTeX derivations audited"
          accent="emerald"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCallout
          label="Active in Circulation"
          value={summary.active}
          subtext="Live questions ready to assemble"
          accent="saffron"
          icon={<FileCheck className="w-4 h-4 text-amber-600" />}
        />
        <MetricCallout
          label="Avg. Reusability"
          value={`${summary.avgUsage}x`}
          subtext="Average appearances per test"
          accent="stone"
          icon={<Award className="w-4 h-4 text-stone-600" />}
        />
      </div>

      {/* Search & Multifaceted Filtering Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by keywords, formulas, concepts, or tags (e.g. Profit, Article 32)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            {/* Correctness Filter */}
            <select
              value={selectedCorrectness}
              onChange={(e) => setSelectedCorrectness(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900"
            >
              <option value="all">All Quality Levels</option>
              <option value="verified">Verified Proof</option>
              <option value="review_needed">Review Needed</option>
            </select>
          </div>
        </div>

        {/* Action Header row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 font-bold text-stone-800 hover:text-stone-900 transition-colors"
            >
              {selectedIds.size === questions.length && questions.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-600" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              <span>Select All on Page ({questions.length})</span>
            </button>
            {selectedIds.size > 0 && (
              <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                {selectedIds.size} Selected
              </span>
            )}
          </div>

          <div>
            Showing <span className="font-bold text-stone-900 font-mono">{questions.length}</span> questions
          </div>
        </div>
      </div>

      {/* Questions Listing */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-stone-100 border border-stone-200 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-800">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <p className="text-sm font-bold">Failed to load question bank</p>
          <p className="text-xs text-stone-500 mt-1">{error}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-stone-900">No questions match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting search keywords or clearing filter constraints to see more questions.
          </p>
          <Button variant="secondary" size="sm" onClick={handleOpenCreate}>
            Author First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isSelected = selectedIds.has(q.id);
            const isExpanded = expandedIds.has(q.id);
            const isUsagePopoverOpen = usagePopoverId === q.id;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all shadow-2xs ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelect(q.id)}
                      className="text-stone-400 hover:text-stone-700 transition-colors"
                      title={isSelected ? 'Deselect question' : 'Select question'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400 hover:text-stone-600" />
                      )}
                    </button>

                    <span className="font-mono text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-bold">
                      {q.id.slice(0, 8)}
                    </span>

                    <span className="text-xs font-bold text-stone-900">
                      {q.subject_id || 'General Subject'}
                    </span>

                    {q.topic_id && (
                      <span className="text-xs text-stone-500 font-medium truncate max-w-[200px]">
                        • {q.topic_id}
                      </span>
                    )}

                    {q.correctness_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Proof
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                    <Badge
                      variant={
                        q.difficulty === 'hard'
                          ? 'danger'
                          : q.difficulty === 'medium'
                          ? 'saffron'
                          : 'emerald'
                      }
                    >
                      {q.difficulty}
                    </Badge>

                    <span className="font-bold text-stone-800">
                      +{q.marks} / -{q.negative_marks}
                    </span>

                    <span className="flex items-center gap-1 text-stone-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {q.estimated_seconds}s
                    </span>

                    {/* Usage Badge with Popover */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setUsagePopoverId(isUsagePopoverOpen ? null : q.id)
                        }
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors border border-stone-200 font-bold"
                        title="Click to view tests using this question"
                      >
                        <span>{q.usage_count}</span>
                        <span className="text-[11px] text-stone-500">tests</span>
                      </button>

                      {isUsagePopoverOpen && (
                        <div className="absolute right-0 top-7 z-20 w-64 p-3 bg-white border border-stone-200 rounded-xl shadow-xl text-xs">
                          <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 mb-2">
                            <span className="font-bold text-stone-900">Used in Tests</span>
                            <button
                              onClick={() => setUsagePopoverId(null)}
                              className="text-stone-400 hover:text-stone-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {q.used_in_tests && q.used_in_tests.length > 0 ? (
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                              {q.used_in_tests.map((testTitle, i) => (
                                <li key={i} className="text-stone-700 truncate flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>{testTitle}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-stone-400 italic">Not yet added to any mock test.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="py-3 text-sm text-stone-900 font-medium leading-relaxed">
                  <FormattedMathText text={q.question_text} />
                </div>

                {/* Question Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt, i) => {
                    const optKey = String.fromCharCode(65 + i);
                    const isCorrect = q.correct_answer === optKey;

                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs border flex items-start gap-2.5 transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-stone-50/60 border-stone-200 text-stone-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {optKey}
                        </span>
                        <div className="flex-1 mt-0.5">
                          <FormattedMathText text={opt} />
                        </div>
                        {isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Expanded Details: Explanation & Tags */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-stone-100 bg-amber-50/40 rounded-xl p-3 text-xs space-y-2 border border-amber-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pedagogical Derivation & Explanation:</span>
                    </div>

                    {q.explanation ? (
                      <div className="text-stone-800 leading-relaxed pl-2 border-l-2 border-amber-400">
                        <FormattedMathText text={q.explanation} />
                      </div>
                    ) : (
                      <p className="text-stone-400 italic">No formal explanation authored yet.</p>
                    )}

                    {q.source_reference && (
                      <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span className="font-bold text-stone-700">Source:</span>
                        <span>{q.source_reference}</span>
                      </div>
                    )}

                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {q.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-white text-stone-700 text-[10px] px-2 py-0.5 rounded-full border border-stone-200 flex items-center gap-1 font-medium"
                          >
                            <Tag className="w-2.5 h-2.5 text-stone-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Bottom Toolbar */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Solution' : 'View Pedagogical Solution'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q, 'edit')}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenEdit(q, 'duplicate')}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                      title="Duplicate into a new item"
                    >
                      <Copy className="w-3 h-3 text-stone-400" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => toggleSelect(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors text-[11px] font-bold"
                    >
                      {isSelected ? 'Deselect' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pr-2 border-r border-stone-700 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              {selectedIds.size} Selected
            </span>
          </div>

          <Button
            variant="saffron"
            size="sm"
            onClick={handleOpenAssemble}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Assemble Test
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleBatchArchive}
            icon={<Archive className="w-3.5 h-3.5" />}
          >
            Archive Selected
          </Button>

          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-stone-400 hover:text-white px-2 py-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Split-Screen Authoring Modal (Create / Edit / Duplicate) */}
      <Modal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        title={
          formMode === 'edit'
            ? 'Edit Question'
            : formMode === 'duplicate'
            ? 'Duplicate Question'
            : 'Author New Question'
        }
        description="Craft or refine questions with immediate split-screen live preview, LaTeX math support, and detailed grading tags."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-stone-500">
              {formError ? (
                <span className="text-rose-600 font-bold">{formError}</span>
              ) : (
                <span>Formulas inside $...$ are automatically rendered.</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setIsAuthorModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveQuestion} disabled={formSaving}>
                {formSaving ? 'Saving...' : 'Save to Question Bank'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Left Column: Editable Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Difficulty</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Marks (+)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formMarks}
                  onChange={(e) => setFormMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Penalty (-)</label>
                <input
                  type="number"
                  step="0.25"
                  value={formNegativeMarks}
                  onChange={(e) => setFormNegativeMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Est. Secs</label>
                <input
                  type="number"
                  value={formEstimatedSecs}
                  onChange={(e) => setFormEstimatedSecs(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Question Statement (use $...$ for formulas)
              </label>
              <textarea
                rows={4}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="e.g. A cylinder has height $h = 14$ cm and radius $r = 7$ cm. Calculate its curved surface area."
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Options & Correct Answer Choice:
              </label>
              <div className="space-y-2">
                {formOptions.map((opt, i) => {
                  const optKey = String.fromCharCode(65 + i);
                  const isChecked = formCorrect === optKey;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormCorrect(optKey)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-400/50'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                        }`}
                        title="Mark as correct answer"
                      >
                        {optKey}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[i] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`Option ${optKey}`}
                        className={`flex-1 px-3 py-1.5 rounded-xl border text-xs text-stone-900 focus:outline-none ${
                          isChecked ? 'border-emerald-300 bg-emerald-50/50 font-medium' : 'border-stone-300 bg-white'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Detailed Explanation / Solution Proof
              </label>
              <textarea
                rows={3}
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Explain the step-by-step reasoning or mathematical derivation..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Topic / Subtopic</label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Geometry"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Source Reference</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. SSC CGL 2024 Tier-1"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formTagsStr}
                onChange={(e) => setFormTagsStr(e.target.value)}
                placeholder="e.g. High Yield, TCS Pattern, Tier-1"
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Right Column: Split-Screen Live Preview */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-500">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Live Student Preview
                </span>
                <Badge variant={formDifficulty === 'hard' ? 'danger' : formDifficulty === 'medium' ? 'saffron' : 'emerald'}>
                  {formDifficulty.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-3 text-xs text-stone-600 flex items-center gap-2">
                <Badge variant="stone">{formSubject}</Badge>
                <span className="font-medium">{formTopic}</span>
                <span className="ml-auto font-mono font-bold text-emerald-700">
                  +{formMarks} / -{formNegativeMarks}
                </span>
              </div>

              <div className="mt-3 text-sm text-stone-900 font-medium leading-relaxed min-h-[50px]">
                {formText ? (
                  <FormattedMathText text={formText} />
                ) : (
                  <span className="text-stone-400 italic">Enter question statement on the left to preview...</span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {formOptions.map((opt, i) => {
                  const optKey = String.fromCharCode(65 + i);
                  const isCorrect = formCorrect === optKey;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs border flex items-start gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {optKey}
                      </span>
                      <div className="flex-1 mt-0.5">
                        {opt ? <FormattedMathText text={opt} /> : <span className="text-stone-400 italic">Empty choice</span>}
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {formExplanation && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    Explanation Preview:
                  </div>
                  <div className="text-stone-800 leading-relaxed">
                    <FormattedMathText text={formExplanation} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono flex items-center justify-between">
              <span>Estimated time: {formEstimatedSecs}s</span>
              <span>Source: {formSource || 'Custom'}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Assemble Test from Selected Modal */}
      <Modal
        isOpen={isAssembleModalOpen}
        onClose={() => setIsAssembleModalOpen(false)}
        title="Assemble Custom Test from Selected Questions"
        description={`Combine ${selectedIds.size} selected questions into a full Computer-Based Test immediately ready for practice or publication.`}
        size="md"
        footer={
          assembleResult ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Test successfully created!
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setIsAssembleModalOpen(false)}>
                  Close
                </Button>
                <Link href={`/tests/${assembleResult.testId}/start`}>
                  <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />}>
                    View & Start Test
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="secondary" onClick={() => setIsAssembleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitAssemble}
                disabled={assembleSubmitting}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {assembleSubmitting ? 'Assembling...' : `Create Test (${selectedIds.size} Questions)`}
              </Button>
            </div>
          )
        }
      >
        {assembleResult ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-stone-900 text-sm">{assembleResult.title}</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              The test has been published and linked to your selected questions. You can start the mock test now or find it in your test library.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Test Title</label>
              <input
                type="text"
                value={assembleTitle}
                onChange={(e) => setAssembleTitle(e.target.value)}
                placeholder="e.g. Quantitative Speed Drill #1"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Description / Goal</label>
              <textarea
                rows={2}
                value={assembleDescription}
                onChange={(e) => setAssembleDescription(e.target.value)}
                placeholder="Optional test description..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Subject</label>
                <select
                  value={assembleSubject}
                  onChange={(e) => setAssembleSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={assembleDurationMins}
                  onChange={(e) => setAssembleDurationMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Marking Scheme</label>
                <select
                  value={assembleMarkingType}
                  onChange={(e) => setAssembleMarkingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  <option value="standard">Standard (+4.0 / -1.0)</option>
                  <option value="ssc">SSC CGL (+2.0 / -0.5)</option>
                  <option value="custom">Custom (as per question bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Publication State</label>
                <select
                  value={assembleStatus}
                  onChange={(e) => setAssembleStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  <option value="published">Published (Ready for practice)</option>
                  <option value="draft">Draft (Private draft)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
