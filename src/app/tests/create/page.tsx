'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Sliders,
  Clock,
  Layers,
  HelpCircle,
  FileCheck,
  Zap,
  Save,
  BookmarkCheck,
  Play,
  Crown,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { ExtractedQuestion, QuestionOption, UserRole } from '@/lib/types';
import { LintResult } from '@/lib/parser/linter';

export default function CreateTestPage() {
  const router = useRouter();

  // Wizard step: 1 = Upload, 2 = Review & Correct, 3 = Test Configuration
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Upload state
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [paperText, setPaperText] = useState('');
  const [keyText, setKeyText] = useState('');
  const [useGemini, setUseGemini] = useState(true);
  const [extractionMethod, setExtractionMethod] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Step 2: Extracted & Parsed state
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [linter, setLinter] = useState<LintResult | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Step 3: Test Configuration state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Science & General');
  const [timerMode, setTimerMode] = useState<'preset' | 'custom' | 'none'>('preset');
  const [presetDuration, setPresetDuration] = useState<number>(1800); // 30 mins
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [customSeconds, setCustomSeconds] = useState<number>(0);

  const [markingSchemeType, setMarkingSchemeType] = useState<'standard' | 'custom'>('standard');
  const [defaultCorrectMarks, setDefaultCorrectMarks] = useState<number>(4.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState<number>(1.0);
  const [defaultUnansweredMarks, setDefaultUnansweredMarks] = useState<number>(0.0);

  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [allowReviewMarking, setAllowReviewMarking] = useState(true);
  const [showImmediateResults, setShowImmediateResults] = useState(true);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole } | null>(null);
  const [savingAction, setSavingAction] = useState<'start' | 'save_later' | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const role = currentUser?.role || 'student';

  // Sample data loader for instant 1-click test
  const handleLoadSampleData = () => {
    const samplePaper = `Question 1. What is the fundamental unit of electric current in the International System of Units (SI)?
A. Volt
B. Ampere
C. Ohm
D. Watt
Explanation: The SI unit of electric current is the Ampere (A).

Question 2. In organic chemistry, which functional group characterizes alcohols?
A. -COOH
B. -CHO
C. -OH
D. -NH2
Explanation: The hydroxyl group (-OH) is the characteristic functional group of alcohols.

Question 3. What is the velocity of light in a vacuum approximately?
A. 3 × 10^8 m/s
B. 3 × 10^6 m/s
C. 1.5 × 10^8 m/s
D. 3 × 10^10 m/s
Explanation: Light travels at approximately 299,792,458 m/s (~3 × 10^8 m/s) in vacuum.

Question 4. Which organ in the human body is responsible for filtering blood and producing urine?
A. Liver
B. Kidney
C. Spleen
D. Pancreas
Explanation: The kidneys filter waste products such as urea and excess water from blood to produce urine.

Question 5. In computer science, what is the worst-case time complexity of standard Binary Search on a sorted array of N elements?
A. O(1)
B. O(N)
C. O(log N)
D. O(N log N)
Explanation: Binary Search halves the search space at each step, yielding O(log N) worst-case time complexity.

Question 6. Newton's First Law of Motion is also widely known as:
A. Law of Inertia
B. Law of Acceleration
C. Law of Gravitation
D. Law of Momentum Conservation
Explanation: Newton's First Law defines inertia: an object remains in its state of rest or motion unless acted upon.`;

    const sampleKey = `1. B
2. C
3. A
4. B
5. C
6. A`;

    setPaperText(samplePaper);
    setKeyText(sampleKey);
    setTitle('General Science & Fundamentals Mock Exam');
    setSubject('Science & Computing');
  };

  const handleUploadAndParse = async () => {
    setUploadError('');

    const hasPaper = paperFile || paperText.trim();
    if (!hasPaper) {
      setUploadError('Please upload a Question Paper file or paste question paper text.');
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
      if (savedGeminiKey) {
        formData.append('geminiApiKey', savedGeminiKey);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse documents');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions could be extracted. Please check the document format.');
      }

      setQuestions(data.questions);
      setLinter(data.linter);
      setExtractionMethod(data.extractionMethod || 'heuristic');
      if (!title) {
        const fallbackName = paperFile ? paperFile.name.replace(/\.[^/.]+$/, '') : 'MCQ Practice Mock Exam';
        setTitle(fallbackName);
      }
      setCurrentStep(2); // Proceed to Review & Correct
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Step 2 Question Mutators
  const updateQuestionText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].question_text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const updateCorrectAnswer = (qIdx: number, label: string) => {
    const updated = [...questions];
    updated[qIdx].correct_answer = label;
    setQuestions(updated);
  };

  const updateQuestionMarks = (qIdx: number, correct: number, negative: number) => {
    const updated = [...questions];
    updated[qIdx].correct_marks = correct;
    updated[qIdx].negative_marks = negative;
    setQuestions(updated);
  };

  const updateExplanation = (qIdx: number, exp: string) => {
    const updated = [...questions];
    updated[qIdx].explanation = exp;
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    const opts = updated[qIdx].options;
    const nextCharCode = 65 + opts.length; // 65 = 'A'
    const label = String.fromCharCode(nextCharCode);
    opts.push({ label, text: '' });
    setQuestions(updated);
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.splice(optIdx, 1);
    setQuestions(updated);
  };

  const addNewQuestion = () => {
    const newQNum = questions.length + 1;
    const newQ: ExtractedQuestion = {
      question_number: newQNum,
      question_text: `New Question ${newQNum}`,
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correct_answer: 'A',
      confidence: 1.0,
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIdx(questions.length);
  };

  const deleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('At least one question is required.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      question_number: i + 1,
    }));
    setQuestions(updated);
    if (activeQuestionIdx >= updated.length) {
      setActiveQuestionIdx(updated.length - 1);
    }
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === questions.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-index question numbers
    const reindexed = updated.map((q, i) => ({ ...q, question_number: i + 1 }));
    setQuestions(reindexed);
    setActiveQuestionIdx(targetIdx);
  };

  // Step 3: Save / Publish Test
  const handleSaveTest = async (action: 'start' | 'save_later') => {
    setSaveError('');
    if (!title.trim()) {
      setSaveError('Please provide a title for the test.');
      return;
    }

    let calculatedDuration = 0;
    if (timerMode === 'preset') {
      calculatedDuration = presetDuration;
    } else if (timerMode === 'custom') {
      calculatedDuration = customHours * 3600 + customMinutes * 60 + customSeconds;
    }

    setSavingAction(action);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        duration_seconds: calculatedDuration,
        marking_scheme_type: markingSchemeType,
        default_correct_marks: Number(defaultCorrectMarks),
        default_negative_marks: Number(defaultNegativeMarks),
        default_unanswered_marks: Number(defaultUnansweredMarks),
        shuffle_questions: shuffleQuestions,
        shuffle_options: shuffleOptions,
        allow_navigation: allowNavigation,
        show_palette: showPalette,
        allow_review_marking: allowReviewMarking,
        show_immediate_results: showImmediateResults,
        questions,
      };

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save test');
      }

      if (action === 'start') {
        router.push(`/tests/${data.testId}/start`);
      } else {
        // Save and attempt later / return to respective dashboard
        if (role === 'superadmin') {
          router.push('/dashboard/superadmin?saved=true');
        } else if (role === 'admin') {
          router.push('/dashboard/admin?saved=true');
        } else {
          router.push('/dashboard?saved=true');
        }
      }
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSavingAction(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Wizard Steps Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto no-scrollbar py-1 gap-2">
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              currentStep === 1 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? 'bg-slate-900 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="text-xs sm:text-sm">1. Upload Files</span>
          </div>

          <div className="w-4 sm:w-16 h-0.5 bg-slate-200 shrink-0" />

          <div
            onClick={() => questions.length > 0 && setCurrentStep(2)}
            className={`flex items-center gap-2 shrink-0 ${
              questions.length > 0 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
            } transition-colors ${
              currentStep === 2 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? 'bg-slate-900 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className="text-xs sm:text-sm">2. Review & Correct</span>
          </div>

          <div className="w-4 sm:w-16 h-0.5 bg-slate-200 shrink-0" />

          <div
            onClick={() => questions.length > 0 && setCurrentStep(3)}
            className={`flex items-center gap-2 shrink-0 ${
              questions.length > 0 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
            } transition-colors ${
              currentStep === 3 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              3
            </div>
            <span className="text-xs sm:text-sm">3. Exam Settings</span>
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILES */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Upload Mock Paper & Answer Key</h2>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: PDF, Microsoft Word (.docx), and Plain Text (.txt)
              </p>
            </div>
            <button
              onClick={handleLoadSampleData}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 self-start sm:self-auto"
            >
              <Zap className="w-4 h-4 text-blue-600" />
              Load Pre-Filled Sample Paper
            </button>
          </div>

          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Box 1: Question Paper */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Question Paper File
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">Required</span>
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="paper-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="paper-upload" className="cursor-pointer block min-h-[44px]">
                  <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-blue-600 hover:underline block">
                    {paperFile ? paperFile.name : 'Click to select Question Paper'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {paperFile ? `${(paperFile.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, or TXT'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Or paste question paper text directly:
                </label>
                <textarea
                  rows={6}
                  value={paperText}
                  onChange={(e) => setPaperText(e.target.value)}
                  placeholder="Question 1. What is the capital of France?&#10;A. Berlin&#10;B. Madrid&#10;C. Paris&#10;D. Rome"
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Box 2: Answer Key */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  2. Answer Key / Sheet
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">Required</span>
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="key-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="key-upload" className="cursor-pointer block min-h-[44px]">
                  <UploadCloud className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-emerald-600 hover:underline block">
                    {keyFile ? keyFile.name : 'Click to select Answer Key'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {keyFile ? `${(keyFile.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, or TXT'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Or paste answer key text directly:
                </label>
                <textarea
                  rows={6}
                  value={keyText}
                  onChange={(e) => setKeyText(e.target.value)}
                  placeholder="1. C&#10;2. A&#10;3. D&#10;4. B"
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Gemini AI PDF & Paper Parser Toggle Card */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/60 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    AI-Powered PDF & Exam Parser (Gemini 3.6 Flash)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    High Accuracy
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Processes multi-column PDFs, accurately detects full question lengths (including background passages, numbered statements & diagrams), and extracts clean options.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={useGemini}
                onChange={(e) => setUseGemini(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUploadAndParse}
              disabled={uploadLoading}
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              {uploadLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Extracting Questions...
                </>
              ) : (
                <>
                  Parse & Review Questions
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & CORRECTION SCREEN */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Review & Correct Parsed Questions</h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify parsed questions and correct answers before publishing. Never publish unverified questions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={addNewQuestion}
                className="px-4 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                Add Question
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                Configure Exam Settings
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Linter Alerts Summary */}
          {linter && (
            <div
              className={`p-4 rounded-2xl border ${
                linter.errors.length > 0
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : linter.warnings.length > 0
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Extraction Health: {linter.overallConfidence}% Confidence ({questions.length} Questions Extracted)
                </span>
                {extractionMethod === 'gemini-ai' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white flex items-center gap-1 self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Parsed by Gemini 3.6 Flash AI • Full Context Preserved
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto">
                    Parsed by Enhanced Heuristic Regex Engine
                  </span>
                )}
              </div>
              {linter.errors.length > 0 && (
                <ul className="text-xs space-y-1 font-medium list-disc list-inside text-rose-800">
                  {linter.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              )}
              {linter.warnings.length > 0 && (
                <ul className="text-xs space-y-1 font-medium list-disc list-inside text-amber-800 mt-1">
                  {linter.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Question Navigator Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Select Question to Edit:</span>
              <span className="font-mono text-slate-900">
                Editing Question {activeQuestionIdx + 1} of {questions.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isSelected = activeQuestionIdx === idx;
                const hasWarning = !q.correct_answer || !q.options || q.options.length < 2;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-400'
                        : hasWarning
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {hasWarning && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Editor Card */}
          {questions[activeQuestionIdx] && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-900 font-bold text-sm rounded-lg border border-slate-200">
                    Question #{questions[activeQuestionIdx].question_number}
                  </span>
                  {(!questions[activeQuestionIdx].correct_answer ||
                    questions[activeQuestionIdx].options.length < 2) && (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Needs Attention
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => moveQuestion(activeQuestionIdx, 'up')}
                    disabled={activeQuestionIdx === 0}
                    title="Move Up"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveQuestion(activeQuestionIdx, 'down')}
                    disabled={activeQuestionIdx === questions.length - 1}
                    title="Move Down"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(activeQuestionIdx)}
                    title="Delete Question"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={questions[activeQuestionIdx].question_text}
                  onChange={(e) => updateQuestionText(activeQuestionIdx, e.target.value)}
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
                />
              </div>

              {/* Options Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Answer Options & Correct Answer</label>
                  <button
                    type="button"
                    onClick={() => addOption(activeQuestionIdx)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 min-h-[36px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                </div>

                <div className="space-y-2.5">
                  {questions[activeQuestionIdx].options.map((opt, optIdx) => {
                    const isCorrect = questions[activeQuestionIdx].correct_answer === opt.label;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {/* Radio select for correct answer */}
                        <label className="flex items-center gap-2 cursor-pointer min-h-[40px]">
                          <input
                            type="radio"
                            name={`correct-${activeQuestionIdx}`}
                            checked={isCorrect}
                            onChange={() => updateCorrectAnswer(activeQuestionIdx, opt.label)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.label}
                          </span>
                        </label>

                        {/* Option Text */}
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(activeQuestionIdx, optIdx, e.target.value)}
                          placeholder={`Option ${opt.label} text...`}
                          className="flex-1 px-3 py-2 min-h-[40px] border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() => removeOption(activeQuestionIdx, optIdx)}
                          className="text-slate-400 hover:text-rose-600 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Question Marks Override & Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Marks</label>
                  <input
                    type="number"
                    step="0.25"
                    value={questions[activeQuestionIdx].correct_marks ?? 4}
                    onChange={(e) =>
                      updateQuestionMarks(
                        activeQuestionIdx,
                        parseFloat(e.target.value) || 4,
                        questions[activeQuestionIdx].negative_marks ?? 1
                      )
                    }
                    className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.25"
                    value={questions[activeQuestionIdx].negative_marks ?? 1}
                    onChange={(e) =>
                      updateQuestionMarks(
                        activeQuestionIdx,
                        questions[activeQuestionIdx].correct_marks ?? 4,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Explanation / Solution (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={questions[activeQuestionIdx].explanation || ''}
                    onChange={(e) => updateExplanation(activeQuestionIdx, e.target.value)}
                    placeholder="Provide detailed explanation to help students understand the answer..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Prev / Next Question Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))}
                  disabled={activeQuestionIdx === 0}
                  className="px-4 py-2.5 min-h-[40px] border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  &larr; Previous Question
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveQuestionIdx(Math.min(questions.length - 1, activeQuestionIdx + 1))
                  }
                  disabled={activeQuestionIdx === questions.length - 1}
                  className="px-4 py-2.5 min-h-[40px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  Next Question &rarr;
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 min-h-[44px] border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Upload
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              Proceed to Exam Settings & Save
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EXAM SETTINGS */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Configure Exam Settings</h2>
            <p className="text-xs text-slate-500">
              Customize test title, duration, global or per-question marking schemes, and exam behaviors
            </p>

            {/* Role Context Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-3">
              <div className="flex items-center gap-2">
                {role === 'superadmin' ? (
                  <>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200 shrink-0">
                      <Crown className="w-3.5 h-3.5 text-blue-600" /> Platform Super Administrator
                    </span>
                    <span className="text-slate-600">You can save this test directly to the platform library, or test-run the exam engine.</span>
                  </>
                ) : role === 'admin' ? (
                  <>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Institute Administrator
                    </span>
                    <span className="text-slate-600">You can save this test directly for your enrolled students, or test-run the exam engine.</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Student Practice Mode
                    </span>
                    <span className="text-slate-600">You can start this exam right now, or save it to your dashboard to practice later.</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Box 1: Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Basic Test Information
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Entrance Examination Mock 2026"
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Category</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics, Biology, General Knowledge"
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional guidelines or syllabus covered..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Box 2: Timer Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Exam Timer Configuration
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTimerMode('preset')}
                  className={`py-2.5 min-h-[40px] text-xs font-bold rounded-xl border transition-all ${
                    timerMode === 'preset'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setTimerMode('custom')}
                  className={`py-2.5 min-h-[40px] text-xs font-bold rounded-xl border transition-all ${
                    timerMode === 'custom'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Custom Time
                </button>
                <button
                  type="button"
                  onClick={() => setTimerMode('none')}
                  className={`py-2.5 min-h-[40px] text-xs font-bold rounded-xl border transition-all ${
                    timerMode === 'none'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  No Limit
                </button>
              </div>

              {timerMode === 'preset' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { label: '30 Minutes', sec: 1800 },
                    { label: '60 Minutes', sec: 3600 },
                    { label: '90 Minutes', sec: 5400 },
                    { label: '180 Minutes (3h)', sec: 10800 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => setPresetDuration(preset.sec)}
                      className={`p-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                        presetDuration === preset.sec
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {timerMode === 'custom' && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hours</label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={customHours}
                      onChange={(e) => setCustomHours(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-lg text-sm text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Minutes</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-lg text-sm text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seconds</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-lg text-sm text-center font-bold"
                    />
                  </div>
                </div>
              )}

              {timerMode === 'none' && (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                  Candidates can practice without a countdown timer. The exam will record total elapsed time upon submission.
                </p>
              )}
            </div>

            {/* Box 3: Marking Scheme */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Marking Scheme
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarkingSchemeType('standard')}
                  className={`py-2.5 min-h-[40px] text-xs font-bold rounded-xl border transition-all ${
                    markingSchemeType === 'standard'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Standard Global
                </button>
                <button
                  type="button"
                  onClick={() => setMarkingSchemeType('custom')}
                  className={`py-2.5 min-h-[40px] text-xs font-bold rounded-xl border transition-all ${
                    markingSchemeType === 'custom'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Custom Per Question
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 mb-1">Correct (+)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={defaultCorrectMarks}
                    onChange={(e) => setDefaultCorrectMarks(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-xl text-sm font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-700 mb-1">Incorrect (-)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={defaultNegativeMarks}
                    onChange={(e) => setDefaultNegativeMarks(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-xl text-sm font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Unanswered (0)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={defaultUnansweredMarks}
                    onChange={(e) => setDefaultUnansweredMarks(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 min-h-[40px] border border-slate-300 rounded-xl text-sm font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Box 4: Exam Behaviors */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                Exam Behaviors & Display
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[36px]">
                  <span>Shuffle Questions</span>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[36px]">
                  <span>Shuffle Options</span>
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[36px]">
                  <span>Show 5-State Question Palette</span>
                  <input
                    type="checkbox"
                    checked={showPalette}
                    onChange={(e) => setShowPalette(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[36px]">
                  <span>Allow Marking Questions for Review</span>
                  <input
                    type="checkbox"
                    checked={allowReviewMarking}
                    onChange={(e) => setAllowReviewMarking(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[36px]">
                  <span>Show Results Immediately on Submission</span>
                  <input
                    type="checkbox"
                    checked={showImmediateResults}
                    onChange={(e) => setShowImmediateResults(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 min-h-[44px] border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Review Questions
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Role-tailored Actions */}
              {role === 'superadmin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveTest('start')}
                    disabled={Boolean(savingAction)}
                    className="px-5 py-3 min-h-[48px] bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'start' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                        Preparing Exam...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-blue-600" />
                        Save & Test-Run Exam
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveTest('save_later')}
                    disabled={Boolean(savingAction)}
                    className="px-7 py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'save_later' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to Platform...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-emerald-400" />
                        Save Test (Publish to Platform)
                      </>
                    )}
                  </button>
                </>
              ) : role === 'admin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveTest('start')}
                    disabled={Boolean(savingAction)}
                    className="px-5 py-3 min-h-[48px] bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'start' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                        Preparing Exam...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-amber-600" />
                        Save & Test-Run Exam
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveTest('save_later')}
                    disabled={Boolean(savingAction)}
                    className="px-7 py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'save_later' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing to Institute...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-emerald-400" />
                        Save Test (Publish for Students)
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Student Role: Save & Attempt Later vs Start Mock Exam Now */
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveTest('save_later')}
                    disabled={Boolean(savingAction)}
                    className="px-5 py-3 min-h-[48px] bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'save_later' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                        Saving to Dashboard...
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-blue-600" />
                        Save & Attempt Later
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveTest('start')}
                    disabled={Boolean(savingAction)}
                    className="px-7 py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {savingAction === 'start' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Launching Exam...
                      </>
                    ) : (
                      <>
                        Start Mock Exam Now
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
