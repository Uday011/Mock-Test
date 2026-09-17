'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Flag,
  HelpCircle,
  FileQuestion,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  testTitle: string;
  totalQuestions?: number;
  selectedQuestionNumber?: number;
}

const REPORT_CATEGORIES = [
  { value: 'incorrect_answer', label: 'Incorrect Answer Key', desc: 'The designated key is mathematically or factually incorrect.' },
  { value: 'incorrect_explanation', label: 'Incorrect / Incomplete Explanation', desc: 'The step-by-step proof or explanation contains mistakes.' },
  { value: 'ambiguous_question', label: 'Ambiguous or Poorly Phrased', desc: 'The problem statement is vague or multiple options could be correct.' },
  { value: 'wrong_topic', label: 'Wrong Topic Classification', desc: 'Tagged under the incorrect subject, section, or syllabus node.' },
  { value: 'duplicate_content', label: 'Duplicate Content', desc: 'Identical question statement already appears elsewhere in the test.' },
  { value: 'formatting_issue', label: 'Formula / Formatting Rendering Glitch', desc: 'LaTeX mathematical notation or table alignment is broken.' },
  { value: 'copyright_concern', label: 'Copyright or Attribution Concern', desc: 'Content used without proper attribution or authorization.' },
  { value: 'offensive_content', label: 'Offensive or Inappropriate Content', desc: 'Contains inappropriate, defamatory, or offensive phrasing.' },
];

export function ReportModal({
  isOpen,
  onClose,
  testId,
  testTitle,
  totalQuestions = 0,
  selectedQuestionNumber,
}: ReportModalProps) {
  const [category, setCategory] = useState('incorrect_answer');
  const [questionNum, setQuestionNum] = useState<string>(
    selectedQuestionNumber ? String(selectedQuestionNumber) : 'all'
  );
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please provide a brief description of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          category,
          question_number: questionNum === 'all' ? null : Number(questionNum),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Report Content Concern"
      description={`Submit an academic accuracy or formatting report for "${testTitle}".`}
      size="md"
      footer={
        success ? (
          <div className="flex items-center justify-end w-full">
            <Button variant="primary" onClick={handleResetAndClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-stone-500">
              Reports are reviewed by academic moderators within 24h.
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                icon={<Flag className="w-3.5 h-3.5" />}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        )
      }
    >
      {success ? (
        <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-sans font-bold text-stone-900 text-sm">Report Submitted Successfully</h4>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            Thank you for helping maintain rigorous academic standards in Nalanda. Our moderation team has been notified and will audit the item.
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question scope */}
          {totalQuestions > 0 && (
            <div>
              <label className="block font-semibold text-stone-800 mb-1">Issue Scope</label>
              <select
                value={questionNum}
                onChange={(e) => setQuestionNum(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="all">Entire Test / Overall Structure</option>
                {Array.from({ length: totalQuestions }).map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Question #{i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Problem Category */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">Report Category</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_CATEGORIES.map((c) => {
                const isSelected = category === c.value;
                return (
                  <div
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-600 text-stone-900 ring-1 ring-amber-500/20'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{c.label}</span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-amber-600 border-amber-600 text-white font-bold' : 'border-stone-300'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{c.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Specific Details & Suggested Correction
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the specific error, cite the correct formula or government key..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
