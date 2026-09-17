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
  FolderArchive,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PropertyTable, PropertyRow } from '@/components/ui/PropertyTable';

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
              className="inline-block font-mono text-[0.9em] bg-[#F1F1EF] text-[#202124] px-1.5 py-0.5 rounded border border-[#E6E6E3] mx-0.5 font-medium"
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
  const [usagePopoverId, setUsagePopoverId] = useState<string | null>(null);

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

  const handleOpenAssemble = () => {
    if (selectedIds.size === 0) return;
    setAssembleTitle(`Custom Test Drill (${selectedIds.size} Questions)`);
    setAssembleDescription('Synthesized from verified items in the Nalanda Question Bank.');
    setAssembleResult(null);
    setIsAssembleModalOpen(true);
  };

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
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <PageHeader
          icon={FolderArchive}
          title="Question Bank Repository"
          description="Search, filter, tag, and assemble reusable questions across all examination syllabi with verified answer keys, mathematical LaTeX derivations, and usage tracking."
          badge={<Badge variant="amber" size="sm">Vetted Repository</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenAssemble}
                disabled={selectedIds.size === 0}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Assemble Test ({selectedIds.size})
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Author Question
              </Button>
            </div>
          }
        />

        {/* Summary Properties */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-3.5">
          <PropertyTable>
            <PropertyRow icon={Hash} label="Total Questions">
              <span className="font-mono text-xs font-semibold text-[#202124]">
                {summary.total} repository items
              </span>
            </PropertyRow>

            <PropertyRow icon={CheckCircle2} label="Verified Proofs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-emerald-700">
                  {summary.verified} verified
                </span>
                <span className="text-xs text-[#787774]">LaTeX derivations audited</span>
              </div>
            </PropertyRow>

            <PropertyRow icon={FileCheck} label="Active Circulation">
              <span className="font-mono text-xs text-[#202124]">
                {summary.active} live questions ready to assemble
              </span>
            </PropertyRow>

            <PropertyRow icon={Award} label="Avg Reusability">
              <span className="font-mono text-xs text-[#787774]">
                {summary.avgUsage}x average appearances per test
              </span>
            </PropertyRow>
          </PropertyTable>
        </div>

        {/* Search & Multifaceted Filtering Bar */}
        <div className="bg-white rounded-lg border border-[#E6E6E3] p-3 space-y-2.5">
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#787774]" />
              <input
                type="text"
                placeholder="Search by keywords, formulas, concepts, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#202124]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#202124]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={selectedCorrectness}
                onChange={(e) => setSelectedCorrectness(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none"
              >
                <option value="all">All Quality Levels</option>
                <option value="verified">Verified Proof</option>
                <option value="review_needed">Review Needed</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs text-[#787774]">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 text-[#202124] hover:underline"
              >
                {selectedIds.size === questions.length && questions.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#202124]" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#787774]" />
                )}
                <span>Select All ({questions.length})</span>
              </button>
              {selectedIds.size > 0 && (
                <Badge variant="amber" size="sm">
                  {selectedIds.size} Selected
                </Badge>
              )}
            </div>

            <div className="font-mono text-[11px]">
              Showing <span className="font-semibold text-[#202124]">{questions.length}</span> questions
            </div>
          </div>
        </div>

        {/* Questions Listing */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#787774] font-mono">
            Loading repository items...
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-lg border border-[#f5c2c2] text-[#e03e3e]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#e03e3e]" />
            <p className="text-sm font-semibold">Failed to load question bank</p>
            <p className="text-xs text-[#787774] mt-1">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-[#E6E6E3] space-y-3">
            <Layers className="w-8 h-8 text-[#9b9a97] mx-auto" />
            <h3 className="text-sm font-semibold text-[#202124]">No questions match your filter</h3>
            <p className="text-xs text-[#787774] max-w-sm mx-auto">
              Try adjusting search keywords or clearing filter constraints to see more questions.
            </p>
            <Button variant="outline" size="sm" onClick={handleOpenCreate}>
              Author First Question
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q) => {
              const isSelected = selectedIds.has(q.id);
              const isExpanded = expandedIds.has(q.id);
              const isUsagePopoverOpen = usagePopoverId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border transition-colors space-y-2.5 ${
                    isSelected
                      ? 'border-[#202124] bg-[#F7F7F5]'
                      : 'border-[#E6E6E3] bg-white hover:border-[#d4d4d4]'
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E6E6E3]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => toggleSelect(q.id)}
                        className="text-[#787774] hover:text-[#202124]"
                        title={isSelected ? 'Deselect' : 'Select'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#202124]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#787774]" />
                        )}
                      </button>

                      <span className="font-mono text-[10px] text-[#787774] bg-[#F1F1EF] px-1.5 py-0.5 rounded border border-[#E6E6E3]">
                        {q.id.slice(0, 8)}
                      </span>

                      <span className="text-xs font-medium text-[#202124]">
                        {q.subject_id || 'General Subject'}
                      </span>

                      {q.topic_id && (
                        <span className="text-xs text-[#787774] truncate max-w-[180px]">
                          • {q.topic_id}
                        </span>
                      )}

                      {q.correctness_status === 'verified' && (
                        <Badge variant="emerald" size="sm" dot>
                          Verified Proof
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#787774] font-mono">
                      <Badge
                        variant={q.difficulty === 'hard' ? 'rose' : q.difficulty === 'medium' ? 'amber' : 'emerald'}
                        size="sm"
                      >
                        {q.difficulty}
                      </Badge>

                      <span className="font-medium text-[#202124]">
                        +{q.marks} / -{q.negative_marks}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9b9a97]" />
                        {q.estimated_seconds}s
                      </span>

                      {/* Usage Button */}
                      <div className="relative">
                        <button
                          onClick={() => setUsagePopoverId(isUsagePopoverOpen ? null : q.id)}
                          className="px-1.5 py-0.5 rounded bg-[#F1F1EF] hover:bg-[#F1F1EF] text-[#202124] text-[11px] border border-[#E6E6E3]"
                          title="View tests using this question"
                        >
                          {q.usage_count} tests
                        </button>

                        {isUsagePopoverOpen && (
                          <div className="absolute right-0 top-6 z-20 w-56 p-2.5 bg-white border border-[#E6E6E3] rounded-lg shadow-lg text-xs space-y-1.5">
                            <div className="flex items-center justify-between pb-1 border-b border-[#E6E6E3]">
                              <span className="font-medium text-[#202124]">Used in Tests</span>
                              <button onClick={() => setUsagePopoverId(null)} className="text-[#787774]">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {q.used_in_tests && q.used_in_tests.length > 0 ? (
                              <ul className="space-y-1 max-h-28 overflow-y-auto">
                                {q.used_in_tests.map((testTitle, i) => (
                                  <li key={i} className="text-[#787774] truncate text-[11px]">
                                    • {testTitle}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[#9b9a97] text-[11px] italic">Not added to any tests yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="text-xs sm:text-sm text-[#202124] leading-relaxed">
                    <FormattedMathText text={q.question_text} />
                  </div>

                  {/* Question Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {(q.options || []).map((opt, i) => {
                      const optKey = String.fromCharCode(65 + i);
                      const isCorrect = q.correct_answer === optKey;

                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-md text-xs border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-[#ebf5e8] border-[#c4e2b8] text-[#2b593f] font-medium'
                              : 'bg-[#F7F7F5] border-[#E6E6E3] text-[#202124]'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${
                              isCorrect ? 'bg-emerald-700 text-white' : 'bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]'
                            }`}
                          >
                            {optKey}
                          </span>
                          <div className="flex-1">
                            <FormattedMathText text={opt} />
                          </div>
                          {isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#E6E6E3] bg-[#F7F7F5] rounded-md p-3 text-xs space-y-2 border">
                      <div className="font-medium text-[#202124]">
                        Pedagogical Derivation & Explanation:
                      </div>

                      {q.explanation ? (
                        <div className="text-[#787774] leading-relaxed pl-2 border-l-2 border-[#E6E6E3]">
                          <FormattedMathText text={q.explanation} />
                        </div>
                      ) : (
                        <p className="text-[#9b9a97] italic">No explanation authored yet.</p>
                      )}

                      {q.source_reference && (
                        <div className="pt-1 text-[11px] text-[#787774]">
                          <span className="font-medium text-[#202124]">Source: </span>
                          <span>{q.source_reference}</span>
                        </div>
                      )}

                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {q.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-white text-[#787774] text-[10px] px-1.5 py-0.5 rounded border border-[#E6E6E3]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Toolbar */}
                  <div className="pt-2 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-1 text-[#787774] hover:text-[#202124] text-[11px]"
                    >
                      <span>{isExpanded ? 'Hide Solution' : 'View Solution'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(q, 'edit')}
                        className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] text-[11px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenEdit(q, 'duplicate')}
                        className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] flex items-center gap-1 text-[11px]"
                        title="Duplicate"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => toggleSelect(q.id)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3] text-[11px]"
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#202124] text-white rounded-lg px-4 py-2.5 shadow-xl flex items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#787774] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedIds.size} Selected</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAssemble}
              className="bg-white text-[#202124] hover:bg-[#F1F1EF]"
            >
              Assemble Test
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchArchive}
              className="text-white border-[#787774] hover:bg-[#4f4d47]"
            >
              Archive
            </Button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-[#9b9a97] hover:text-white px-1"
            >
              Clear
            </button>
          </div>
        )}

        {/* Authoring Modal */}
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
          description="Craft or refine questions with immediate preview, LaTeX math support, and grading tags."
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-[#787774]">
                {formError ? (
                  <span className="text-rose-600 font-medium">{formError}</span>
                ) : (
                  <span>Formulas inside $...$ are automatically rendered.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsAuthorModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveQuestion} disabled={formSaving}>
                  {formSaving ? 'Saving...' : 'Save to Bank'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124]"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[#787774] mb-1">Marks (+)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-md bg-white border border-[#E6E6E3] text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-[#787774] mb-1">Penalty (-)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formNegativeMarks}
                    onChange={(e) => setFormNegativeMarks(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-md bg-white border border-[#E6E6E3] text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-[#787774] mb-1">Est. Secs</label>
                  <input
                    type="number"
                    value={formEstimatedSecs}
                    onChange={(e) => setFormEstimatedSecs(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-md bg-white border border-[#E6E6E3] text-[#202124]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">
                  Question Statement (use $...$ for formulas)
                </label>
                <textarea
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. A cylinder has height $h = 14$ cm and radius $r = 7$ cm..."
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none focus:border-[#202124]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">
                  Options & Correct Answer:
                </label>
                <div className="space-y-1.5">
                  {formOptions.map((opt, i) => {
                    const optKey = String.fromCharCode(65 + i);
                    const isChecked = formCorrect === optKey;
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormCorrect(optKey)}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono transition-colors ${
                            isChecked
                              ? 'bg-[#202124] text-white'
                              : 'bg-[#F1F1EF] text-[#787774] border border-[#E6E6E3]'
                          }`}
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
                          className={`flex-1 px-2.5 py-1 rounded-md border text-xs text-[#202124] focus:outline-none ${
                            isChecked ? 'border-[#202124] bg-[#F7F7F5]' : 'border-[#E6E6E3] bg-white'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">
                  Explanation / Solution Proof
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Step-by-step reasoning or formula derivation..."
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124] focus:outline-none focus:border-[#202124]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Topic / Subtopic</label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. Geometry"
                    className="w-full px-2.5 py-1 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Source Reference</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. SSC CGL 2024"
                    className="w-full px-2.5 py-1 rounded-md bg-white border border-[#E6E6E3] text-xs text-[#202124]"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-[#F7F7F5] rounded-lg p-4 border border-[#E6E6E3] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E6E6E3] text-xs text-[#787774]">
                  <span className="font-medium text-[#202124] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Preview
                  </span>
                  <Badge variant="gray">{formDifficulty.toUpperCase()}</Badge>
                </div>

                <div className="mt-2.5 text-xs text-[#787774] flex items-center gap-2">
                  <Badge variant="gray">{formSubject}</Badge>
                  <span>{formTopic}</span>
                  <span className="ml-auto font-mono text-[#202124]">
                    +{formMarks} / -{formNegativeMarks}
                  </span>
                </div>

                <div className="mt-2.5 text-xs text-[#202124] leading-relaxed min-h-[40px]">
                  {formText ? (
                    <FormattedMathText text={formText} />
                  ) : (
                    <span className="text-[#9b9a97] italic">Enter statement to preview...</span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  {formOptions.map((opt, i) => {
                    const optKey = String.fromCharCode(65 + i);
                    const isCorrect = formCorrect === optKey;
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded-md text-xs border flex items-start gap-2 ${
                          isCorrect
                            ? 'bg-[#ebf5e8] border-[#c4e2b8] text-[#2b593f] font-medium'
                            : 'bg-white border-[#E6E6E3] text-[#202124]'
                        }`}
                      >
                        <span className="font-mono text-[10px]">{optKey}.</span>
                        <div className="flex-1">
                          {opt ? <FormattedMathText text={opt} /> : <span className="text-[#9b9a97] italic">Empty</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {formExplanation && (
                  <div className="mt-3 p-2.5 rounded-md bg-white border border-[#E6E6E3] text-xs space-y-1">
                    <div className="font-medium text-[#202124]">Explanation:</div>
                    <div className="text-[#787774]">
                      <FormattedMathText text={formExplanation} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6E6E3] text-[11px] text-[#787774] font-mono flex items-center justify-between">
                <span>Time: {formEstimatedSecs}s</span>
                <span>Source: {formSource || 'Custom'}</span>
              </div>
            </div>
          </div>
        </Modal>

        {/* Assemble Test Modal */}
        <Modal
          isOpen={isAssembleModalOpen}
          onClose={() => setIsAssembleModalOpen(false)}
          title="Assemble Custom Test"
          description={`Combine ${selectedIds.size} questions into a Computer-Based Test.`}
          size="md"
          footer={
            assembleResult ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-emerald-700 font-medium">
                  Test successfully created!
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsAssembleModalOpen(false)}>
                    Close
                  </Button>
                  <Link href={`/tests/${assembleResult.testId}/start`}>
                    <Button variant="primary">
                      Start Test
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 w-full">
                <Button variant="outline" onClick={() => setIsAssembleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitAssemble}
                  disabled={assembleSubmitting}
                >
                  {assembleSubmitting ? 'Assembling...' : `Create Test (${selectedIds.size} Qs)`}
                </Button>
              </div>
            )
          }
        >
          {assembleResult ? (
            <div className="p-4 bg-[#ebf5e8] border border-[#c4e2b8] rounded-md text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-semibold text-[#2b593f] text-sm">{assembleResult.title}</h4>
              <p className="text-xs text-[#2b593f]">
                The test has been published and linked to your selected questions.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#202124] mb-1">Test Title</label>
                <input
                  type="text"
                  value={assembleTitle}
                  onChange={(e) => setAssembleTitle(e.target.value)}
                  placeholder="e.g. Quantitative Speed Drill #1"
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-[#202124] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={assembleDescription}
                  onChange={(e) => setAssembleDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-[#202124] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">Subject</label>
                  <select
                    value={assembleSubject}
                    onChange={(e) => setAssembleSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-[#202124]"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={assembleDurationMins}
                    onChange={(e) => setAssembleDurationMins(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E6E6E3] text-[#202124]"
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
