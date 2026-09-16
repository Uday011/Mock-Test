'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Target,
  Key,
  User,
  ShieldCheck,
  Check,
  Sparkles,
  Save,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [activeExam, setActiveExam] = useState('SSC CGL 2026');
  const [targetScore, setTargetScore] = useState('165');
  const [geminiKey, setGeminiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    const savedEx = localStorage.getItem('nalanda_active_exam');
    if (savedEx) setActiveExam(savedEx);

    const savedK = localStorage.getItem('mocktest_gemini_api_key');
    if (savedK) setGeminiKey(savedK);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('nalanda_active_exam', activeExam);
    if (geminiKey.trim()) {
      localStorage.setItem('mocktest_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('mocktest_gemini_api_key');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSwitchRole = async (targetRole: string) => {
    try {
      await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Platform & Account', href: '/settings' },
        { label: 'Account Settings' },
      ]}
    >
      <PageHeader
        title="Account & Academic Preferences"
        description="Manage active target examination benchmarks, pedagogical AI keys, and test persona credentials."
        badge={<Badge variant="saffron" size="md">Preferences</Badge>}
        actions={
          <Button variant="saffron" size="sm" onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Preferences
          </Button>
        }
      />

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Academic preferences and configuration saved successfully.</span>
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {/* Target Exam & Benchmark Goals */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Target className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Target Examination & Score Goals
              </h3>
              <p className="text-xs text-stone-500">Define your primary national examination and target Tier-I marks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Primary Target Exam
              </label>
              <select
                value={activeExam}
                onChange={(e) => setActiveExam(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="SSC CGL 2026">SSC CGL 2026 (Staff Selection Group B/C)</option>
                <option value="NEET UG 2026">NEET UG 2026 (Pre-Medical Entrance)</option>
                <option value="UPSC CSE 2026">UPSC Civil Services Prelims 2026</option>
                <option value="JEE Advanced 2026">JEE Advanced 2026 (Engineering)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Target Score Benchmark (Tier-I)
              </label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                placeholder="e.g. 165"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">General category qualifying cutoff: ~138 / 200</span>
            </div>
          </div>
        </Card>

        {/* AI Pedagogical Intelligence & Gemini Key */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Cognitive AI & Diagnostic Engine
              </h3>
              <p className="text-xs text-stone-500">Power automated question parsing, hint generation, and mistake categorization</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
              Stored locally in your browser. Used for rapid syllabus topic classification and OCR exam paper parsing.
            </p>
          </div>
        </Card>

        {/* Persona Role Switcher */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Persona Role Simulator
              </h3>
              <p className="text-xs text-stone-500">Quickly toggle between testing personas to preview platform dimensions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleSwitchRole('student')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentUser?.role === 'student'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-xs font-bold text-stone-900">Aspirant / Learner</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Full CBT testing, mistake notebook, syllabus progression</p>
            </button>

            <button
              onClick={() => handleSwitchRole('admin')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentUser?.role === 'admin'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-xs font-bold text-stone-900">Educator / Faculty</div>
              <p className="text-[11px] text-stone-500 mt-0.5">Test studio authoring, parser, student cohort analytics</p>
            </button>

            <button
              onClick={() => handleSwitchRole('superadmin')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentUser?.role === 'superadmin'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-xs font-bold text-stone-900">Super Administrator</div>
              <p className="text-[11px] text-stone-500 mt-0.5">System governance, institution directory, global exams</p>
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
