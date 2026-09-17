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
      <div className="bg-white border border-stone-200 rounded-2xl p-3 mb-6 flex items-center justify-between overflow-x-auto gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 1 ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              1
            </span>
            <span>Creation Pathway</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />

          <button
            onClick={() => questions.length > 0 && setCurrentStep(2)}
            disabled={questions.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2
                ? 'bg-stone-900 text-white shadow-2xs'
                : questions.length > 0
                ? 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                : 'bg-stone-50/50 text-stone-400 border border-stone-100 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 2 ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              2
            </span>
            <span>Split-Screen Editor ({questions.length})</span>
            {criticalIssuesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />

          <button
            onClick={() => questions.length > 0 && setCurrentStep(3)}
            disabled={questions.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 3
                ? 'bg-stone-900 text-white shadow-2xs'
                : questions.length > 0
                ? 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                : 'bg-stone-50/50 text-stone-400 border border-stone-100 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 3 ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              3
            </span>
            <span>Test Settings & Publish</span>
          </button>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-stone-600 pr-2">
            <span className="flex items-center gap-1">
              <span className="font-bold text-stone-900 font-mono">{questions.length}</span> questions
            </span>
            {criticalIssuesCount > 0 ? (
              <span className="flex items-center gap-1 text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {criticalIssuesCount} errors
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {/* Pathway 1: Upload Document */}
            <div
              className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                activePathway === 'upload'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
              onClick={() => setActivePathway('upload')}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-3">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Document Upload</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Import PDF, DOCX, TXT, CSV, or spreadsheet mock papers.
              </p>
            </div>

            {/* Pathway 2: Manual Authoring */}
            <div
              className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                activePathway === 'manual'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
              onClick={handleStartManual}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Manual Authoring</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Draft questions from scratch in the split-screen editor.
              </p>
            </div>

            {/* Pathway 3: Question Bank Import */}
            <div
              className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                activePathway === 'qb'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
              onClick={() => {
                setActivePathway('qb');
                handleOpenQbModal();
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Question Bank</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Pick from hundreds of peer-reviewed repository questions.
              </p>
            </div>

            {/* Pathway 4: Duplicate Test */}
            <div
              className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                activePathway === 'duplicate'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
              onClick={() => {
                setActivePathway('duplicate');
                handleOpenDuplicateModal();
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center mb-3">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Duplicate Test</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Clone an existing test to customize questions or schemes.
              </p>
            </div>

            {/* Pathway 5: AI-Assisted Draft */}
            <div
              className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                activePathway === 'ai'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
              onClick={() => {
                setActivePathway('ai');
                setIsAiModalOpen(true);
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900">AI-Assisted Draft</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Generate high-yield questions with proofs on any syllabus topic.
              </p>
            </div>
          </div>

          {/* Active Pathway Details: Document Upload Area */}
          {activePathway === 'upload' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Document Ingestion & Parsing
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
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
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload Box */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Question Paper File (PDF, DOCX, TXT, CSV)
                    </label>
                    <div className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-6 text-center bg-stone-50/60 hover:bg-stone-50 transition-colors">
                      <input
                        type="file"
                        id="paper-file-input"
                        accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
                        onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="paper-file-input" className="cursor-pointer">
                        <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                        <span className="text-xs font-bold text-stone-900 hover:underline">
                          {paperFile ? paperFile.name : 'Click to select question paper file'}
                        </span>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Supports multi-column test layouts, tables, and formula extracts.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Separate Answer Key File (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.csv"
                      onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-stone-200 file:text-xs file:font-bold file:bg-white file:text-stone-800 hover:file:bg-stone-50 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                      <input
                        type="checkbox"
                        checked={useGemini}
                        onChange={(e) => setUseGemini(e.target.checked)}
                        className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span>Enable High-Accuracy Gemini AI OCR & Formula Extraction</span>
                    </label>
                    <p className="text-[11px] text-stone-500 pl-6">
                      Extracts complex mathematical expressions, diagram descriptions, and ambiguous option letters with high precision.
                    </p>
                  </div>
                </div>

                {/* Paste Text Alternative */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Or Paste Question Paper Text
                    </label>
                    <textarea
                      rows={6}
                      value={paperText}
                      onChange={(e) => setPaperText(e.target.value)}
                      placeholder="Paste questions here with options (A, B, C, D) and explanations..."
                      className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Or Paste Answer Key Text (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={keyText}
                      onChange={(e) => setKeyText(e.target.value)}
                      placeholder="e.g. 1. A, 2. B, 3. C, 4. D..."
                      className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Document will be parsed into individual questions and passed to the Quality Control Linter.
                </span>
                <Button
                  variant="primary"
                  onClick={handleUploadAndParse}
                  disabled={uploadLoading}
                  icon={<Sparkles className="w-4 h-4" />}
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
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-700" />
                Quality Control Linter
              </span>
              <span className="text-stone-300">|</span>
              {criticalIssuesCount === 0 && warningIssuesCount === 0 ? (
                <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All {questions.length} questions are verified and ready
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {criticalIssuesCount > 0 && (
                    <span className="text-rose-800 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {criticalIssuesCount} Critical Issue{criticalIssuesCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {warningIssuesCount > 0 && (
                    <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Info className="w-3 h-3 text-amber-600" />
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
                Add from Question Bank
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
                Proceed to Configuration
              </Button>
            </div>
          </div>

          {/* Split-Screen Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Questions Navigator (4 Cols) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-bold">
                <span>Questions List ({questions.length})</span>
                <span>Click to Edit</span>
              </div>

              <div className="space-y-2 max-h-60 sm:max-h-72 lg:max-h-[720px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = idx === activeQuestionIdx;
                  const hasCrit = !q.correct_answer || !q.question_text || (q.options || []).length < 2;
                  const hasWarn = !q.explanation;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all shadow-2xs ${
                        isActive
                          ? 'bg-amber-50/60 border-amber-600 ring-1 ring-amber-500/20 text-stone-900'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-stone-900 font-mono">
                            Key: {q.correct_answer || 'None'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasCrit ? (
                            <span className="text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                              Error
                            </span>
                          ) : hasWarn ? (
                            <span className="text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
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
                            className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
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
                            className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(idx);
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-stone-600 line-clamp-2 leading-relaxed">
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
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-stone-900 text-base">
                        Editing Question #{activeQuestionIdx + 1}
                      </span>
                      <Badge variant="stone">{currentQ.difficulty || 'medium'}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-stone-500 font-mono">
                      <span>Options: {currentQ.options?.length || 0}</span>
                      <span>Key: {currentQ.correct_answer || 'Not Set'}</span>
                    </div>
                  </div>

                  {/* Question Statement Textarea */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-stone-800">
                          Question Statement (Supports $...$ for LaTeX math)
                        </label>
                        <span className="text-[11px] text-stone-500 font-mono">
                          e.g. What is the value of $\int x^2 dx$?
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={currentQ.question_text}
                        onChange={(e) => updateCurrentQuestionText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>

                    {/* Options Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-stone-800">
                          Options & Correct Answer Selection:
                        </label>
                        <button
                          type="button"
                          onClick={addOptionToCurrent}
                          className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Option
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(currentQ.options || []).map((opt, optIdx) => {
                          const isCorrect = currentQ.correct_answer === opt.label;
                          return (
                            <div key={optIdx} className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => updateCurrentCorrectAnswer(opt.label)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-400/40'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
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
                                className={`flex-1 px-3 py-2 rounded-xl border text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                                  isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-300 font-medium'
                                    : 'bg-white border-stone-300 focus:border-stone-900'
                                }`}
                              />

                              {(currentQ.options || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOptionFromCurrent(optIdx)}
                                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-stone-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        Detailed Solution & Pedagogical Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={currentQ.explanation || ''}
                        onChange={(e) => updateCurrentExplanation(e.target.value)}
                        placeholder="Provide step-by-step reasoning, mathematical proofs, or references..."
                        className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>

                    {/* Meta tags & Pedagogical Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={currentQ.difficulty || 'medium'}
                          onChange={(e) => {
                            const next = [...questions];
                            next[activeQuestionIdx].difficulty = e.target.value as any;
                            setQuestions(next);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Student Live Preview Card */}
                <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-500">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Candidate View Simulation
                    </span>
                    <span className="font-mono">
                      Question {activeQuestionIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="text-sm text-stone-900 font-medium mb-3 leading-relaxed">
                    <FormattedMathText text={currentQ.question_text} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(currentQ.options || []).map((opt, i) => {
                      const isCorrect = currentQ.correct_answer === opt.label;
                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl text-xs border flex items-start gap-2 ${
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
                            {opt.label}
                          </span>
                          <div className="flex-1 mt-0.5">
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
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-950 text-xs mt-2">
                      <strong className="block text-stone-900 font-bold mb-0.5">Pedagogical Explanation:</strong>
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
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-700" />
              Test Configuration & Delivery Settings
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Configure exam type, duration, marking scheme, randomization rules, and release policy.
            </p>
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: General Info & Type */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Test Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SSC CGL 2026 Tier-I Full Mock Examination 01"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of syllabus covered, target candidates, or difficulty notes..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Candidate Exam Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Standard test conduct guidelines displayed before candidate starts..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Test Type (12 Types)</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
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
                  <label className="block text-xs font-bold text-stone-800 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Duration Preset</label>
                  <select
                    value={presetDuration}
                    onChange={(e) => {
                      setTimerMode('preset');
                      setPresetDuration(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  >
                    <option value={900}>15 Minutes (Speed Drill)</option>
                    <option value={1800}>30 Minutes (Sectional)</option>
                    <option value={3600}>60 Minutes (Tier-I 100Q)</option>
                    <option value={7200}>120 Minutes (2 Hours)</option>
                    <option value={10800}>180 Minutes (Full Length)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Marking Scheme</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  >
                    <option value="standard">Standard (+4.0 / -1.0)</option>
                    <option value="ssc">SSC CGL (+2.0 / -0.5)</option>
                    <option value="custom">Custom (Question-level)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Correct Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={defaultCorrectMarks}
                    onChange={(e) => setDefaultCorrectMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Negative Penalty</label>
                  <input
                    type="number"
                    step="0.25"
                    value={defaultNegativeMarks}
                    onChange={(e) => setDefaultNegativeMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Result Release</label>
                  <select
                    value={resultAvailability}
                    onChange={(e) => setResultAvailability(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="after_window">After Window</option>
                    <option value="manual">Manual Release</option>
                  </select>
                </div>
              </div>

              {/* Delivery Security Toggles */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Shuffle questions for candidates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Shuffle option orders per question</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={saveToQuestionBank}
                    onChange={(e) => setSaveToQuestionBank(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Save all questions to Nalanda Question Bank repository</span>
                </label>
              </div>

              {/* Visibility & Pricing Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Catalog Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  >
                    <option value="public">Public (Listed in Public Library)</option>
                    <option value="unlisted">Unlisted (Accessible via Direct Link)</option>
                    <option value="shared">Shared (Enrolled Institute Only)</option>
                    <option value="private">Private (Author Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Access & Pricing</label>
                  <select
                    value={isPaid ? 'paid' : 'free'}
                    onChange={(e) => setIsPaid(e.target.value === 'paid')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                  >
                    <option value="free">Free Open Access</option>
                    <option value="paid">Paid Premium Access</option>
                  </select>
                </div>
              </div>

              {isPaid && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-950">Tuition Price (₹ INR)</label>
                    <span className="text-[10px] text-amber-800 font-mono">Platform fee: 15%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-stone-500">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={priceInr}
                      onChange={(e) => setPriceInr(Math.max(1, Number(e.target.value)))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-stone-900 font-bold font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Learners will unlock this test via Nalanda checkout. Payouts accrue to your Educator Ledger.
                  </p>
                </div>
              )}

              {/* Test Series Assignment */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Attach to Test Series</label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
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
                <label className="block text-xs font-bold text-stone-800 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="e.g. Tier-1, TCS Pattern, 2026"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                />
              </div>

              {/* Copyright & Originality Declaration */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={copyrightConfirmed}
                    onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>
                    I confirm that this assessment conforms to Nalanda academic guidelines, contains verified answer keys, and respects intellectual property rights.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="secondary" onClick={() => setCurrentStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Question Editor
            </Button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
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
                className="border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-semibold"
                icon={<ShieldCheck className="w-4 h-4 text-amber-700" />}
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
        <div className="space-y-4 text-xs">
          {aiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              {aiError}
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-800 mb-1">Target Examination</label>
            <select
              value={aiExamId}
              onChange={(e) => setAiExamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900"
            >
              <option value="exam-ssc-cgl-2026">SSC CGL 2026 (Combined Graduate Level)</option>
              <option value="exam-neet-ug-2026">NEET UG 2026 (Medical Entrance)</option>
              <option value="exam-upsc-cse-2026">UPSC CSE Prelims 2026</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">Subject</label>
              <select
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900"
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="General Intelligence & Reasoning">Reasoning</option>
                <option value="English Comprehension">English Comprehension</option>
                <option value="General Awareness">General Awareness</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900"
              >
                <option value="easy">Easy (Foundational)</option>
                <option value="medium">Medium (Standard Exam)</option>
                <option value="hard">Hard (Advanced Proofs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">Syllabus Topic</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. Triangles, Circles & Geometry"
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">Question Count</label>
            <div className="flex items-center gap-3">
              {[5, 10, 15, 20].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setAiCount(cnt)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                    aiCount === cnt
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
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
            <span className="text-xs text-stone-500 font-mono">
              {qbSelectedIds.size} question(s) selected
            </span>
            <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={qbSearch}
                onChange={(e) => setQbSearch(e.target.value)}
                placeholder="Filter by concept, topic, or keyword..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder-stone-400"
              />
            </div>
            <select
              value={qbSubjectFilter}
              onChange={(e) => setQbSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
            >
              <option value="all">All Subjects</option>
              <option value="Quantitative Aptitude">Quantitative</option>
              <option value="General Intelligence & Reasoning">Reasoning</option>
              <option value="English Comprehension">English</option>
              <option value="General Awareness">General Awareness</option>
            </select>
          </div>

          {qbLoading ? (
            <div className="py-8 text-center text-xs text-stone-500">Loading Question Bank...</div>
          ) : (
            <div className="space-y-2 pt-2">
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
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/60 border-amber-600 ring-1 ring-amber-500/20 text-stone-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              isSelected
                                ? 'bg-amber-600 border-amber-600 text-white font-bold'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="font-bold text-stone-900">
                            {q.subject_id || 'General'}
                          </span>
                          {q.topic_id && <span className="text-stone-500">• {q.topic_id}</span>}
                        </div>
                        <Badge variant={q.difficulty === 'hard' ? 'danger' : 'saffron'}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-stone-600">
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
            <div className="py-8 text-center text-xs text-stone-500">Loading tests...</div>
          ) : (
            availableTests.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{t.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
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
            <span className="text-xs text-stone-500">
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
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      Question #{previewActiveIdx + 1}
                    </span>
                    <Badge variant="stone">Single Choice</Badge>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-700 font-bold">
                      +{questions[previewActiveIdx]?.correct_marks || defaultCorrectMarks}
                    </span>
                    <span className="text-rose-700 font-bold">
                      -{questions[previewActiveIdx]?.negative_marks || defaultNegativeMarks}
                    </span>
                  </div>
                </div>

                {/* Statement */}
                <div className="text-sm text-stone-900 font-medium leading-relaxed min-h-[60px]">
                  <FormattedMathText text={questions[previewActiveIdx]?.question_text} />
                </div>

                {/* Interactive Options */}
                <div className="space-y-2 pt-2">
                  {(questions[previewActiveIdx]?.options || []).map((opt, oIdx) => {
                    const isSelected =
                      previewSelectedAnswers[previewActiveIdx + 1] === opt.label;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOptionInPreview(previewActiveIdx + 1, opt.label)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-600 text-stone-900 ring-1 ring-amber-500/20 font-medium'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div className="flex-1 mt-0.5">
                          <FormattedMathText text={opt.text} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReviewInPreview(previewActiveIdx + 1)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        previewMarkedForReview.has(previewActiveIdx + 1)
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {previewMarkedForReview.has(previewActiveIdx + 1)
                        ? 'Unmark Review'
                        : 'Mark for Review'}
                    </button>
                    <button
                      onClick={() => handleClearPreviewAnswer(previewActiveIdx + 1)}
                      className="text-stone-500 hover:text-stone-800 px-2 py-1 font-medium"
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
            <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
              <div className="text-xs font-bold text-stone-800 pb-2 border-b border-stone-100">
                Question Palette ({questions.length})
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((_, i) => {
                  const qNum = i + 1;
                  const isAnswered = Boolean(previewSelectedAnswers[qNum]);
                  const isReview = previewMarkedForReview.has(qNum);
                  const isCurrent = previewActiveIdx === i;

                  let badgeColor = 'bg-stone-100 text-stone-700 border-stone-200';
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
                      className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${badgeColor} ${
                        isCurrent ? 'ring-2 ring-stone-900 scale-105' : ''
                      }`}
                    >
                      {qNum}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-stone-100 text-[11px] space-y-1.5 text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-stone-100 border border-stone-300" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-600" />
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
