'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Clock,
  Layers,
  HelpCircle,
  FileCheck,
  Zap,
  Save,
  BookmarkCheck,
  Play,
  Copy,
  Eye,
  Settings,
  Database,
  Search,
  Check,
  X,
  Shuffle,
  Shield,
  BookOpen,
  Info,
  ExternalLink,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface StudioQuestion {
  question_number: number;
  question_text: string;
  question_type: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation?: string;
  confidence?: number;
  subject_id?: string;
  topic_id?: string;
  subtopic_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  correct_marks?: number;
  negative_marks?: number;
  estimated_seconds?: number;
  source?: string;
  tags?: string[];
}

interface LinterIssue {
  type: 'critical' | 'warning';
  message: string;
  questionIndex: number;
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

export default function CreateTestPage() {
  const router = useRouter();

  // Wizard step: 1 = Pathway / Ingestion, 2 = Split-Screen Question Editor, 3 = Test Configuration
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Active Creation Pathway in Step 1
  const [activePathway, setActivePathway] = useState<'upload' | 'manual' | 'qb' | 'duplicate' | 'ai' | null>('upload');

  // Step 1: Upload state
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [paperText, setPaperText] = useState('');
  const [keyText, setKeyText] = useState('');
  const [useGemini, setUseGemini] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // AI-Assisted Draft Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExamId, setAiExamId] = useState('exam-ssc-cgl-2026');
  const [aiSubject, setAiSubject] = useState('Quantitative Aptitude');
  const [aiTopic, setAiTopic] = useState('Percentages, Profit & Loss');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Question Bank Import Modal state
  const [isQbModalOpen, setIsQbModalOpen] = useState(false);
  const [qbQuestions, setQbQuestions] = useState<any[]>([]);
  const [qbLoading, setQbLoading] = useState(false);
  const [qbSearch, setQbSearch] = useState('');
  const [qbSubjectFilter, setQbSubjectFilter] = useState('all');
  const [qbSelectedIds, setQbSelectedIds] = useState<Set<string>>(new Set());

  // Duplicate Existing Test Modal state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [duplicatingTestId, setDuplicatingTestId] = useState<string | null>(null);

  // Step 2: Questions & Editor state
  const [questions, setQuestions] = useState<StudioQuestion[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Step 3: Test Configuration state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(
    '1. The exam contains multiple-choice questions with single correct answers.\n2. Do not refresh or close the browser window during the test.\n3. Rough sheets are permitted for calculations.'
  );
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [testType, setTestType] = useState('full_mock');
  const [difficulty, setDifficulty] = useState('medium');
  const [visibility, setVisibility] = useState('public');
  const [status, setStatus] = useState<'published' | 'draft' | 'under_review'>('published');
  const [isPaid, setIsPaid] = useState(false);
  const [priceInr, setPriceInr] = useState<number>(99);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(true);
  const [resultAvailability, setResultAvailability] = useState('immediate');
  const [tagsStr, setTagsStr] = useState('Mock Test, Practice, Tier-1');
  const [saveToQuestionBank, setSaveToQuestionBank] = useState(true);

  // Duration
  const [timerMode, setTimerMode] = useState<'preset' | 'custom'>('preset');
  const [presetDuration, setPresetDuration] = useState<number>(1800); // 30 mins

  // Marking Scheme
  const [markingSchemeType, setMarkingSchemeType] = useState<'standard' | 'ssc' | 'custom'>('standard');
  const [defaultCorrectMarks, setDefaultCorrectMarks] = useState<number>(4.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState<number>(1.0);
  const [defaultUnansweredMarks, setDefaultUnansweredMarks] = useState<number>(0.0);

  // Test Rules
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [allowReviewMarking, setAllowReviewMarking] = useState(true);
  const [showImmediateResults, setShowImmediateResults] = useState(true);

  // Saving state
  const [savingAction, setSavingAction] = useState<'draft' | 'publish' | 'review' | 'attempt' | null>(null);
  const [saveError, setSaveError] = useState('');

  // Live CBE Preview Modal
  const [isCbePreviewOpen, setIsCbePreviewOpen] = useState(false);
  const [previewActiveIdx, setPreviewActiveIdx] = useState(0);
  const [previewSelectedAnswers, setPreviewSelectedAnswers] = useState<{ [qNum: number]: string }>({});
  const [previewMarkedForReview, setPreviewMarkedForReview] = useState<Set<number>>(new Set());

  // Quality Control Linter (computed on questions)
  const linterIssues = useMemo(() => {
    const issues: LinterIssue[] = [];
    const seenTexts = new Map<string, number>();

    questions.forEach((q, idx) => {
      // Missing question statement
      if (!q.question_text || !q.question_text.trim()) {
        issues.push({
          type: 'critical',
          message: `Question #${idx + 1} has an empty statement.`,
          questionIndex: idx,
        });
      }

      // Missing or invalid correct answer
      if (!q.correct_answer || !q.correct_answer.trim()) {
        issues.push({
          type: 'critical',
          message: `Question #${idx + 1} has no correct answer selected.`,
          questionIndex: idx,
        });
      }

      // Less than 2 options
      const validOptions = (q.options || []).filter((o) => o.text && o.text.trim());
      if (validOptions.length < 2) {
        issues.push({
          type: 'critical',
          message: `Question #${idx + 1} must have at least 2 non-empty options.`,
          questionIndex: idx,
        });
      }

      // Missing explanation
      if (!q.explanation || !q.explanation.trim()) {
        issues.push({
          type: 'warning',
          message: `Question #${idx + 1} is missing a detailed solution/explanation.`,
          questionIndex: idx,
        });
      }

      // Duplicate question detection
      const normalized = (q.question_text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.length > 15) {
        if (seenTexts.has(normalized)) {
          const originalIdx = seenTexts.get(normalized)!;
          issues.push({
            type: 'warning',
            message: `Question #${idx + 1} appears to be a duplicate of Question #${originalIdx + 1}.`,
            questionIndex: idx,
          });
        } else {
          seenTexts.set(normalized, idx);
        }
      }
    });

    return issues;
  }, [questions]);

  const criticalIssuesCount = linterIssues.filter((i) => i.type === 'critical').length;
  const warningIssuesCount = linterIssues.filter((i) => i.type === 'warning').length;

  useEffect(() => {
    fetch('/api/series')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.series)) {
          setSeriesList(data.series);
        }
      })
      .catch(() => {});
  }, []);

  // Active question being edited in Split-Screen
  const currentQ = questions[activeQuestionIdx] || null;

  // 1-Click Sample Paper loader
  const handleLoadSamplePaper = () => {
    const samplePaper = `Question 1. What is the fundamental unit of electric current in the International System of Units (SI)?
A. Volt
B. Ampere
C. Ohm
D. Watt
Explanation: The SI unit of electric current is the Ampere (A).

Question 2. A merchant marks his goods 40% above the cost price and allows a discount of 25%. If his net profit is Rs. 140, calculate the original cost price.
A. Rs. 2400
B. Rs. 2800
C. Rs. 3200
D. Rs. 3500
Explanation: Let CP = $100x$. Marked price = $140x$. Selling price after 25% discount = $140x \\times 0.75 = 105x$. Profit = $105x - 100x = 5x = 140 \\implies x = 28$. Hence CP = $100 \\times 28 = 2800$.

Question 3. Under Article 32 of the Indian Constitution, which writ is issued to command an authority to perform a statutory duty?
A. Habeas Corpus
B. Mandamus
C. Quo-Warranto
D. Certiorari
Explanation: Mandamus is a judicial writ issued as a command to an inferior court, college, or private/public corporation to perform a duty.

Question 4. In computer science, what is the worst-case time complexity of standard Binary Search on a sorted array of N elements?
A. O(1)
B. O(N)
C. O(log N)
D. O(N log N)
Explanation: Binary search halves the search space at every comparison, giving $O(\\log N)$ worst-case time.`;

    const sampleKey = `1. B\n2. B\n3. B\n4. C`;
    setPaperText(samplePaper);
    setKeyText(sampleKey);
    setTitle('SSC CGL Speed Drill - Tier 1 Sample');
    setSubject('Quantitative Aptitude');
  };

  // Upload & Document Parsing
  const handleUploadAndParse = async () => {
    setUploadError('');
    const hasPaper = paperFile || paperText.trim();
    if (!hasPaper) {
      setUploadError('Please upload a document file or paste question text.');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      if (paperFile) formData.append('paperFile', paperFile);
      if (keyFile) formData.append('keyFile', keyFile);
      if (paperText.trim()) formData.append('paperText', paperText);
      if (keyText.trim()) formData.append('keyText', keyText);
      formData.append('useGemini', useGemini ? 'true' : 'false');

      const savedGeminiKey = localStorage.getItem('mocktest_gemini_api_key');
      if (savedGeminiKey) formData.append('geminiApiKey', savedGeminiKey);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse document');
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions could be extracted. Please check the document format.');
      }

      const formatted: StudioQuestion[] = data.questions.map((q: any, i: number) => ({
        question_number: i + 1,
        question_text: q.question_text || '',
        question_type: q.question_type || 'single',
        options: Array.isArray(q.options)
          ? q.options.map((opt: any, optIdx: number) => {
              if (typeof opt === 'string') {
                return { label: String.fromCharCode(65 + optIdx), text: opt };
              }
              return { label: opt.label || String.fromCharCode(65 + optIdx), text: opt.text || '' };
            })
          : [],
        correct_answer: (q.correct_answer || 'A').toUpperCase().trim(),
        explanation: q.explanation || '',
        confidence: q.confidence || 1.0,
        difficulty: 'medium',
        correct_marks: 4.0,
        negative_marks: 1.0,
        estimated_seconds: 60,
        source: 'Imported Document',
        tags: ['Document Import'],
      }));

      setQuestions(formatted);
      setActiveQuestionIdx(0);
      if (!title) {
        setTitle(paperFile ? paperFile.name.replace(/\.[^/.]+$/, '') : 'Parsed Mock Examination');
      }
      setCurrentStep(2);
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing document.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Manual Creation
  const handleStartManual = () => {
    setActivePathway('manual');
    if (questions.length === 0) {
      setQuestions([
        {
          question_number: 1,
          question_text: 'What is the sum of angles in a standard planar triangle?',
          question_type: 'single',
          options: [
            { label: 'A', text: '90°' },
            { label: 'B', text: '180°' },
            { label: 'C', text: '270°' },
            { label: 'D', text: '360°' },
          ],
          correct_answer: 'B',
          explanation: 'In Euclidean geometry, the sum of internal angles in any triangle is exactly 180°.',
          difficulty: 'easy',
          correct_marks: 4.0,
          negative_marks: 1.0,
          estimated_seconds: 45,
          source: 'Manual Studio Draft',
          tags: ['Geometry'],
        },
      ]);
      setActiveQuestionIdx(0);
    }
    setCurrentStep(2);
  };

  // Question Bank Modal & Selection
  const handleOpenQbModal = async () => {
    setIsQbModalOpen(true);
    setQbLoading(true);
    try {
      const res = await fetch('/api/question-bank?status=active');
      const data = await res.json();
      if (data.success) {
        setQbQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to fetch question bank:', err);
    } finally {
      setQbLoading(false);
    }
  };

  const handleImportSelectedFromQb = () => {
    const selected = qbQuestions.filter((q) => qbSelectedIds.has(q.id));
    if (selected.length === 0) return;

    const newQuestions: StudioQuestion[] = selected.map((q, i) => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(q.options_json || '[]');
      } catch {
        parsedOptions = [];
      }

      return {
        question_number: questions.length + i + 1,
        question_text: q.question_text,
        question_type: q.question_type || 'single',
        options: parsedOptions,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        correct_marks: q.marks || 4.0,
        negative_marks: q.negative_marks || 1.0,
        estimated_seconds: q.estimated_seconds || 60,
        source: 'Question Bank Repository',
        tags: (() => {
          try {
            return JSON.parse(q.tags_json || '[]');
          } catch {
            return [];
          }
        })(),
      };
    });

    setQuestions([...questions, ...newQuestions]);
    setIsQbModalOpen(false);
    setQbSelectedIds(new Set());
    if (currentStep === 1) setCurrentStep(2);
  };

  // Duplicate Test Modal
  const handleOpenDuplicateModal = async () => {
    setIsDuplicateModalOpen(true);
    setLoadingTests(true);
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      if (data.tests) {
        setAvailableTests(data.tests);
      }
    } catch (err) {
      console.error('Failed to load tests for duplication:', err);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleDuplicateTest = async (testId: string) => {
    setDuplicatingTestId(testId);
    try {
      const res = await fetch(`/api/tests/${testId}`);
      const data = await res.json();
      if (data.test) {
        const t = data.test;
        setTitle(`${t.title} (Custom Draft)`);
        setDescription(t.description || '');
        setSubject(t.subject || 'Quantitative Aptitude');
        setDefaultCorrectMarks(t.default_correct_marks || 4.0);
        setDefaultNegativeMarks(t.default_negative_marks || 1.0);
        setPresetDuration(t.duration_seconds || 1800);

        if (Array.isArray(t.questions) && t.questions.length > 0) {
          const formatted: StudioQuestion[] = t.questions.map((q: any, i: number) => ({
            question_number: i + 1,
            question_text: q.question_text || '',
            question_type: q.question_type || 'single',
            options: q.options || [],
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || '',
            difficulty: 'medium',
            correct_marks: q.correct_marks || t.default_correct_marks || 4.0,
            negative_marks: q.negative_marks || t.default_negative_marks || 1.0,
            estimated_seconds: 60,
            source: `Cloned from ${t.title}`,
          }));
          setQuestions(formatted);
          setActiveQuestionIdx(0);
        }

        setIsDuplicateModalOpen(false);
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Failed to clone test:', err);
    } finally {
      setDuplicatingTestId(null);
    }
  };

  // AI-Assisted Draft Synthesis
  const handleGenerateAiDraft = async () => {
    setAiError('');
    setAiGenerating(true);
    try {
      const res = await fetch('/api/tests/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: aiExamId,
          subject: aiSubject,
          topic: aiTopic,
          count: aiCount,
          difficulty: aiDifficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI draft');

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const newQuestions: StudioQuestion[] = data.questions.map((q: any, i: number) => ({
          question_number: questions.length + i + 1,
          question_text: q.question_text,
          question_type: 'single',
          options: q.options || [],
          correct_answer: q.correct_answer || 'A',
          explanation: q.explanation || '',
          difficulty: aiDifficulty as any,
          correct_marks: 4.0,
          negative_marks: 1.0,
          estimated_seconds: 60,
          source: 'AI Assisted Draft',
          tags: [aiSubject, aiTopic],
        }));

        setQuestions([...questions, ...newQuestions]);
        if (!title) {
          setTitle(`${aiSubject} - ${aiTopic} (AI High-Yield Draft)`);
        }
        setSubject(aiSubject);
        setIsAiModalOpen(false);
        if (currentStep === 1) setCurrentStep(2);
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to synthesize draft questions');
    } finally {
      setAiGenerating(false);
    }
  };

  // Split-Screen Question Operations
  const addNewQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ: StudioQuestion = {
      question_number: nextNum,
      question_text: '',
      question_type: 'single',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correct_answer: 'A',
      explanation: '',
      difficulty: 'medium',
      correct_marks: defaultCorrectMarks,
      negative_marks: defaultNegativeMarks,
      estimated_seconds: 60,
      source: 'Author Draft',
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIdx(questions.length);
  };

  const deleteQuestion = (indexToDelete: number) => {
    if (questions.length <= 1) return;
    const updated = questions
      .filter((_, idx) => idx !== indexToDelete)
      .map((q, idx) => ({ ...q, question_number: idx + 1 }));
    setQuestions(updated);
    if (activeQuestionIdx >= updated.length) {
      setActiveQuestionIdx(Math.max(0, updated.length - 1));
    }
  };

  const moveQuestion = (fromIdx: number, direction: 'up' | 'down') => {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= questions.length) return;
    const copy = [...questions];
    const temp = copy[fromIdx];
    copy[fromIdx] = copy[toIdx];
    copy[toIdx] = temp;
    const renumbered = copy.map((q, i) => ({ ...q, question_number: i + 1 }));
    setQuestions(renumbered);
    setActiveQuestionIdx(toIdx);
  };

  const updateCurrentQuestionText = (val: string) => {
    const next = [...questions];
    next[activeQuestionIdx].question_text = val;
    setQuestions(next);
  };

  const updateCurrentOptionText = (optIdx: number, val: string) => {
    const next = [...questions];
    const opts = [...next[activeQuestionIdx].options];
    opts[optIdx] = { ...opts[optIdx], text: val };
    next[activeQuestionIdx].options = opts;
    setQuestions(next);
  };

  const updateCurrentCorrectAnswer = (label: string) => {
    const next = [...questions];
    next[activeQuestionIdx].correct_answer = label;
    setQuestions(next);
  };

  const addOptionToCurrent = () => {
    const next = [...questions];
    const opts = [...next[activeQuestionIdx].options];
    const nextLabel = String.fromCharCode(65 + opts.length);
    opts.push({ label: nextLabel, text: '' });
    next[activeQuestionIdx].options = opts;
    setQuestions(next);
  };

  const removeOptionFromCurrent = (optIdx: number) => {
    const next = [...questions];
    const opts = next[activeQuestionIdx].options.filter((_, idx) => idx !== optIdx);
    // Renumber labels A, B, C...
    const relabeled = opts.map((o, idx) => ({ ...o, label: String.fromCharCode(65 + idx) }));
    next[activeQuestionIdx].options = relabeled;
    if (!relabeled.some((o) => o.label === next[activeQuestionIdx].correct_answer)) {
      next[activeQuestionIdx].correct_answer = 'A';
    }
    setQuestions(next);
  };

  const updateCurrentExplanation = (val: string) => {
    const next = [...questions];
    next[activeQuestionIdx].explanation = val;
    setQuestions(next);
  };

  // Final Test Submission / Publishing
  const handleSaveTest = async (action: 'draft' | 'publish' | 'review' | 'attempt') => {
    setSaveError('');
    if (!title.trim()) {
      setSaveError('Please enter a test title.');
      return;
    }
    if (questions.length === 0) {
      setSaveError('The test must have at least one question.');
      return;
    }

    if (isPaid && Number(priceInr) <= 0) {
      setSaveError('Please set a valid price greater than ₹0 for paid tests.');
      return;
    }

    if (!copyrightConfirmed && (action === 'publish' || action === 'review')) {
      setSaveError('Please confirm the intellectual property and copyright declaration.');
      return;
    }

    if (action === 'publish' && criticalIssuesCount > 0) {
      setSaveError(`Please resolve all ${criticalIssuesCount} critical linter issue(s) before publishing.`);
      return;
    }

    setSavingAction(action);
    try {
      let finalStatus: 'draft' | 'under_review' | 'published' = 'published';
      if (action === 'draft') finalStatus = 'draft';
      else if (action === 'review') finalStatus = 'under_review';
      else finalStatus = 'published';

      const parsedTags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const durationSec = timerMode === 'preset' ? presetDuration : 1800;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        subject,
        test_type: testType,
        difficulty,
        visibility,
        is_paid: isPaid ? 1 : 0,
        price_inr: isPaid ? Number(priceInr) : 0,
        series_id: selectedSeriesId || null,
        status: finalStatus,
        result_availability: resultAvailability,
        tags: parsedTags,
        duration_seconds: durationSec,
        marking_scheme_type: markingSchemeType,
        default_correct_marks: defaultCorrectMarks,
        default_negative_marks: defaultNegativeMarks,
        default_unanswered_marks: defaultUnansweredMarks,
        shuffle_questions: shuffleQuestions ? 1 : 0,
        shuffle_options: shuffleOptions ? 1 : 0,
        allow_navigation: allowNavigation ? 1 : 0,
        show_palette: showPalette ? 1 : 0,
        allow_review_marking: allowReviewMarking ? 1 : 0,
        show_immediate_results: showImmediateResults ? 1 : 0,
        save_to_question_bank: saveToQuestionBank,
        questions: questions.map((q) => ({
          question_number: q.question_number,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          correct_marks: q.correct_marks || defaultCorrectMarks,
          negative_marks: q.negative_marks || defaultNegativeMarks,
          unanswered_marks: defaultUnansweredMarks,
          explanation: q.explanation || '',
          confidence: q.confidence || 1.0,
          difficulty: q.difficulty || difficulty,
          estimated_seconds: q.estimated_seconds || 60,
          source: q.source || 'Studio Test Authoring',
          tags: q.tags || [],
        })),
      };

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save test');

      if (action === 'attempt') {
        router.push(`/tests/${data.testId}/start`);
      } else {
        router.push(`/tests/${data.testId}`);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save test.');
    } finally {
      setSavingAction(null);
    }
  };

  // Live CBE Preview handlers
  const handleSelectOptionInPreview = (qNum: number, label: string) => {
    setPreviewSelectedAnswers((prev) => ({
      ...prev,
      [qNum]: label,
    }));
  };

  const handleToggleReviewInPreview = (qNum: number) => {
    const next = new Set(previewMarkedForReview);
    if (next.has(qNum)) next.delete(qNum);
    else next.add(qNum);
    setPreviewMarkedForReview(next);
  };

  const handleClearPreviewAnswer = (qNum: number) => {
    setPreviewSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qNum];
      return next;
    });
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Studio & Repository', href: '/tests/create' },
        { label: 'Test Studio' },
      ]}
    >
      <PageHeader
        title="Nalanda Test Studio"
        description="End-to-end authoring suite: import PDFs/DOCX, synthesize AI questions, reuse question bank items, and run quality control validation before publishing."
        actions={
          <div className="flex items-center gap-2.5">
            {questions.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPreviewActiveIdx(0);
                  setIsCbePreviewOpen(true);
                }}
                icon={<Eye className="w-4 h-4 text-amber-700" />}
              >
                Preview CBE Experience
              </Button>
            )}
            <Link href="/question-bank">
              <Button variant="outline" size="sm" icon={<Database className="w-4 h-4" />}>
                Question Bank
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stepper Wizard Bar */}
      <div className="bg-white border border-notion-border rounded-md p-1.5 mb-6 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              currentStep === 1
                ? 'bg-notion-text text-white'
                : 'text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                currentStep === 1 ? 'bg-white/20 text-white' : 'bg-notion-border text-notion-muted'
              }`}
            >
              1
            </span>
            <span>Creation Pathway</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-notion-muted/40" />

          <button
            onClick={() => questions.length > 0 && setCurrentStep(2)}
            disabled={questions.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              currentStep === 2
                ? 'bg-notion-text text-white'
                : questions.length > 0
                ? 'text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                : 'text-notion-muted/40 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                currentStep === 2 ? 'bg-white/20 text-white' : 'bg-notion-border text-notion-muted'
              }`}
            >
              2
            </span>
            <span>Question Editor ({questions.length})</span>
            {criticalIssuesCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-notion-muted/40" />

          <button
            onClick={() => questions.length > 0 && setCurrentStep(3)}
            disabled={questions.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              currentStep === 3
                ? 'bg-notion-text text-white'
                : questions.length > 0
                ? 'text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                : 'text-notion-muted/40 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                currentStep === 3 ? 'bg-white/20 text-white' : 'bg-notion-border text-notion-muted'
              }`}
            >
              3
            </span>
            <span>Settings & Publish</span>
          </button>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-notion-muted pr-2">
            <span className="flex items-center gap-1 font-mono">
              <span className="font-semibold text-notion-text">{questions.length}</span> questions
            </span>
            {criticalIssuesCount > 0 ? (
              <span className="flex items-center gap-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {criticalIssuesCount} errors
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Linter Passed
              </span>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: 5 CREATION PATHWAYS */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Pathway 1: Upload Document */}
            <div
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                activePathway === 'upload'
                  ? 'border-notion-text bg-notion-sidebar ring-1 ring-notion-text/20'
                  : 'border-notion-border bg-white hover:border-notion-text/40 hover:bg-[#fcfbf9]'
              }`}
              onClick={() => setActivePathway('upload')}
            >
              <div className="w-8 h-8 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center mb-2.5">
                <UploadCloud className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-notion-text">Document Upload</h3>
              <p className="text-[11px] text-notion-muted mt-1 leading-relaxed">
                Import PDF, DOCX, TXT, CSV, or spreadsheet mock papers.
              </p>
            </div>

            {/* Pathway 2: Manual Authoring */}
            <div
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                activePathway === 'manual'
                  ? 'border-notion-text bg-notion-sidebar ring-1 ring-notion-text/20'
                  : 'border-notion-border bg-white hover:border-notion-text/40 hover:bg-[#fcfbf9]'
              }`}
              onClick={handleStartManual}
            >
              <div className="w-8 h-8 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center mb-2.5">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-notion-text">Manual Authoring</h3>
              <p className="text-[11px] text-notion-muted mt-1 leading-relaxed">
                Draft questions from scratch in the split-screen editor.
              </p>
            </div>

            {/* Pathway 3: Question Bank Import */}
            <div
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                activePathway === 'qb'
                  ? 'border-notion-text bg-notion-sidebar ring-1 ring-notion-text/20'
                  : 'border-notion-border bg-white hover:border-notion-text/40 hover:bg-[#fcfbf9]'
              }`}
              onClick={() => {
                setActivePathway('qb');
                handleOpenQbModal();
              }}
            >
              <div className="w-8 h-8 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center mb-2.5">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-notion-text">Question Bank</h3>
              <p className="text-[11px] text-notion-muted mt-1 leading-relaxed">
                Pick from hundreds of peer-reviewed repository questions.
              </p>
            </div>

            {/* Pathway 4: Duplicate Test */}
            <div
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                activePathway === 'duplicate'
                  ? 'border-notion-text bg-notion-sidebar ring-1 ring-notion-text/20'
                  : 'border-notion-border bg-white hover:border-notion-text/40 hover:bg-[#fcfbf9]'
              }`}
              onClick={() => {
                setActivePathway('duplicate');
                handleOpenDuplicateModal();
              }}
            >
              <div className="w-8 h-8 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center mb-2.5">
                <Copy className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-notion-text">Duplicate Test</h3>
              <p className="text-[11px] text-notion-muted mt-1 leading-relaxed">
                Clone an existing test to customize questions or schemes.
              </p>
            </div>

            {/* Pathway 5: AI-Assisted Draft */}
            <div
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                activePathway === 'ai'
                  ? 'border-notion-text bg-notion-sidebar ring-1 ring-notion-text/20'
                  : 'border-notion-border bg-white hover:border-notion-text/40 hover:bg-[#fcfbf9]'
              }`}
              onClick={() => {
                setActivePathway('ai');
                setIsAiModalOpen(true);
              }}
            >
              <div className="w-8 h-8 rounded bg-notion-sidebar border border-notion-border text-notion-text flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-notion-text">AI-Assisted Draft</h3>
              <p className="text-[11px] text-notion-muted mt-1 leading-relaxed">
                Generate high-yield questions with proofs on any syllabus topic.
              </p>
            </div>
          </div>

          {/* Active Pathway Details: Document Upload Area */}
          {activePathway === 'upload' && (
            <div className="bg-white rounded-md border border-notion-border p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-notion-border gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-notion-text flex items-center gap-2">
                    <FileText className="w-4 h-4 text-notion-muted" />
                    Document Ingestion & Parsing
                  </h3>
                  <p className="text-xs text-notion-muted mt-0.5">
                    Upload official PDF/DOCX question papers, or paste raw text. The parser will extract statements, options, answer keys, and LaTeX formulas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleLoadSamplePaper}>
                    Load Sample Paper
                  </Button>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* File Upload Box */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-notion-text mb-1.5">
                      Question Paper File (PDF, DOCX, TXT, CSV)
                    </label>
                    <div className="border border-dashed border-notion-border hover:border-notion-text/40 rounded-md p-6 text-center bg-notion-bg transition-colors">
                      <input
                        type="file"
                        id="paper-file-input"
                        accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
                        onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="paper-file-input" className="cursor-pointer">
                        <UploadCloud className="w-7 h-7 text-notion-muted mx-auto mb-2" />
                        <span className="text-xs font-medium text-notion-text hover:underline">
                          {paperFile ? paperFile.name : 'Click to select question paper file'}
                        </span>
                        <p className="text-[11px] text-notion-muted mt-1">
                          Supports multi-column test layouts, tables, and formula extracts.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-notion-text mb-1.5">
                      Separate Answer Key File (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.csv"
                      onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-notion-muted file:mr-3 file:py-1.5 file:px-2.5 file:rounded file:border file:border-notion-border file:text-xs file:font-medium file:bg-notion-sidebar file:text-notion-text hover:file:bg-stone-200 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-notion-sidebar rounded-md border border-notion-border text-xs text-notion-text space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-notion-text">
                      <input
                        type="checkbox"
                        checked={useGemini}
                        onChange={(e) => setUseGemini(e.target.checked)}
                        className="rounded border-notion-border text-notion-text focus:ring-0"
                      />
                      <span>Enable High-Accuracy Gemini AI OCR & Formula Extraction</span>
                    </label>
                    <p className="text-[11px] text-notion-muted pl-5">
                      Extracts complex mathematical expressions, diagram descriptions, and ambiguous option letters with high precision.
                    </p>
                  </div>
                </div>

                {/* Paste Text Alternative */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-notion-text mb-1.5">
                      Or Paste Question Paper Text
                    </label>
                    <textarea
                      rows={6}
                      value={paperText}
                      onChange={(e) => setPaperText(e.target.value)}
                      placeholder="Paste questions here with options (A, B, C, D) and explanations..."
                      className="w-full p-2.5 rounded-md bg-white border border-notion-border text-xs text-notion-text placeholder-notion-muted/50 focus:border-notion-text focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-notion-text mb-1.5">
                      Or Paste Answer Key Text (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={keyText}
                      onChange={(e) => setKeyText(e.target.value)}
                      placeholder="e.g. 1. A, 2. B, 3. C, 4. D..."
                      className="w-full p-2.5 rounded-md bg-white border border-notion-border text-xs text-notion-text placeholder-notion-muted/50 focus:border-notion-text focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-notion-border flex items-center justify-between">
                <span className="text-xs text-notion-muted">
                  Document will be parsed into individual questions and passed to the Quality Control Linter.
                </span>
                <Button
                  variant="primary"
                  onClick={handleUploadAndParse}
                  disabled={uploadLoading}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  {uploadLoading ? 'Parsing & Linting...' : 'Parse Document to Editor'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SPLIT-SCREEN QUESTION EDITOR & QUALITY CONTROL LINTER */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Quality Control Linter Bar */}
          <div className="p-3 rounded-md bg-white border border-notion-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-notion-text flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-notion-muted" />
                Quality Control Linter
              </span>
              <span className="text-notion-border">|</span>
              {criticalIssuesCount === 0 && warningIssuesCount === 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All {questions.length} questions are verified and ready
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {criticalIssuesCount > 0 && (
                    <span className="text-rose-700 font-medium flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {criticalIssuesCount} Critical Issue{criticalIssuesCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {warningIssuesCount > 0 && (
                    <span className="text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      {warningIssuesCount} Warning{warningIssuesCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenQbModal}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Question Bank
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={addNewQuestion}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Blank Question
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(3)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Configure Test
              </Button>
            </div>
          </div>

          {/* Split-Screen Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Questions Navigator (4 Cols) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between px-1 text-xs text-notion-muted font-medium">
                <span>Questions ({questions.length})</span>
                <span>Click to Select</span>
              </div>

              <div className="space-y-1.5 max-h-60 sm:max-h-72 lg:max-h-[720px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = idx === activeQuestionIdx;
                  const hasCrit = !q.correct_answer || !q.question_text || (q.options || []).length < 2;
                  const hasWarn = !q.explanation;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-notion-sidebar border-notion-text text-notion-text ring-1 ring-notion-text/20'
                          : 'bg-white border-notion-border hover:border-notion-text/30 hover:bg-[#fcfbf9] text-notion-text'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-mono font-semibold text-[10px] ${
                              isActive
                                ? 'bg-notion-text text-white'
                                : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-medium text-notion-text font-mono text-[11px]">
                            Key: {q.correct_answer || 'None'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasCrit ? (
                            <span className="text-rose-700 text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                              Error
                            </span>
                          ) : hasWarn ? (
                            <span className="text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                              Warning
                            </span>
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}

                          {/* Reorder Buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-1 text-notion-muted hover:text-notion-text disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(idx, 'down');
                            }}
                            disabled={idx === questions.length - 1}
                            className="p-1 text-notion-muted hover:text-notion-text disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(idx);
                            }}
                            className="p-1 text-notion-muted hover:text-rose-600"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-notion-muted line-clamp-2 leading-relaxed text-[11px]">
                        {q.question_text || 'Empty statement'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Split-Screen Editor & Student Preview (8 Cols) */}
            {currentQ && (
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-md border border-notion-border p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-notion-border text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-notion-text text-sm">
                        Question #{activeQuestionIdx + 1}
                      </span>
                      <Badge variant="stone">{currentQ.difficulty || 'medium'}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-notion-muted font-mono text-[11px]">
                      <span>Options: {currentQ.options?.length || 0}</span>
                      <span>Key: {currentQ.correct_answer || 'Not Set'}</span>
                    </div>
                  </div>

                  {/* Question Statement Textarea */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-notion-text">
                          Question Statement (Supports $...$ for LaTeX math)
                        </label>
                        <span className="text-[11px] text-notion-muted font-mono">
                          e.g. What is the value of $\int x^2 dx$?
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={currentQ.question_text}
                        onChange={(e) => updateCurrentQuestionText(e.target.value)}
                        className="w-full p-2.5 rounded-md bg-white border border-notion-border text-xs text-notion-text placeholder-notion-muted/50 focus:border-notion-text focus:outline-none"
                      />
                    </div>

                    {/* Options Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-notion-text">
                          Options & Correct Answer:
                        </label>
                        <button
                          type="button"
                          onClick={addOptionToCurrent}
                          className="text-xs text-notion-text hover:underline font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentQ.options || []).map((opt, optIdx) => {
                          const isCorrect = currentQ.correct_answer === opt.label;
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateCurrentCorrectAnswer(opt.label)}
                                className={`w-7 h-7 rounded text-xs font-semibold transition-all shrink-0 ${
                                  isCorrect
                                    ? 'bg-notion-text text-white'
                                    : 'bg-notion-sidebar text-notion-muted hover:text-notion-text border border-notion-border'
                                }`}
                                title="Click to designate as correct answer"
                              >
                                {opt.label}
                              </button>

                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => updateCurrentOptionText(optIdx, e.target.value)}
                                placeholder={`Option ${opt.label} text`}
                                className={`flex-1 px-2.5 py-1.5 rounded-md border text-xs text-notion-text focus:outline-none ${
                                  isCorrect
                                    ? 'bg-emerald-50/40 border-emerald-300 font-medium'
                                    : 'bg-white border-notion-border focus:border-notion-text'
                                }`}
                              />

                              {(currentQ.options || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOptionFromCurrent(optIdx)}
                                  className="text-notion-muted hover:text-rose-600 p-1.5 rounded hover:bg-stone-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <label className="block text-xs font-medium text-notion-text mb-1.5">
                        Solution & Pedagogical Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={currentQ.explanation || ''}
                        onChange={(e) => updateCurrentExplanation(e.target.value)}
                        placeholder="Provide step-by-step reasoning, mathematical proofs, or references..."
                        className="w-full p-2.5 rounded-md bg-white border border-notion-border text-xs text-notion-text placeholder-notion-muted/50 focus:border-notion-text focus:outline-none"
                      />
                    </div>

                    {/* Meta tags & Pedagogical Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-notion-muted mb-1">
                          Difficulty
                        </label>
                        <select
                          value={currentQ.difficulty || 'medium'}
                          onChange={(e) => {
                            const next = [...questions];
                            next[activeQuestionIdx].difficulty = e.target.value as any;
                            setQuestions(next);
                          }}
                          className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-notion-muted mb-1">
                          Marks (+)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={currentQ.correct_marks || 4.0}
                          onChange={(e) => {
                            const next = [...questions];
                            next[activeQuestionIdx].correct_marks = Number(e.target.value);
                            setQuestions(next);
                          }}
                          className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-notion-muted mb-1">
                          Penalty (-)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          value={currentQ.negative_marks || 1.0}
                          onChange={(e) => {
                            const next = [...questions];
                            next[activeQuestionIdx].negative_marks = Number(e.target.value);
                            setQuestions(next);
                          }}
                          className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-notion-muted mb-1">
                          Est. Secs
                        </label>
                        <input
                          type="number"
                          value={currentQ.estimated_seconds || 60}
                          onChange={(e) => {
                            const next = [...questions];
                            next[activeQuestionIdx].estimated_seconds = Number(e.target.value);
                            setQuestions(next);
                          }}
                          className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Student Live Preview Card */}
                <div className="bg-notion-bg rounded-md border border-notion-border p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-notion-border text-xs text-notion-muted">
                    <span className="font-medium text-notion-text flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-notion-muted" />
                      Candidate View Simulation
                    </span>
                    <span className="font-mono text-[11px]">
                      Question {activeQuestionIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="text-xs text-notion-text font-normal leading-relaxed">
                    <FormattedMathText text={currentQ.question_text} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(currentQ.options || []).map((opt, i) => {
                      const isCorrect = currentQ.correct_answer === opt.label;
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-md text-xs border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium'
                              : 'bg-white border-notion-border text-notion-text'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <div className="flex-1 mt-0.5 text-[11px]">
                            <FormattedMathText text={opt.text} />
                          </div>
                          {isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {currentQ.explanation && (
                    <div className="p-2.5 rounded-md bg-amber-50/50 border border-amber-200 text-amber-950 text-xs mt-2">
                      <strong className="block text-notion-text font-semibold mb-0.5">Pedagogical Explanation:</strong>
                      <FormattedMathText text={currentQ.explanation} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: TEST CONFIGURATION & PUBLICATION */}
      {currentStep === 3 && (
        <div className="bg-white rounded-md border border-notion-border p-5 space-y-5">
          <div className="pb-3 border-b border-notion-border">
            <h3 className="text-sm font-semibold text-notion-text flex items-center gap-2">
              <Settings className="w-4 h-4 text-notion-muted" />
              Test Configuration & Delivery Settings
            </h3>
            <p className="text-xs text-notion-muted mt-0.5">
              Configure exam type, duration, marking scheme, randomization rules, and release policy.
            </p>
          </div>

          {saveError && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: General Info & Type */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-notion-text mb-1">Test Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SSC CGL 2026 Tier-I Full Mock Examination 01"
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-notion-text mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of syllabus covered, target candidates, or difficulty notes..."
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-notion-text mb-1">
                  Candidate Exam Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Standard test conduct guidelines displayed before candidate starts..."
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Test Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="topic_test">Topic Test</option>
                    <option value="subtopic_test">Subtopic Test</option>
                    <option value="chapter_test">Chapter Test</option>
                    <option value="sectional_test">Sectional Test</option>
                    <option value="subject_test">Subject Test</option>
                    <option value="full_mock">Full-Length Mock</option>
                    <option value="pyq">Previous-Year Paper</option>
                    <option value="revision_test">Mixed Revision Test</option>
                    <option value="custom_practice">Custom Test</option>
                    <option value="community_test">Community Test</option>
                    <option value="educator_test">Educator Test</option>
                    <option value="test_series">Test Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                    <option value="English Comprehension">English Comprehension</option>
                    <option value="General Awareness">General Awareness</option>
                    <option value="Science & General">Science & General</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Duration, Marking & Delivery */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Duration Preset</label>
                  <select
                    value={presetDuration}
                    onChange={(e) => {
                      setTimerMode('preset');
                      setPresetDuration(Number(e.target.value));
                    }}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value={900}>15 Minutes (Speed Drill)</option>
                    <option value={1800}>30 Minutes (Sectional)</option>
                    <option value={3600}>60 Minutes (Tier-I 100Q)</option>
                    <option value={7200}>120 Minutes (2 Hours)</option>
                    <option value={10800}>180 Minutes (Full Length)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Marking Scheme</label>
                  <select
                    value={markingSchemeType}
                    onChange={(e) => {
                      const scheme = e.target.value as any;
                      setMarkingSchemeType(scheme);
                      if (scheme === 'ssc') {
                        setDefaultCorrectMarks(2.0);
                        setDefaultNegativeMarks(0.5);
                      } else if (scheme === 'standard') {
                        setDefaultCorrectMarks(4.0);
                        setDefaultNegativeMarks(1.0);
                      }
                    }}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="standard">Standard (+4.0 / -1.0)</option>
                    <option value="ssc">SSC CGL (+2.0 / -0.5)</option>
                    <option value="custom">Custom (Question-level)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-notion-muted mb-1">Correct Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={defaultCorrectMarks}
                    onChange={(e) => setDefaultCorrectMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-notion-muted mb-1">Negative Penalty</label>
                  <input
                    type="number"
                    step="0.25"
                    value={defaultNegativeMarks}
                    onChange={(e) => setDefaultNegativeMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-notion-muted mb-1">Result Release</label>
                  <select
                    value={resultAvailability}
                    onChange={(e) => setResultAvailability(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="after_window">After Window</option>
                    <option value="manual">Manual Release</option>
                  </select>
                </div>
              </div>

              {/* Delivery Security Toggles */}
              <div className="p-3 bg-notion-sidebar rounded-md border border-notion-border space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-normal text-notion-text">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded border-notion-border text-notion-text focus:ring-0"
                  />
                  <span>Shuffle questions for candidates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-normal text-notion-text">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded border-notion-border text-notion-text focus:ring-0"
                  />
                  <span>Shuffle option orders per question</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-notion-text">
                  <input
                    type="checkbox"
                    checked={saveToQuestionBank}
                    onChange={(e) => setSaveToQuestionBank(e.target.checked)}
                    className="rounded border-notion-border text-notion-text focus:ring-0"
                  />
                  <span>Save all questions to Nalanda Question Bank</span>
                </label>
              </div>

              {/* Visibility & Pricing Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Catalog Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="public">Public (Listed in Library)</option>
                    <option value="unlisted">Unlisted (Direct Link)</option>
                    <option value="shared">Shared (Enrolled Institute Only)</option>
                    <option value="private">Private (Author Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-text mb-1">Access & Pricing</label>
                  <select
                    value={isPaid ? 'paid' : 'free'}
                    onChange={(e) => setIsPaid(e.target.value === 'paid')}
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                  >
                    <option value="free">Free Open Access</option>
                    <option value="paid">Paid Premium Access</option>
                  </select>
                </div>
              </div>

              {isPaid && (
                <div className="p-3 bg-amber-50/50 rounded-md border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-amber-950">Tuition Price (₹ INR)</label>
                    <span className="text-[10px] text-amber-800 font-mono">Platform fee: 15%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-semibold text-notion-muted">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={priceInr}
                      onChange={(e) => setPriceInr(Math.max(1, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-1.5 rounded-md bg-white border border-amber-300 text-xs text-notion-text font-semibold font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-notion-muted">
                    Learners will unlock this test via Nalanda checkout. Payouts accrue to your Educator Ledger.
                  </p>
                </div>
              )}

              {/* Test Series Assignment */}
              <div>
                <label className="block text-xs font-medium text-notion-text mb-1">Attach to Test Series</label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                >
                  <option value="">Standalone Test (Not in a Series)</option>
                  {seriesList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.is_paid ? `Paid ₹${s.price_inr}` : 'Free'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-notion-text mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="e.g. Tier-1, TCS Pattern, 2026"
                  className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
                />
              </div>

              {/* Copyright & Originality Declaration */}
              <div className="p-3 bg-notion-sidebar rounded-md border border-notion-border">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-notion-text">
                  <input
                    type="checkbox"
                    checked={copyrightConfirmed}
                    onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-notion-border text-notion-text focus:ring-0"
                  />
                  <span>
                    I confirm that this assessment conforms to Nalanda academic guidelines, contains verified answer keys, and respects intellectual property rights.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-notion-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setCurrentStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Editor
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <Button
                variant="secondary"
                onClick={() => handleSaveTest('draft')}
                disabled={savingAction !== null}
                icon={<Save className="w-4 h-4" />}
              >
                {savingAction === 'draft' ? 'Saving...' : 'Save Draft'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleSaveTest('review')}
                disabled={savingAction !== null}
                icon={<ShieldCheck className="w-4 h-4 text-notion-muted" />}
              >
                {savingAction === 'review' ? 'Submitting...' : 'Submit for Review'}
              </Button>

              <Button
                variant="primary"
                onClick={() => handleSaveTest('publish')}
                disabled={savingAction !== null}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {savingAction === 'publish' ? 'Publishing...' : 'Publish Test'}
              </Button>

              <Button
                variant="saffron"
                onClick={() => handleSaveTest('attempt')}
                disabled={savingAction !== null}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                {savingAction === 'attempt' ? 'Launching...' : 'Publish & Attempt'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI-Assisted Draft Generator */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI-Assisted Test Draft Generator"
        description="Synthesize high-fidelity test questions with LaTeX derivations based on current exam syllabus structures."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateAiDraft}
              disabled={aiGenerating}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {aiGenerating ? 'Synthesizing Questions...' : 'Generate Test Draft'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          {aiError && (
            <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
              {aiError}
            </div>
          )}

          <div>
            <label className="block font-medium text-notion-text mb-1">Target Examination</label>
            <select
              value={aiExamId}
              onChange={(e) => setAiExamId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
            >
              <option value="exam-ssc-cgl-2026">SSC CGL 2026 (Combined Graduate Level)</option>
              <option value="exam-neet-ug-2026">NEET UG 2026 (Medical Entrance)</option>
              <option value="exam-upsc-cse-2026">UPSC CSE Prelims 2026</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-notion-text mb-1">Subject</label>
              <select
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="General Intelligence & Reasoning">Reasoning</option>
                <option value="English Comprehension">English Comprehension</option>
                <option value="General Awareness">General Awareness</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-notion-text mb-1">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
              >
                <option value="easy">Easy (Foundational)</option>
                <option value="medium">Medium (Standard Exam)</option>
                <option value="hard">Hard (Advanced Proofs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-notion-text mb-1">Syllabus Topic</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. Triangles, Circles & Geometry"
              className="w-full px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-notion-text mb-1">Question Count</label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setAiCount(cnt)}
                  className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                    aiCount === cnt
                      ? 'bg-notion-text text-white border-notion-text'
                      : 'bg-white border-notion-border text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: Import from Question Bank */}
      <Modal
        isOpen={isQbModalOpen}
        onClose={() => setIsQbModalOpen(false)}
        title="Import from Question Bank Repository"
        description="Select verified questions from your institution repository to assemble into this test."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-notion-muted font-mono">
              {qbSelectedIds.size} question(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsQbModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImportSelectedFromQb}
                disabled={qbSelectedIds.size === 0}
                icon={<Plus className="w-4 h-4" />}
              >
                Import {qbSelectedIds.size} Questions
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-notion-muted" />
              <input
                type="text"
                value={qbSearch}
                onChange={(e) => setQbSearch(e.target.value)}
                placeholder="Filter by concept, topic, or keyword..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text placeholder-notion-muted/50 focus:border-notion-text focus:outline-none"
              />
            </div>
            <select
              value={qbSubjectFilter}
              onChange={(e) => setQbSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-white border border-notion-border text-xs text-notion-text focus:border-notion-text focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="Quantitative Aptitude">Quantitative</option>
              <option value="General Intelligence & Reasoning">Reasoning</option>
              <option value="English Comprehension">English</option>
              <option value="General Awareness">General Awareness</option>
            </select>
          </div>

          {qbLoading ? (
            <div className="py-8 text-center text-xs text-notion-muted">Loading Question Bank...</div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {qbQuestions
                .filter((q) => {
                  if (qbSubjectFilter !== 'all' && q.subject_id !== qbSubjectFilter) return false;
                  if (qbSearch.trim()) {
                    const s = qbSearch.toLowerCase();
                    return (
                      q.question_text.toLowerCase().includes(s) ||
                      (q.topic_id && q.topic_id.toLowerCase().includes(s))
                    );
                  }
                  return true;
                })
                .map((q) => {
                  const isSelected = qbSelectedIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        const next = new Set(qbSelectedIds);
                        if (next.has(q.id)) next.delete(q.id);
                        else next.add(q.id);
                        setQbSelectedIds(next);
                      }}
                      className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-notion-sidebar border-notion-text text-notion-text ring-1 ring-notion-text/20'
                          : 'bg-white border-notion-border text-notion-text hover:border-notion-text/30 hover:bg-[#fcfbf9]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              isSelected
                                ? 'bg-notion-text border-notion-text text-white font-bold'
                                : 'border-notion-border bg-white'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="font-semibold text-notion-text">
                            {q.subject_id || 'General'}
                          </span>
                          {q.topic_id && <span className="text-notion-muted">• {q.topic_id}</span>}
                        </div>
                        <Badge variant="stone">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-notion-muted text-[11px]">
                        <FormattedMathText text={q.question_text} />
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: Duplicate Existing Test */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Duplicate Existing Test"
        description="Select an existing published test to clone as a baseline for your new exam."
        size="md"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="secondary" onClick={() => setIsDuplicateModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {loadingTests ? (
            <div className="py-8 text-center text-xs text-notion-muted">Loading tests...</div>
          ) : (
            availableTests.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-md bg-white border border-notion-border hover:border-notion-text/40 flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="text-xs font-semibold text-notion-text">{t.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-notion-muted mt-0.5">
                    <span>{t.subject || 'General'}</span>
                    <span>•</span>
                    <span>{t.question_count || 0} Questions</span>
                    <span>•</span>
                    <span>{Math.round((t.duration_seconds || 1800) / 60)} Mins</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDuplicateTest(t.id)}
                  disabled={duplicatingTestId === t.id}
                  icon={<Copy className="w-3.5 h-3.5" />}
                >
                  {duplicatingTestId === t.id ? 'Cloning...' : 'Clone'}
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* MODAL: Full CBE Simulation Live Preview */}
      <Modal
        isOpen={isCbePreviewOpen}
        onClose={() => setIsCbePreviewOpen(false)}
        title={`Live CBE Test Simulation: ${title || 'Nalanda Practice Exam'}`}
        description="Verify the exact Computer-Based Testing candidate interface with question palette, timers, and marking actions."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-notion-muted">
              Interactive Test Mode: Candidate answers are not permanently saved.
            </span>
            <Button variant="primary" onClick={() => setIsCbePreviewOpen(false)}>
              Exit Simulation
            </Button>
          </div>
        }
      >
        {questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Main Question Interface (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 rounded-md bg-white border border-notion-border space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-notion-border text-xs text-notion-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-notion-text text-sm">
                      Question #{previewActiveIdx + 1}
                    </span>
                    <Badge variant="stone">Single Choice</Badge>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-medium">
                      +{questions[previewActiveIdx]?.correct_marks || defaultCorrectMarks}
                    </span>
                    <span className="text-rose-700 font-medium">
                      -{questions[previewActiveIdx]?.negative_marks || defaultNegativeMarks}
                    </span>
                  </div>
                </div>

                {/* Statement */}
                <div className="text-xs text-notion-text font-normal leading-relaxed min-h-[50px]">
                  <FormattedMathText text={questions[previewActiveIdx]?.question_text} />
                </div>

                {/* Interactive Options */}
                <div className="space-y-1.5 pt-1">
                  {(questions[previewActiveIdx]?.options || []).map((opt, oIdx) => {
                    const isSelected =
                      previewSelectedAnswers[previewActiveIdx + 1] === opt.label;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOptionInPreview(previewActiveIdx + 1, opt.label)}
                        className={`p-2.5 rounded-md border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-notion-sidebar border-notion-text text-notion-text font-medium'
                            : 'bg-white border-notion-border text-notion-text hover:border-notion-text/30 hover:bg-[#fcfbf9]'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                            isSelected ? 'bg-notion-text text-white' : 'bg-notion-sidebar text-notion-muted border border-notion-border'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div className="flex-1 mt-0.5 text-[11px]">
                          <FormattedMathText text={opt.text} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-notion-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReviewInPreview(previewActiveIdx + 1)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                        previewMarkedForReview.has(previewActiveIdx + 1)
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : 'bg-white border-notion-border text-notion-muted hover:text-notion-text hover:bg-notion-sidebar'
                      }`}
                    >
                      {previewMarkedForReview.has(previewActiveIdx + 1)
                        ? 'Unmark Review'
                        : 'Mark for Review'}
                    </button>
                    <button
                      onClick={() => handleClearPreviewAnswer(previewActiveIdx + 1)}
                      className="text-notion-muted hover:text-notion-text px-2 py-1 text-xs"
                    >
                      Clear Response
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewActiveIdx(Math.max(0, previewActiveIdx - 1))}
                      disabled={previewActiveIdx === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setPreviewActiveIdx(Math.min(questions.length - 1, previewActiveIdx + 1))
                      }
                      disabled={previewActiveIdx === questions.length - 1}
                    >
                      Save & Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Palette Sidebar (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-md bg-white border border-notion-border space-y-3">
              <div className="text-xs font-semibold text-notion-text pb-2 border-b border-notion-border">
                Question Palette ({questions.length})
              </div>

              <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {questions.map((_, i) => {
                  const qNum = i + 1;
                  const isAnswered = Boolean(previewSelectedAnswers[qNum]);
                  const isReview = previewMarkedForReview.has(qNum);
                  const isCurrent = previewActiveIdx === i;

                  let badgeColor = 'bg-notion-sidebar text-notion-muted border-notion-border';
                  if (isReview && isAnswered) {
                    badgeColor = 'bg-purple-600 text-white border-purple-600';
                  } else if (isReview) {
                    badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
                  } else if (isAnswered) {
                    badgeColor = 'bg-emerald-600 text-white border-emerald-600';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setPreviewActiveIdx(i)}
                      className={`h-8 rounded border text-xs font-mono font-medium transition-all flex items-center justify-center ${badgeColor} ${
                        isCurrent ? 'ring-2 ring-notion-text scale-105' : ''
                      }`}
                    >
                      {qNum}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-2.5 border-t border-notion-border text-[11px] space-y-1.5 text-notion-muted font-normal">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-notion-sidebar border border-notion-border" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-purple-600" />
                  <span>Marked for Review</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
