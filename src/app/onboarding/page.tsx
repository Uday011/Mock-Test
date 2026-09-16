'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  BookOpen,
  Award,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  SkipForward,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [exams, setExams] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('exam-ssc-cgl-2026');
  const [preparationStage, setPreparationStage] = useState<'beginner' | 'intermediate' | 'revision_mocks'>('intermediate');
  const [targetTimeline, setTargetTimeline] = useState<'2026_tier1' | '3_months' | '6_months' | '12_months'>('2026_tier1');
  const [dailyHours, setDailyHours] = useState(4.0);
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/onboarding')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) setExams(data.exams);
        if (data.subjects) setAllSubjects(data.subjects);
        if (data.profile) {
          if (data.profile.preferred_exam_id) setSelectedExamId(data.profile.preferred_exam_id);
          if (data.profile.preparation_stage) setPreparationStage(data.profile.preparation_stage);
          if (data.profile.target_timeline) setTargetTimeline(data.profile.target_timeline);
          if (data.profile.daily_study_hours) setDailyHours(data.profile.daily_study_hours);
          try {
            if (data.profile.strong_subjects_json) setStrongSubjects(JSON.parse(data.profile.strong_subjects_json));
            if (data.profile.weak_subjects_json) setWeakSubjects(JSON.parse(data.profile.weak_subjects_json));
          } catch {}
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Filter subjects for the selected exam
  const currentExamSubjects = allSubjects.filter((s) => s.exam_id === selectedExamId);

  const toggleStrongSubject = (subjectName: string) => {
    if (strongSubjects.includes(subjectName)) {
      setStrongSubjects(strongSubjects.filter((s) => s !== subjectName));
    } else {
      setStrongSubjects([...strongSubjects, subjectName]);
      // Remove from weak if present
      setWeakSubjects(weakSubjects.filter((s) => s !== subjectName));
    }
  };

  const toggleWeakSubject = (subjectName: string) => {
    if (weakSubjects.includes(subjectName)) {
      setWeakSubjects(weakSubjects.filter((s) => s !== subjectName));
    } else {
      setWeakSubjects([...weakSubjects, subjectName]);
      // Remove from strong if present
      setStrongSubjects(strongSubjects.filter((s) => s !== subjectName));
    }
  };

  const handleSaveAndProceed = async (finishNow: boolean = false, startDiagnostic: boolean = false) => {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_exam_id: selectedExamId,
          preparation_stage: preparationStage,
          target_timeline: targetTimeline,
          daily_study_hours: dailyHours,
          strong_subjects: strongSubjects,
          weak_subjects: weakSubjects,
          diagnostic_test_status: startDiagnostic ? 'pending' : 'completed',
        }),
      });

      // Also sync active exam in localStorage
      const matched = exams.find((e) => e.id === selectedExamId);
      if (matched) {
        localStorage.setItem('nalanda_active_exam', matched.title);
      }

      if (startDiagnostic) {
        router.push('/tests');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500">Preparing Academic Onboarding...</p>
      </div>
    );
  }

  const stepTitles = [
    'Target Examination',
    'Preparation Stage',
    'Timeline & Study Availability',
    'Subject Calibration',
    'Diagnostic Assessment',
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col text-stone-900">
      {/* Top Onboarding Header */}
      <header className="px-6 py-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-xs flex items-center justify-between sticky top-0 z-20">
        <Logo size="sm" href="/" />

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-stone-500 hidden sm:inline">
            Step {currentStep} of 5: <strong>{stepTitles[currentStep - 1]}</strong>
          </span>
          <button
            onClick={() => handleSaveAndProceed(true, false)}
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip for now</span>
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-stone-100 h-1">
        <div
          className="bg-amber-600 h-1 transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Main Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-between">
        <div className="space-y-6">
          {/* STEP 1: PREFERRED EXAM */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="saffron" size="sm">Step 1 of 5</Badge>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Select Your Primary Examination
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Choose the master examination framework you are targeting. You can switch or add secondary targets later in Settings.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {exams.map((ex) => {
                  const isSelected = selectedExamId === ex.id;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExamId(ex.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                            {ex.code}
                          </span>
                          {ex.conducting_body && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              {ex.conducting_body}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900">
                          {ex.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2">
                          {ex.description}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PREPARATION STAGE */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="saffron" size="sm">Step 2 of 5</Badge>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Where are you in your preparation?
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  This calibrates whether your learning path prioritizes concept mastery or high-speed diagnostic mock testing.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'beginner',
                    title: 'Beginner / Starting Fresh',
                    sub: 'Beginning syllabus coverage, establishing fundamental arithmetic & grammatical principles.',
                    badge: 'Foundation Focus',
                  },
                  {
                    id: 'intermediate',
                    title: 'Intermediate / Active Learner',
                    sub: 'Covered essential topics, actively working on question cadence, accuracy, and section pacing.',
                    badge: 'Recommended',
                  },
                  {
                    id: 'revision_mocks',
                    title: 'Advanced / Sprint & Revision',
                    sub: 'Completed major syllabus, focusing on full-length CBE mocks, mistake forensics, and cutoff clearance.',
                    badge: 'Mock Sprints',
                  },
                ].map((st) => {
                  const isSelected = preparationStage === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setPreparationStage(st.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-serif font-bold text-stone-900">
                            {st.title}
                          </h3>
                          <Badge variant={isSelected ? 'saffron' : 'stone'} size="sm">
                            {st.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-stone-600">
                          {st.sub}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: TIMELINE & DAILY AVAILABILITY */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="saffron" size="sm">Step 3 of 5</Badge>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Timeline & Daily Commitment
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  We schedule your unit modules and spaced revision cycles based on your weekly study bandwidth.
                </p>
              </div>

              {/* Timeline Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Target Exam Attempt
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: '2026_tier1', label: '2026 Tier-I', sub: 'Target Sprint' },
                    { id: '3_months', label: 'Next 3 Months', sub: 'Rapid Sprint' },
                    { id: '6_months', label: '6 Months', sub: 'Standard Cadence' },
                    { id: '12_months', label: '12 Months', sub: 'Comprehensive' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetTimeline(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetTimeline === t.id
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 font-bold'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="text-xs font-semibold text-stone-900">{t.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Hours Commitment */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Daily Study Availability
                  </label>
                  <span className="font-mono text-sm font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                    {dailyHours} Hours / Day
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[2.0, 4.0, 6.0].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyHours(hrs)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        dailyHours === hrs
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-600'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-sm font-mono font-bold">{hrs} Hours</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {hrs === 2.0 ? '~14h/week' : hrs === 4.0 ? '~28h/week' : '~42h/week'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUBJECT CALIBRATION */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="saffron" size="sm">Step 4 of 5</Badge>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Calibrate Strengths & Weak Areas
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Identify subjects you feel confident in and areas needing urgent remedial drills.
                </p>
              </div>

              {/* Strong Subjects */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  Strong Areas <span className="text-stone-400 font-normal">(Tap to highlight strengths)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentExamSubjects.map((s) => {
                    const isSelected = strongSubjects.includes(s.name);
                    return (
                      <button
                        key={`strong-${s.id}`}
                        type="button"
                        onClick={() => toggleStrongSubject(s.name)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weak Subjects */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  Areas Requiring Focus <span className="text-stone-400 font-normal">(Tap to assign remedial drills)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentExamSubjects.map((s) => {
                    const isSelected = weakSubjects.includes(s.name);
                    return (
                      <button
                        key={`weak-${s.id}`}
                        type="button"
                        onClick={() => toggleWeakSubject(s.name)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-2xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: OPTIONAL DIAGNOSTIC TEST */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="emerald" size="sm">Final Step</Badge>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Ready to Benchmark Your Readiness?
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  You can attempt a rapid 10-minute diagnostic drill now to seed your accuracy baselines, or go straight to your personalized dashboard.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div
                  onClick={() => handleSaveAndProceed(false, true)}
                  className="p-5 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-400 cursor-pointer transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] uppercase font-bold text-amber-800 font-mono">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> Recommended
                    </span>
                    <Badge variant="saffron" size="sm">10 Minutes</Badge>
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Take 10-Min Diagnostic Drill
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    8 authentic questions across Quant, Reasoning, English, and General Awareness. Calibrates your initial predicted score and identifies weak areas immediately.
                  </p>
                </div>

                <div
                  onClick={() => handleSaveAndProceed(false, false)}
                  className="p-5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">Standard Setup</span>
                    <Badge variant="stone" size="sm">Direct Entry</Badge>
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Proceed Directly to Dashboard
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Explore your customized 60-Day syllabus roadmap, topic notes, and mock tests without taking an immediate test.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-8 border-t border-stone-200 flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={saving}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              variant="saffron"
              size="md"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              disabled={saving}
              onClick={() => handleSaveAndProceed(false, false)}
            >
              {saving ? 'Finalizing Profile...' : 'Complete & Enter Workspace'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
