'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PenTool,
  Clock,
  Layers,
  Award,
  UploadCloud,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

type TestType = 'custom' | 'sectional' | 'full' | 'pdf';

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

  // Stepper state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Type
  const [selectedType, setSelectedType] = useState<TestType>(
    initialPathway === 'upload' ? 'pdf' : 'custom'
  );

  // Step 2: Subjects
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['DILR']);

  // Step 3: Topics
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([
    'dilr-arr',
    'dilr-tab',
  ]);

  // Step 4: Settings
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
  const [negativeMarking, setNegativeMarking] = useState<boolean>(true);

  // Step 5 / PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState('CAT 2024 Slot 1 Question Paper');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize subjects when type changes
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

  const handleToggleSubject = (sub: string) => {
    if (selectedType === 'sectional') {
      setSelectedSubjects([sub]);
      setSelectedTopicIds(AVAILABLE_TOPICS.filter((t) => t.subject === sub).map((t) => t.id));
      return;
    }
    const next = selectedSubjects.includes(sub)
      ? selectedSubjects.filter((s) => s !== sub)
      : [...selectedSubjects, sub];
    if (next.length > 0) {
      setSelectedSubjects(next);
      setSelectedTopicIds(AVAILABLE_TOPICS.filter((t) => next.includes(t.subject)).map((t) => t.id));
    }
  };

  const handleToggleTopic = (topicId: string) => {
    const next = selectedTopicIds.includes(topicId)
      ? selectedTopicIds.filter((id) => id !== topicId)
      : [...selectedTopicIds, topicId];
    setSelectedTopicIds(next);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedType('custom');
    setSelectedSubjects(['DILR']);
    setSelectedTopicIds(['dilr-arr', 'dilr-tab']);
    setQuestionCount(10);
    setDurationMinutes(30);
    setDifficulty('mixed');
    setNegativeMarking(true);
    setErrorMsg(null);
  };

  // Launch test creation
  const handleLaunchTest = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Fetch relevant questions from question bank
      const qRes = await fetch('/api/question-bank?status=active');
      const qData = await qRes.json();
      let pool = qData.questions || [];

      // Filter by selected subjects
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

      // If pool has items, pick questionCount, otherwise use fallback question IDs
      const pickedQuestions = pool.slice(0, questionCount);
      let questionIds = pickedQuestions.map((q: any) => q.id);

      // If no questions matched, fetch any available questions
      if (questionIds.length === 0 && qData.questions?.length) {
        questionIds = qData.questions.slice(0, questionCount).map((q: any) => q.id);
      }

      // 2. Call /api/question-bank/create-test or fallback directly to /tests
      let testTitle = 'CAT Custom Practice Test';
      if (selectedType === 'sectional') {
        testTitle = `${selectedSubjects[0]} Sectional Test`;
      } else if (selectedType === 'full') {
        testTitle = 'CAT 2026 Full Length Mock Test';
      } else if (selectedType === 'pdf') {
        testTitle = pdfTitle || 'PDF Extracted Test';
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
        // Fallback to testing directory
        router.push('/tests');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not assemble test immediately. Redirecting to test directory...');
      setTimeout(() => router.push('/tests'), 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Subjects' },
    { num: 3, label: 'Topics' },
    { num: 4, label: 'Settings' },
    { num: 5, label: 'Review' },
  ];

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-2xl mx-auto space-y-6 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
              Create Test
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Build a test that fits your goal.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line text-xs font-medium text-ink-muted hover:text-ink hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. 5-STEP HORIZONTAL STEPPER */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-2">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-ink text-canvas shadow-xs'
                        : isCompleted
                        ? 'bg-accent text-white'
                        : 'border border-line text-ink-muted bg-surface'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline transition-colors ${
                      isActive ? 'font-semibold text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 mx-2 h-0.5 rounded transition-colors ${
                      isCompleted ? 'bg-accent' : 'bg-line'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-card bg-coral/10 border border-coral/20 text-coral text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: TYPE */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-3 animate-fade-in">
            {[
              {
                id: 'custom' as TestType,
                title: 'Custom Practice',
                desc: 'Pick specific topics, difficulty, and question count',
                icon: PenTool,
              },
              {
                id: 'sectional' as TestType,
                title: 'Sectional Test',
                desc: 'Timed test for a single section (VARC, DILR, or QA)',
                icon: Layers,
              },
              {
                id: 'full' as TestType,
                title: 'Full Syllabus Test',
                desc: 'Complete mock simulating real CAT exam conditions',
                icon: Award,
              },
              {
                id: 'pdf' as TestType,
                title: 'PDF to Test',
                desc: 'Upload coaching paper or PYQ PDF for instant AI extraction',
                icon: UploadCloud,
              },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectType(option.id)}
                  className={`flex items-center justify-between p-4 rounded-card border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-ink bg-surface shadow-xs'
                      : 'border-line bg-surface hover:border-line/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-ink text-canvas' : 'bg-secondary text-ink-muted'
                      }`}
                    >
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

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      isSelected ? 'bg-ink border-ink text-canvas' : 'border-line'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: SUBJECTS */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-ink-muted">
              {selectedType === 'sectional'
                ? 'Select one section for this timed test:'
                : 'Select the subjects you want to practice:'}
            </p>

            {[
              { id: 'VARC', title: 'VARC', sub: 'Verbal Ability & Reading Comprehension' },
              { id: 'DILR', title: 'DILR', sub: 'Data Interpretation & Logical Reasoning' },
              { id: 'QA', title: 'QA', sub: 'Quantitative Aptitude' },
            ].map((sub) => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => handleToggleSubject(sub.id)}
                  className={`flex items-center justify-between p-4 rounded-card border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-ink bg-surface shadow-xs'
                      : 'border-line bg-surface hover:border-line/80'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-semibold text-ink">{sub.title}</h3>
                    <p className="text-[11px] text-ink-muted mt-0.5">{sub.sub}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-ink border-ink text-canvas' : 'border-line'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: TOPICS */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                Select topics from {selectedSubjects.join(', ')}:
              </p>
              <button
                onClick={() => {
                  const filtered = AVAILABLE_TOPICS.filter((t) =>
                    selectedSubjects.includes(t.subject)
                  );
                  if (selectedTopicIds.length === filtered.length) {
                    setSelectedTopicIds([]);
                  } else {
                    setSelectedTopicIds(filtered.map((t) => t.id));
                  }
                }}
                className="text-[11px] text-accent font-medium hover:underline"
              >
                Toggle All
              </button>
            </div>

            <div className="space-y-2">
              {AVAILABLE_TOPICS.filter((t) => selectedSubjects.includes(t.subject)).map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id);
                return (
                  <div
                    key={topic.id}
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`flex items-center justify-between p-3 rounded-card border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-ink bg-surface shadow-2xs'
                        : 'border-line bg-surface hover:border-line/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-secondary text-ink-muted">
                        {topic.subject}
                      </span>
                      <span className="text-xs font-medium text-ink truncate">
                        {topic.title}
                      </span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                        isSelected ? 'bg-ink border-ink text-canvas' : 'border-line'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: SETTINGS */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink">Question Count</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 text-xs font-medium rounded-control border transition-all ${
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

            {/* Time Limit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink">Time Limit</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 40, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 text-xs font-medium rounded-control border transition-all ${
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

            {/* Marking Scheme */}
            <div className="p-3.5 rounded-card border border-line bg-surface flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-ink">Negative Marking</div>
                <div className="text-[11px] text-ink-muted">+3 for Correct, -1 for Incorrect</div>
              </div>
              <button
                onClick={() => setNegativeMarking(!negativeMarking)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  negativeMarking ? 'bg-ink' : 'bg-line'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-surface absolute top-1 transition-transform ${
                    negativeMarking ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: REVIEW */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            {/* If PDF upload was chosen */}
            {selectedType === 'pdf' ? (
              <div className="p-5 rounded-hero border border-line bg-surface space-y-4">
                <h3 className="text-xs font-semibold text-ink">Upload Exam Paper PDF</h3>
                <div className="border-2 border-dashed border-line hover:border-ink rounded-card p-6 text-center space-y-2 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-ink-muted mx-auto" />
                  <div className="text-xs font-medium text-ink">
                    {pdfFile ? pdfFile.name : 'Drag and drop your PDF here or click to browse'}
                  </div>
                  <p className="text-[10px] text-ink-muted">
                    Supports previous years papers, coaching handouts, mock PDFs
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                    }}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-block mt-2 px-3 py-1.5 rounded-full bg-secondary text-ink text-xs font-medium cursor-pointer hover:bg-line"
                  >
                    Select PDF File
                  </label>
                </div>
              </div>
            ) : null}

            {/* Test Summary Card */}
            <div className="p-4 rounded-card border border-line bg-surface space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Configuration Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-control bg-secondary/40">
                  <span className="text-ink-muted block text-[10px]">Test Type</span>
                  <span className="font-semibold text-ink capitalize">{selectedType}</span>
                </div>
                <div className="p-2.5 rounded-control bg-secondary/40">
                  <span className="text-ink-muted block text-[10px]">Subjects</span>
                  <span className="font-semibold text-ink">{selectedSubjects.join(', ')}</span>
                </div>
                <div className="p-2.5 rounded-control bg-secondary/40">
                  <span className="text-ink-muted block text-[10px]">Questions</span>
                  <span className="font-semibold text-ink">{questionCount} Questions</span>
                </div>
                <div className="p-2.5 rounded-control bg-secondary/40">
                  <span className="text-ink-muted block text-[10px]">Time Limit</span>
                  <span className="font-semibold text-ink">{durationMinutes} Minutes</span>
                </div>
              </div>

              <div className="text-[11px] text-ink-muted pt-1">
                Selected {selectedTopicIds.length} topic focus areas. Questions will be drawn from vetted CAT repositories.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pt-4 border-t border-line">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-xs font-medium text-ink hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleLaunchTest}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Assembling Test...' : 'Start Test →'}</span>
            </button>
          )}
        </div>
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
