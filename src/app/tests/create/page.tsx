'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<TestType>(
    initialPathway === 'upload' ? 'pdf' : 'custom'
  );
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

  const handleLaunchTest = async () => {
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
    { num: 2, label: 'Subjects' },
    { num: 3, label: 'Topics' },
    { num: 4, label: 'Settings' },
    { num: 5, label: 'Review' },
  ];

  return (
    <AppShell activeExamTitle="CAT 2026">
      <div className="max-w-xl mx-auto space-y-6 pb-20 select-none">
        
        {/* ========================================================= */}
        {/* 1. HEADER (Back arrow, Create Test, Reset button) */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between pt-1">
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                if (currentStep > 1) setCurrentStep(currentStep - 1);
                else router.push('/dashboard');
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
                Build a test that fits your goal.
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
        {/* 2. 5-STEP HORIZONTAL STEPPER WITH CONNECTORS & LABELS */}
        {/* ========================================================= */}
        <div className="pt-2 pb-2">
          <div className="flex items-center justify-between max-w-sm mx-auto relative px-2">
            {steps.map((step, idx) => {
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

            {/* Stepper background connecting line */}
            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-[#EAE8E3] dark:bg-zinc-800 z-0" />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-card bg-coral/10 border border-coral/20 text-coral text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: TYPE ("What do you want to create?") */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-3.5 animate-fade-in">
            <h2 className="text-xs font-semibold text-ink px-0.5">
              What do you want to create?
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: 'custom' as TestType,
                  title: 'Custom Practice',
                  desc: 'Mix topics, set timer, your way',
                  icon: Sliders,
                },
                {
                  id: 'sectional' as TestType,
                  title: 'Sectional Test',
                  desc: 'Practice a full section',
                  icon: Compass,
                },
                {
                  id: 'full' as TestType,
                  title: 'Full Syllabus Test',
                  desc: 'Simulate CAT environment',
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
                        ? 'border-[#18181B] dark:border-white bg-surface shadow-xs'
                        : 'border-line bg-surface hover:border-line/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#EAE8E3] dark:bg-zinc-800 text-ink flex items-center justify-center shrink-0">
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

        {/* ========================================================= */}
        {/* STEP 2: SUBJECTS */}
        {/* ========================================================= */}
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
                      ? 'border-[#18181B] dark:border-white bg-surface shadow-xs'
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

        {/* ========================================================= */}
        {/* STEP 3: TOPICS */}
        {/* ========================================================= */}
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
                        ? 'border-[#18181B] dark:border-white bg-surface shadow-2xs'
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

        {/* ========================================================= */}
        {/* STEP 4: SETTINGS */}
        {/* ========================================================= */}
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

        {/* ========================================================= */}
        {/* STEP 5: REVIEW */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl border border-line bg-surface space-y-3 shadow-2xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Summary
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

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR (Wide black pill Next -> button) */}
        {/* ========================================================= */}
        <div className="pt-4">
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
              onClick={handleLaunchTest}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-ink/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
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
