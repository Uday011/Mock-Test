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
              className="inline-block font-mono text-[0.88em] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 mx-0.5 font-medium"
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

  // Expanded items (for details / explanations)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeUsagePopover, setActiveUsagePopover] = useState<string | null>(null);

  // Modals
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [assembleSubmitting, setAssembleSubmitting] = useState(false);
  const [assembleResult, setAssembleResult] = useState<{ testId: string; title: string } | null>(null);

  // Question Form State (for Create / Edit / Duplicate)
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState('single');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formTopic, setFormTopic] = useState('Percentages, Profit & Loss');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formMarks, setFormMarks] = useState(2.0);
  const [formNegativeMarks, setFormNegativeMarks] = useState(0.5);
  const [formEstimatedSecs, setFormEstimatedSecs] = useState(60);
  const [formSource, setFormSource] = useState('Nalanda Studio');
  const [formTagsStr, setFormTagsStr] = useState('TCS Pattern, High Yield');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Assemble Test Form State
  const [assembleTitle, setAssembleTitle] = useState('');
  const [assembleDescription, setAssembleDescription] = useState('');
  const [assembleSubject, setAssembleSubject] = useState('Quantitative Aptitude');
  const [assembleDurationMins, setAssembleDurationMins] = useState(30);
  const [assembleMarkingType, setAssembleMarkingType] = useState('standard');
  const [assembleStatus, setAssembleStatus] = useState<'published' | 'draft'>('published');

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedSubject !== 'all') params.set('subject', selectedSubject);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCorrectness !== 'all') params.set('correctness', selectedCorrectness);

      const res = await fetch(`/api/question-bank?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load questions from Question Bank');
      const data = await res.json();
      setQuestions(data.questions || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching question bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedDifficulty, selectedStatus, selectedCorrectness]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Open Authoring Modal for new question
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormText('');
    setFormType('single');
    setFormOptions(['Option A', 'Option B', 'Option C', 'Option D']);
    setFormCorrect('A');
    setFormExplanation('');
    setFormSubject('Quantitative Aptitude');
    setFormTopic('Arithmetic & Calculations');
    setFormDifficulty('medium');
    setFormMarks(2.0);
    setFormNegativeMarks(0.5);
    setFormEstimatedSecs(60);
    setFormSource('Nalanda Studio');
    setFormTagsStr('Core Concept, Must-Practice');
    setFormError(null);
    setIsAuthorModalOpen(true);
  };

  // Open Authoring Modal for Edit
  const handleOpenEdit = (q: QuestionBankItem) => {
    setFormMode('edit');
    setEditingId(q.id);
    setFormText(q.question_text);
    setFormType(q.question_type || 'single');
    setFormOptions(q.options.length >= 2 ? [...q.options] : ['Option A', 'Option B', 'Option C', 'Option D']);
    setFormCorrect(q.correct_answer || 'A');
    setFormExplanation(q.explanation || '');
    setFormSubject(q.subject_id || 'Quantitative Aptitude');
    setFormTopic(q.topic_id || 'General');
    setFormDifficulty(q.difficulty || 'medium');
    setFormMarks(q.marks || 2.0);
    setFormNegativeMarks(q.negative_marks || 0.5);
    setFormEstimatedSecs(q.estimated_seconds || 60);
    setFormSource(q.source_reference || 'Nalanda Studio');
    setFormTagsStr((q.tags || []).join(', '));
    setFormError(null);
    setIsAuthorModalOpen(true);
  };

  // Open Authoring Modal for Duplicate
  const handleOpenDuplicate = (q: QuestionBankItem) => {
    setFormMode('duplicate');
    setEditingId(null);
    setFormText(`[Copy] ${q.question_text}`);
    setFormType(q.question_type || 'single');
    setFormOptions([...q.options]);
    setFormCorrect(q.correct_answer || 'A');
    setFormExplanation(q.explanation || '');
    setFormSubject(q.subject_id || 'Quantitative Aptitude');
    setFormTopic(q.topic_id || 'General');
    setFormDifficulty(q.difficulty || 'medium');
    setFormMarks(q.marks || 2.0);
    setFormNegativeMarks(q.negative_marks || 0.5);
    setFormEstimatedSecs(q.estimated_seconds || 60);
    setFormSource(q.source_reference || 'Nalanda Studio');
    setFormTagsStr((q.tags || []).join(', '));
    setFormError(null);
    setIsAuthorModalOpen(true);
  };

  // Save question (POST or PATCH)
  const handleSaveQuestion = async () => {
    if (!formText.trim()) {
      setFormError('Question text cannot be blank.');
      return;
    }
    const cleanOpts = formOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      setFormError('Please provide at least 2 valid option choices.');
      return;
    }

    setFormSaving(true);
    setFormError(null);

    const tags = formTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (formMode === 'edit' && editingId) {
        const res = await fetch('/api/question-bank', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            question_text: formText.trim(),
            question_type: formType,
            options: cleanOpts,
            correct_answer: formCorrect,
            explanation: formExplanation.trim() || null,
            subject_id: formSubject,
            topic_id: formTopic,
            difficulty: formDifficulty,
            marks: Number(formMarks),
            negative_marks: Number(formNegativeMarks),
            estimated_seconds: Number(formEstimatedSecs),
            source_reference: formSource.trim(),
            tags,
          }),
        });
        if (!res.ok) throw new Error('Failed to update question');
      } else {
        const res = await fetch('/api/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_text: formText.trim(),
            question_type: formType,
            options: cleanOpts,
            correct_answer: formCorrect,
            explanation: formExplanation.trim() || null,
            subject_id: formSubject,
            topic_id: formTopic,
            difficulty: formDifficulty,
            marks: Number(formMarks),
            negative_marks: Number(formNegativeMarks),
            estimated_seconds: Number(formEstimatedSecs),
            source_reference: formSource.trim(),
            tags,
          }),
        });
        if (!res.ok) throw new Error('Failed to create question');
      }

      setIsAuthorModalOpen(false);
      await fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || 'Error saving question');
    } finally {
      setFormSaving(false);
    }
  };

  // Toggle archive status
  const handleToggleArchive = async (q: QuestionBankItem) => {
    const newStatus = q.status === 'archived' ? 'active' : 'archived';
    try {
      const res = await fetch('/api/question-bank', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: q.id, status: newStatus }),
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error toggling archive status:', err);
    }
  };

  // Batch Archive Selected
  const handleBatchArchive = async () => {
    if (!confirm(`Archive ${selectedIds.size} selected question(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch('/api/question-bank', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'archived' }),
          })
        )
      );
      setSelectedIds(new Set());
      fetchQuestions();
    } catch (err) {
      console.error('Batch archive failed:', err);
    }
  };

  // Open Assemble Modal
  const handleOpenAssemble = () => {
    if (selectedIds.size === 0) return;
    setAssembleTitle(`Custom Test (${selectedIds.size} Curated Questions)`);
    setAssembleDescription(`Assembled directly from the Nalanda Question Bank repository.`);
    setAssembleDurationMins(Math.max(10, selectedIds.size * 2));
    setAssembleResult(null);
    setIsAssembleModalOpen(true);
  };

  // Submit Assemble Test
  const handleSubmitAssemble = async () => {
    if (!assembleTitle.trim()) return;
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

      setAssembleResult({ testId: data.testId, title: assembleTitle });
      setSelectedIds(new Set());
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Error assembling test');
    } finally {
      setAssembleSubmitting(false);
    }
  };

  // Distinct subjects list
  const subjectsList = [
    'Quantitative Aptitude',
    'General Intelligence & Reasoning',
    'English Comprehension',
    'General Awareness',
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Studio & Repository', href: '/tests/create' },
        { label: 'Question Bank' },
      ]}
    >
      <PageHeader
        title="Question Bank Repository"
        description="Search, filter, curate, and assemble multi-topic mock tests from thousands of vetted questions with usage tracking and quality validation."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleOpenCreate} icon={<PlusCircle className="w-4 h-4" />}>
              Create Question
            </Button>
            <Link href="/tests/create">
              <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                Test Studio
              </Button>
            </Link>
          </div>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCallout
          label="Total Repository"
          value={summary.total}
          subtext="Curated questions across 4 modules"
          icon={<Layers className="w-4 h-4 text-brand-400" />}
        />
        <MetricCallout
          label="Verified Status"
          value={summary.verified}
          subtext="Peer-reviewed with LaTeX proofs"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCallout
          label="Active in Circulation"
          value={summary.active}
          subtext="Live questions ready to assemble"
          icon={<FileCheck className="w-4 h-4 text-indigo-400" />}
        />
        <MetricCallout
          label="Avg. Reusability"
          value={`${summary.avgUsage}x`}
          subtext="Average appearances per test"
          icon={<Award className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Search & Multifaceted Filtering Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by keywords, formulas, concepts, or tags (e.g. Profit, Article 32)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
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
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
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
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
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
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            {/* Correctness Filter */}
            <select
              value={selectedCorrectness}
              onChange={(e) => setSelectedCorrectness(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Quality Levels</option>
              <option value="verified">Verified Proof</option>
              <option value="review_needed">Review Needed</option>
            </select>
          </div>
        </div>

        {/* Action Header row */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {selectedIds.size === questions.length && questions.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-brand-400" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500" />
              )}
              <span>Select All on Page ({questions.length})</span>
            </button>
            {selectedIds.size > 0 && (
              <span className="text-brand-400 font-semibold ml-2">
                ({selectedIds.size} questions selected)
              </span>
            )}
          </div>
          <div>
            Showing <span className="font-semibold text-zinc-200">{questions.length}</span> questions
          </div>
        </div>
      </Card>

      {/* Questions Listing */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-zinc-900/50 border border-zinc-800/80 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-rose-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="font-semibold">Error loading question bank</p>
          <p className="text-xs text-zinc-400 mt-1">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchQuestions} className="mt-4">
            Retry
          </Button>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No questions match your filter</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query, subject filter, or difficulty settings, or create a brand new question.
          </p>
          <Button variant="primary" onClick={handleOpenCreate} icon={<PlusCircle className="w-4 h-4" />}>
            Author First Question
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5 mb-24">
          {questions.map((q, idx) => {
            const isSelected = selectedIds.has(q.id);
            const isExpanded = expandedId === q.id;

            return (
              <Card
                key={q.id}
                className={`p-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-500/50 bg-brand-950/10 shadow-lg shadow-brand-500/5'
                    : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/60'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(q.id)}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      title={isSelected ? 'Deselect' : 'Select question'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500 hover:text-zinc-400" />
                      )}
                    </button>

                    <span className="font-mono text-xs text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50 font-semibold">
                      #{idx + 1} • {q.id}
                    </span>

                    {/* Subject badge */}
                    <Badge variant="stone" className="text-[11px]">
                      {q.subject_id || 'Quantitative Aptitude'}
                    </Badge>

                    {/* Topic badge */}
                    {q.topic_id && (
                      <span className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">
                        {q.topic_id}
                      </span>
                    )}

                    {/* Difficulty Badge */}
                    <Badge
                      variant={
                        q.difficulty === 'hard'
                          ? 'danger'
                          : q.difficulty === 'medium'
                          ? 'saffron'
                          : 'emerald'
                      }
                      className="text-[10px] uppercase tracking-wider font-semibold"
                    >
                      {q.difficulty}
                    </Badge>

                    {/* Correctness verification */}
                    {q.correctness_status === 'verified' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Proof
                      </span>
                    )}

                    {/* Status badge if archived */}
                    {q.status === 'archived' && (
                      <Badge variant="stone" className="text-[10px] text-zinc-500">
                        Archived
                      </Badge>
                    )}
                  </div>

                  {/* Usage tracker & Stats */}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-zinc-300 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      +{q.marks} / -{q.negative_marks}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {q.estimated_seconds}s
                    </span>

                    {/* Usage count badge with popover */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveUsagePopover(activeUsagePopover === q.id ? null : q.id)
                        }
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700/60"
                        title="Click to view test appearances"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-brand-400" />
                        <span className="font-semibold">{q.usage_count}</span>
                        <span className="text-[11px] text-zinc-400">tests</span>
                      </button>

                      {activeUsagePopover === q.id && (
                        <div className="absolute right-0 top-7 z-20 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl text-xs">
                          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
                            <span className="font-semibold text-zinc-200">Used in Tests</span>
                            <button
                              onClick={() => setActiveUsagePopover(null)}
                              className="text-zinc-500 hover:text-zinc-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {q.used_in_tests && q.used_in_tests.length > 0 ? (
                            <ul className="space-y-1 max-h-36 overflow-y-auto">
                              {q.used_in_tests.map((testTitle, i) => (
                                <li key={i} className="text-zinc-300 truncate flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                                  <span className="truncate">{testTitle}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-zinc-500 italic">Not yet added to any mock test.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Body */}
                <div className="py-3 text-sm text-zinc-100 leading-relaxed">
                  <FormattedMathText text={q.question_text} />
                </div>

                {/* Options preview / expand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {q.options.map((opt, i) => {
                    const optKey = String.fromCharCode(65 + i);
                    const isCorrect = q.correct_answer === optKey;

                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-xs flex items-start gap-2 border transition-all ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium'
                            : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {optKey}
                        </span>
                        <div className="flex-1 mt-0.5 leading-tight">
                          <FormattedMathText text={opt} />
                        </div>
                        {isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible detailed explanation & tags */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/80 bg-zinc-950/40 rounded-lg p-3 text-xs space-y-2">
                    {q.explanation ? (
                      <div>
                        <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Detailed Solution & Derivation:
                        </div>
                        <div className="text-zinc-300 leading-relaxed pl-2 border-l-2 border-emerald-500/30">
                          <FormattedMathText text={q.explanation} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-500 italic">No formal explanation authored yet.</p>
                    )}

                    {q.source_reference && (
                      <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-500">Source:</span>
                        <span>{q.source_reference}</span>
                      </div>
                    )}

                    {q.tags && q.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {q.tags.map((t, i) => (
                          <span
                            key={i}
                            className="bg-zinc-800/80 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full border border-zinc-700/50 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-zinc-400" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Action footer */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide Solution</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>View Solution & Tags</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDuplicate(q)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3 text-zinc-400" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleToggleArchive(q)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {q.status === 'archived' ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          Archive
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-brand-500/40 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/80 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-sm font-semibold text-zinc-100">
              {selectedIds.size} Selected
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAssemble}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Assemble Test from Selected
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
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
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
            <div className="text-xs text-zinc-500">
              {formError ? (
                <span className="text-rose-400 font-medium">{formError}</span>
              ) : (
                <span>Formulas inside $...$ are automatically highlighted.</span>
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
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Difficulty</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Marks (+)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formMarks}
                  onChange={(e) => setFormMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Penalty (-)</label>
                <input
                  type="number"
                  step="0.25"
                  value={formNegativeMarks}
                  onChange={(e) => setFormNegativeMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Est. Secs</label>
                <input
                  type="number"
                  value={formEstimatedSecs}
                  onChange={(e) => setFormEstimatedSecs(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Question Statement (use $...$ for formulas)
              </label>
              <textarea
                rows={4}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="e.g. A cylinder has height $h = 14$ cm and radius $r = 7$ cm. Calculate its curved surface area."
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 text-black ring-2 ring-emerald-400/50'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
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
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Detailed Explanation / Solution Proof
              </label>
              <textarea
                rows={3}
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Explain the step-by-step reasoning or mathematical derivation..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Topic / Subtopic</label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Geometry"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Source Reference</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. SSC CGL 2024 Tier-1"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formTagsStr}
                onChange={(e) => setFormTagsStr(e.target.value)}
                placeholder="e.g. High Yield, TCS Pattern, Tier-1"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
              />
            </div>
          </div>

          {/* Right Column: Split-Screen Live Preview */}
          <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Student Preview
                </span>
                <Badge variant={formDifficulty === 'hard' ? 'danger' : formDifficulty === 'medium' ? 'saffron' : 'emerald'}>
                  {formDifficulty.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-3 text-xs text-zinc-400 flex items-center gap-2">
                <Badge variant="stone">{formSubject}</Badge>
                <span>{formTopic}</span>
                <span className="ml-auto font-medium text-emerald-400">
                  +{formMarks} / -{formNegativeMarks}
                </span>
              </div>

              <div className="mt-3 text-sm text-zinc-100 font-medium leading-relaxed min-h-[50px]">
                {formText ? (
                  <FormattedMathText text={formText} />
                ) : (
                  <span className="text-zinc-600 italic">Enter question statement on the left to preview...</span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {formOptions.map((opt, i) => {
                  const optKey = String.fromCharCode(65 + i);
                  const isCorrect = formCorrect === optKey;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg text-xs border flex items-start gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCorrect ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {optKey}
                      </span>
                      <div className="flex-1 mt-0.5">
                        {opt ? <FormattedMathText text={opt} /> : <span className="text-zinc-600 italic">Empty choice</span>}
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {formExplanation && (
                <div className="mt-4 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs">
                  <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Explanation Preview:
                  </div>
                  <div className="text-zinc-300">
                    <FormattedMathText text={formExplanation} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Estimated solving time: {formEstimatedSecs}s</span>
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
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Test successfully created!
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setIsAssembleModalOpen(false)}>
                  Close
                </Button>
                <Link href={`/tests/${assembleResult.testId}/instructions`}>
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
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-semibold text-zinc-100 text-sm">{assembleResult.title}</h4>
            <p className="text-xs text-zinc-400">
              The test has been published and linked to your selected questions. You can start the mock test now or find it in your test library.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Test Title</label>
              <input
                type="text"
                value={assembleTitle}
                onChange={(e) => setAssembleTitle(e.target.value)}
                placeholder="e.g. Quantitative Speed Drill #1"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Description / Goal</label>
              <textarea
                rows={2}
                value={assembleDescription}
                onChange={(e) => setAssembleDescription(e.target.value)}
                placeholder="Optional test description..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Subject</label>
                <select
                  value={assembleSubject}
                  onChange={(e) => setAssembleSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={assembleDurationMins}
                  onChange={(e) => setAssembleDurationMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Marking Scheme</label>
                <select
                  value={assembleMarkingType}
                  onChange={(e) => setAssembleMarkingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                >
                  <option value="standard">Standard (+4.0 / -1.0)</option>
                  <option value="ssc">SSC CGL (+2.0 / -0.5)</option>
                  <option value="custom">Custom (as per question bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Publication State</label>
                <select
                  value={assembleStatus}
                  onChange={(e) => setAssembleStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
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
