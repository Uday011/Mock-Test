'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Compass,
  FileSpreadsheet,
  Sliders,
  Sparkles,
  UploadCloud,
  AlertCircle,
  FileText,
  FileUp,
  Clock,
  Layers,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

type TestType = 'custom' | 'sectional' | 'full';
type CreationPathway = 'pdf' | 'custom';

interface TopicOption {
  id: string;
  title: string;
  subject: string;
  count: number;
}

const AVAILABLE_TOPICS: TopicOption[] = [
  // VARC
  { id: 'varc-rc', title: 'Reading Comprehension (Passages & Inferences)', subject: 'VARC', count: 40 },
  { id: 'varc-pj', title: 'Para Jumbles & Sentence Sequence', subject: 'VARC', count: 25 },
  { id: 'varc-ps', title: 'Paragraph Summary & Context', subject: 'VARC', count: 20 },
  { id: 'varc-oso', title: 'Odd Sentence Out', subject: 'VARC', count: 18 },

  // DILR
  { id: 'dilr-arr', title: 'Arrangements (Linear, Matrix & Circular)', subject: 'DILR', count: 35 },
  { id: 'dilr-bin', title: 'Binary Logic & Truth Tellers', subject: 'DILR', count: 20 },
  { id: 'dilr-tab', title: 'Tables & Missing Data Interpretation', subject: 'DILR', count: 30 },
  { id: 'dilr-games', title: 'Games & Tournaments', subject: 'DILR', count: 22 },
  { id: 'dilr-venn', title: 'Venn Diagrams & Set Relations', subject: 'DILR', count: 18 },

  // QA
  { id: 'qa-arith', title: 'Arithmetic (Percentages, Profit & Loss, TSD)', subject: 'QA', count: 55 },
  { id: 'qa-alg', title: 'Algebra (Equations, Polynomials & Functions)', subject: 'QA', count: 40 },
  { id: 'qa-geo', title: 'Geometry & Mensuration', subject: 'QA', count: 30 },
  { id: 'qa-num', title: 'Number Systems & Divisibility', subject: 'QA', count: 28 },
];

function CreateTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPathway = searchParams.get('pathway');

  // Primary pathway selection: 'pdf' (Dedicated default) vs 'custom' (manual builder)
  const [creationPathway, setCreationPathway] = useState<CreationPathway>(
    initialPathway === 'builder' ? 'custom' : 'pdf'
  );

  // =========================================================================
  // PDF TO MOCK STATE
  // =========================================================================
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [pdfTestTitle, setPdfTestTitle] = useState('CAT 2026 Converted Mock');
  const [pdfDuration, setPdfDuration] = useState(120);
  const [pdfMarkingScheme, setPdfMarkingScheme] = useState<'cat' | 'standard'>('cat');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [isLaunchingPdfTest, setIsLaunchingPdfTest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // CUSTOM TOPIC TEST BUILDER STATE (Manual 5-step wizard)
  // =========================================================================
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<TestType>('custom');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['DILR']);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(['dilr-arr', 'dilr-tab']);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
  const [negativeMarking, setNegativeMarking] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectType = (type: TestType) => {
    setSelectedType(type);
    if (type === 'full') {
      setSelectedSubjects(['VARC', 'DILR', 'QA']);
      setSelectedTopicIds(AVAILABLE_TOPICS.map((t) => t.id));
      setQuestionCount(66);
      setDurationMinutes(120);
    } else if (type === 'sectional') {
      setSelectedSubjects(['DILR']);
      setSelectedTopicIds(AVAILABLE_TOPICS.filter((t) => t.subject === 'DILR').map((t) => t.id));
      setQuestionCount(20);
      setDurationMinutes(40);
    } else {
      setSelectedSubjects(['DILR']);
      setSelectedTopicIds(['dilr-arr', 'dilr-tab']);
      setQuestionCount(10);
      setDurationMinutes(30);
    }
  };

  const handleReset = () => {
    if (creationPathway === 'pdf') {
      setPdfFile(null);
      setKeyFile(null);
      setPdfTestTitle('CAT 2026 Converted Mock');
      setPdfDuration(120);
      setExtractedQuestions([]);
      setUploadError(null);
    } else {
      setCurrentStep(1);
      setSelectedType('custom');
      setSelectedSubjects(['DILR']);
      setSelectedTopicIds(['dilr-arr', 'dilr-tab']);
      setQuestionCount(10);
      setDurationMinutes(30);
      setDifficulty('mixed');
      setNegativeMarking(true);
      setErrorMsg(null);
    }
  };

  // PDF Extraction Handler
  const handlePdfUploadAndExtract = async () => {
    if (!pdfFile) {
      setUploadError('Please select a PDF or document file to convert.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('paperFile', pdfFile);
      if (keyFile) {
        formData.append('keyFile', keyFile);
      }
      formData.append('useGemini', 'true');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Failed to extract questions from the document.');
      }

      setExtractedQuestions(uploadData.questions || []);
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      setUploadError(err.message || 'Failed to extract questions. Please ensure the document has readable text.');
    } finally {
      setIsUploading(false);
    }
  };

  // Launch Extracted PDF Mock
  const handleLaunchExtractedMock = async () => {
    if (extractedQuestions.length === 0) return;

    setIsLaunchingPdfTest(true);
    setUploadError(null);

    try {
      const formattedQuestions = extractedQuestions.map((q, idx) => ({
        id: `extracted-${Date.now()}-${idx + 1}`,
        question_number: idx + 1,
        text: q.text || `Question ${idx + 1}`,
        subject: 'General',
        question_type: 'single_choice',
        options: q.options || [
          { label: 'A', text: 'Option A' },
          { label: 'B', text: 'Option B' },
          { label: 'C', text: 'Option C' },
          { label: 'D', text: 'Option D' },
        ],
        correct_option: q.correct_option || 'A',
        explanation: q.explanation || '',
        marks: pdfMarkingScheme === 'cat' ? 3.0 : 4.0,
        negative_marks: 1.0,
      }));

      const createRes = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pdfTestTitle || 'Converted Mock Test',
          description: `Generated from ${pdfFile?.name || 'uploaded PDF'} with ${formattedQuestions.length} questions.`,
          duration_seconds: pdfDuration * 60,
          test_type: 'full_mock',
          marking_scheme_type: pdfMarkingScheme === 'cat' ? 'cat' : 'standard',
          default_correct_marks: pdfMarkingScheme === 'cat' ? 3.0 : 4.0,
          default_negative_marks: 1.0,
          status: 'published',
          questions: formattedQuestions,
        }),
      });

      const createData = await createRes.json();
      if (createData.test?.id) {
        router.push(`/tests/${createData.test.id}/start`);
      } else {
        router.push('/tests');
      }
    } catch (err: any) {
      console.error('Failed to create test:', err);
      setUploadError(err.message || 'Failed to launch mock test');
    } finally {
      setIsLaunchingPdfTest(false);
    }
  };

  // Launch Custom Manual Test
  const handleLaunchCustomTest = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const qRes = await fetch('/api/question-bank?status=active');
      const qData = await qRes.json();
      let pool = qData.questions || [];

      if (pool.length > 0) {
        pool = pool.filter((q: any) =>
          selectedSubjects.some(
            (s) =>
              q.subject_name?.toUpperCase().includes(s) ||
              q.subject_code?.toUpperCase().includes(s) ||
              q.subject_id?.toUpperCase().includes(s)
          )
        );
      }

      const pickedQuestions = pool.slice(0, questionCount);
      let questionIds = pickedQuestions.map((q: any) => q.id);

      if (questionIds.length === 0 && qData.questions?.length) {
        questionIds = qData.questions.slice(0, questionCount).map((q: any) => q.id);
      }

      let testTitle = 'Custom Practice Test';
      if (selectedType === 'sectional') {
        testTitle = `${selectedSubjects[0]} Sectional Test`;
      } else if (selectedType === 'full') {
        testTitle = 'CAT 2026 Full Length Mock Test';
      }

      const createRes = await fetch('/api/question-bank/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_ids: questionIds.length > 0 ? questionIds : ['seed-q-1'],
          title: testTitle,
          description: `Practice test focusing on ${selectedSubjects.join(', ')}.`,
          duration_seconds: durationMinutes * 60,
          test_type: selectedType === 'full' ? 'full_mock' : selectedType === 'sectional' ? 'sectional_test' : 'custom_test',
        }),
      });

      const createData = await createRes.json();
      if (createData.success && createData.test_id) {
        router.push(`/tests/${createData.test_id}/start`);
      } else {
        router.push('/tests');
      }
    } catch (err: any) {
      console.error(err);
      router.push('/tests');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Sections' },
    { num: 3, label: 'Topics' },
    { num: 4, label: 'Settings' },
    { num: 5, label: 'Review' },
  ];

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-2xl mx-auto space-y-6 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER (Back arrow, Create Test, Reset button) */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between pt-1">
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                if (creationPathway === 'custom' && currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  router.push('/dashboard');
                }
              }}
              className="w-9 h-9 rounded-full border border-line bg-surface hover:bg-secondary flex items-center justify-center text-ink-muted hover:text-ink transition-colors shadow-2xs mt-0.5"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-ink tracking-tight">
                Create Test
              </h1>
              <p className="text-xs text-ink-muted mt-0.5">
                Convert a question paper PDF to an interactive mock, or build a custom topic session.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-1.5 rounded-full border border-line text-xs font-medium text-ink bg-surface hover:bg-secondary transition-colors shadow-2xs"
          >
            Reset
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. CREATION PATHWAY SELECTOR (PDF to Mock vs Custom Topic) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-secondary/60 rounded-hero border border-line">
          <button
            onClick={() => setCreationPathway('pdf')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-card text-xs font-semibold transition-all ${
              creationPathway === 'pdf'
                ? 'bg-surface text-ink shadow-xs border border-line/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <FileUp className="w-4 h-4 text-accent" />
            <span>PDF to Mock</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-accent/10 text-accent rounded">
              Dedicated
            </span>
          </button>

          <button
            onClick={() => setCreationPathway('custom')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-card text-xs font-semibold transition-all ${
              creationPathway === 'custom'
                ? 'bg-surface text-ink shadow-xs border border-line/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sliders className="w-4 h-4 text-ink-muted" />
            <span>Custom Topic Builder</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* PATHWAY 1: DEDICATED PDF TO MOCK CONVERSION (FIRST PRIORITY)     */}
        {/* ================================================================= */}
        {creationPathway === 'pdf' && (
          <div className="space-y-5 animate-fade-in">
            {uploadError && (
              <div className="p-3.5 rounded-card bg-coral/10 border border-coral/20 text-coral text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {extractedQuestions.length === 0 ? (
              <div className="space-y-4">
                {/* Upload Drag & Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-hero border-2 border-dashed cursor-pointer text-center transition-all ${
                    pdfFile
                      ? 'border-accent bg-accent/5'
                      : 'border-line hover:border-ink/60 bg-surface hover:bg-secondary/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setPdfFile(file);
                        const cleanName = file.name.replace(/\.[^/.]+$/, '');
                        setPdfTestTitle(cleanName);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  {pdfFile ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink">
                        <FileText className="w-4 h-4 text-accent" />
                        <span>{pdfFile.name}</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                        }}
                        className="text-[11px] text-coral font-medium hover:underline pt-1 block mx-auto"
                      >
                        Change Document
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-ink">
                        Upload Question Paper or Mock PDF
                      </h3>
                      <p className="text-xs text-ink-muted max-w-sm mx-auto">
                        Drag and drop your PDF here, or click to browse. AI extracts questions, MCQs, and answer keys automatically.
                      </p>
                      <span className="inline-block text-[10px] text-ink-muted font-mono pt-1">
                        Supports PDF, Word (.docx), and Text files up to 25MB
                      </span>
                    </div>
                  )}
                </div>

                {/* Optional Answer Key Uploader */}
                <div className="p-4 rounded-card border border-line bg-surface space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-xs font-semibold text-ink">
                        Separate Answer Key (Optional)
                      </span>
                    </div>
                    {keyFile && (
                      <button
                        onClick={() => setKeyFile(null)}
                        className="text-[11px] text-coral hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={keyInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setKeyFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    onClick={() => keyInputRef.current?.click()}
                    className="p-3 rounded-btn border border-line hover:border-ink/40 bg-secondary/30 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="text-ink-muted truncate">
                      {keyFile ? keyFile.name : 'Click to attach separate answer key PDF or text file'}
                    </span>
                    <span className="text-[11px] font-medium text-accent shrink-0 ml-2">
                      {keyFile ? 'Attached' : 'Browse'}
                    </span>
                  </div>
                </div>

                {/* Test Configuration */}
                <div className="p-4 rounded-card border border-line bg-surface space-y-4">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Test Settings
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink">Test Title</label>
                    <input
                      type="text"
                      value={pdfTestTitle}
                      onChange={(e) => setPdfTestTitle(e.target.value)}
                      placeholder="e.g. CAT 2024 Slot 1 Mock"
                      className="w-full px-3.5 py-2.5 rounded-btn border border-line bg-surface text-xs font-medium text-ink focus:outline-none focus:border-ink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink">Time Limit</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 40, 60, 120].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setPdfDuration(mins)}
                          className={`py-2 text-xs font-medium rounded-full border transition-all ${
                            pdfDuration === mins
                              ? 'bg-ink text-canvas border-ink font-semibold'
                              : 'bg-surface text-ink border-line hover:bg-secondary'
                          }`}
                        >
                          {mins} mins
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink">Marking Scheme</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPdfMarkingScheme('cat')}
                        className={`py-2 px-3 text-xs font-medium rounded-btn border text-left transition-all ${
                          pdfMarkingScheme === 'cat'
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-line bg-surface text-ink hover:bg-secondary'
                        }`}
                      >
                        <div className="font-bold">CAT Official (+3 / -1)</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">3 marks correct, -1 incorrect</div>
                      </button>

                      <button
                        onClick={() => setPdfMarkingScheme('standard')}
                        className={`py-2 px-3 text-xs font-medium rounded-btn border text-left transition-all ${
                          pdfMarkingScheme === 'standard'
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-line bg-surface text-ink hover:bg-secondary'
                        }`}
                      >
                        <div className="font-bold">Standard (+4 / -1)</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">4 marks correct, -1 incorrect</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  onClick={handlePdfUploadAndExtract}
                  disabled={!pdfFile || isUploading}
                  className="w-full py-3.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Questions via AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Convert PDF to Live Mock Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Extraction Success & Launch Review */
              <div className="space-y-4">
                <div className="p-4 rounded-card bg-accent/10 border border-accent/30 text-xs text-accent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold text-sm">
                      {extractedQuestions.length} Questions Extracted Successfully!
                    </span>
                  </div>
                  <button
                    onClick={() => setExtractedQuestions([])}
                    className="text-[11px] underline hover:text-accent font-medium"
                  >
                    Re-upload
                  </button>
                </div>

                {/* Preview Extracted Questions List */}
                <div className="p-4 rounded-card border border-line bg-surface space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                      Extracted Paper Preview
                    </h3>
                    <span className="text-[11px] font-mono text-ink-muted">
                      {extractedQuestions.length} questions • {pdfDuration} mins
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {extractedQuestions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="p-3 rounded-btn border border-line bg-secondary/30 text-xs space-y-1">
                        <div className="font-semibold text-ink">
                          Q{idx + 1}. {q.text?.slice(0, 100)}...
                        </div>
                        <div className="text-[11px] text-ink-muted flex items-center gap-3">
                          <span>{q.options?.length || 4} options</span>
                          <span>•</span>
                          <span className="text-accent font-medium">
                            Correct: {q.correct_option || 'Auto-checked'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {extractedQuestions.length > 5 && (
                      <p className="text-[11px] text-center text-ink-muted italic pt-1">
                        + {extractedQuestions.length - 5} more questions ready in mock environment
                      </p>
                    )}
                  </div>
                </div>

                {/* Launch Mock Test Button */}
                <button
                  onClick={handleLaunchExtractedMock}
                  disabled={isLaunchingPdfTest}
                  className="w-full py-3.5 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isLaunchingPdfTest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching Live Test...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Start Converted Mock Test Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PATHWAY 2: CUSTOM TOPIC TEST BUILDER (MANUAL 5-STEP WIZARD)      */}
        {/* ================================================================= */}
        {creationPathway === 'custom' && (
          <div className="space-y-5 animate-fade-in">
            {/* 5-Step Stepper */}
            <div className="pt-2 pb-2">
              <div className="flex items-center justify-between max-w-sm mx-auto relative px-2">
                {steps.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = currentStep > step.num;

                  return (
                    <div key={step.num} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-ink text-canvas shadow-xs'
                            : isCompleted
                            ? 'bg-ink text-canvas'
                            : 'bg-[#EAE8E3] dark:bg-zinc-800 text-ink-muted'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 transition-colors ${
                          isActive ? 'font-semibold text-ink' : 'text-ink-muted'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}

                {/* Stepper background line */}
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-[#EAE8E3] dark:bg-zinc-800 z-0" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-card bg-coral/10 border border-coral/20 text-coral text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: TYPE */}
            {currentStep === 1 && (
              <div className="space-y-3.5 animate-fade-in">
                <h2 className="text-xs font-semibold text-ink px-0.5">
                  What do you want to create?
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      id: 'custom' as TestType,
                      title: 'Custom Topic Practice',
                      desc: 'Mix specific topics, set timer, practice your way',
                      icon: Sliders,
                    },
                    {
                      id: 'sectional' as TestType,
                      title: 'Sectional Test',
                      desc: 'Practice a full section (VARC, DILR, or QA)',
                      icon: Compass,
                    },
                    {
                      id: 'full' as TestType,
                      title: 'Full Syllabus Mock',
                      desc: 'Simulate full CAT examination environment',
                      icon: FileSpreadsheet,
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedType === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleSelectType(option.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-ink bg-surface shadow-xs'
                            : 'border-line bg-surface hover:border-line/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-secondary text-ink flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-ink">
                              {option.title}
                            </h3>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              {option.desc}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-ink text-canvas flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-line shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: SECTIONS */}
            {currentStep === 2 && (
              <div className="space-y-3 animate-fade-in">
                <h2 className="text-xs font-semibold text-ink px-0.5">
                  Select target sections
                </h2>
                {[
                  { id: 'VARC', title: 'VARC', sub: 'Verbal Ability & Reading Comprehension' },
                  { id: 'DILR', title: 'DILR', sub: 'Data Interpretation & Logical Reasoning' },
                  { id: 'QA', title: 'QA', sub: 'Quantitative Aptitude' },
                ].map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        if (selectedType === 'sectional') {
                          setSelectedSubjects([sub.id]);
                        } else {
                          const next = isSelected
                            ? selectedSubjects.filter((s) => s !== sub.id)
                            : [...selectedSubjects, sub.id];
                          if (next.length > 0) setSelectedSubjects(next);
                        }
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-ink bg-surface shadow-xs'
                          : 'border-line bg-surface hover:border-line/80'
                      }`}
                    >
                      <div>
                        <h3 className="text-xs font-semibold text-ink">{sub.title}</h3>
                        <p className="text-[11px] text-ink-muted mt-0.5">{sub.sub}</p>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-ink text-canvas flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-line shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 3: TOPICS */}
            {currentStep === 3 && (
              <div className="space-y-3 animate-fade-in">
                <h2 className="text-xs font-semibold text-ink px-0.5">
                  Select focus topics
                </h2>
                <div className="space-y-2">
                  {AVAILABLE_TOPICS.filter((t) => selectedSubjects.includes(t.subject)).map((topic) => {
                    const isSelected = selectedTopicIds.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => {
                          const next = isSelected
                            ? selectedTopicIds.filter((id) => id !== topic.id)
                            : [...selectedTopicIds, topic.id];
                          setSelectedTopicIds(next);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-card border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-ink bg-surface shadow-2xs'
                            : 'border-line bg-surface hover:border-line/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-ink">
                            {topic.subject}
                          </span>
                          <span className="text-xs font-medium text-ink truncate">
                            {topic.title}
                          </span>
                        </div>

                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-ink text-canvas flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-line shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: SETTINGS */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink">Question Count</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 30].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`py-2 text-xs font-medium rounded-full border transition-all ${
                          questionCount === count
                            ? 'bg-ink text-canvas border-ink font-semibold'
                            : 'bg-surface text-ink border-line hover:bg-secondary'
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink">Time Limit</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 40, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDurationMinutes(mins)}
                        className={`py-2 text-xs font-medium rounded-full border transition-all ${
                          durationMinutes === mins
                            ? 'bg-ink text-canvas border-ink font-semibold'
                            : 'bg-surface text-ink border-line hover:bg-secondary'
                        }`}
                      >
                        {mins} mins
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl border border-line bg-surface space-y-3 shadow-2xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Test Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-secondary">
                      <span className="text-ink-muted block text-[10px]">Test Type</span>
                      <span className="font-semibold text-ink capitalize">{selectedType}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary">
                      <span className="text-ink-muted block text-[10px]">Sections</span>
                      <span className="font-semibold text-ink">{selectedSubjects.join(', ')}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary">
                      <span className="text-ink-muted block text-[10px]">Questions</span>
                      <span className="font-semibold text-ink">{questionCount} Questions</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary">
                      <span className="text-ink-muted block text-[10px]">Duration</span>
                      <span className="font-semibold text-ink">{durationMinutes} Mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Next/Submit Action Button */}
            <div className="pt-2">
              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="w-full py-3.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleLaunchCustomTest}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Assembling Test...' : 'Start Test →'}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default function CreateTestPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-ink-muted font-mono">
            Loading test builder...
          </div>
        </AppShell>
      }
    >
      <CreateTestContent />
    </Suspense>
  );
}
