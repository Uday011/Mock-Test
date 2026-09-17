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
        badge={<Badge variant="stone" size="sm">Preferences</Badge>}
        actions={
          <Button variant="primary" size="sm" onClick={handleSaveSettings}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Preferences
          </Button>
        }
      />

      {savedSuccess && (
        <div className="mb-5 p-3.5 bg-[#edf6f9] border border-[#cbe4eb] rounded-md text-xs text-[#1e6074] flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Academic preferences and configuration saved successfully.</span>
        </div>
      )}

      <div className="space-y-5 max-w-4xl">
        {/* Target Exam & Benchmark Goals */}
        <div className="p-5 bg-white rounded-md border border-[#ebebeb] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ebebeb]">
            <div className="w-6 h-6 rounded-[3px] bg-[#fbf3db] text-[#4d3800] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#37352f]">
                Target Examination & Score Goals
              </h3>
              <p className="text-[11px] text-[#787774]">Define your primary national examination and target Tier-I marks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#37352f] mb-1">
                Primary Target Exam
              </label>
              <select
                value={activeExam}
                onChange={(e) => setActiveExam(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#ebebeb] rounded-[4px] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] text-[#37352f]"
              >
                <option value="SSC CGL 2026">SSC CGL 2026 (Staff Selection Group B/C)</option>
                <option value="NEET UG 2026">NEET UG 2026 (Pre-Medical Entrance)</option>
                <option value="UPSC CSE 2026">UPSC Civil Services Prelims 2026</option>
                <option value="JEE Advanced 2026">JEE Advanced 2026 (Engineering)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#37352f] mb-1">
                Target Score Benchmark (Tier-I)
              </label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#ebebeb] rounded-[4px] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] text-[#37352f]"
                placeholder="e.g. 165"
              />
              <span className="text-[10px] text-[#787774] mt-1 block">General category qualifying cutoff: ~138 / 200</span>
            </div>
          </div>
        </div>

        {/* AI Pedagogical Intelligence & Gemini Key */}
        <div className="p-5 bg-white rounded-md border border-[#ebebeb] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ebebeb]">
            <div className="w-6 h-6 rounded-[3px] bg-[#fbf3db] text-[#4d3800] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#37352f]">
                Cognitive AI & Diagnostic Engine
              </h3>
              <p className="text-[11px] text-[#787774]">Power automated question parsing, hint generation, and mistake categorization</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#ebebeb] rounded-[4px] focus:outline-none focus:border-[#37352f] bg-[#fcfbf9] text-[#37352f]"
            />
            <p className="text-[11px] text-[#787774] mt-1 leading-relaxed">
              Stored locally in your browser. Used for rapid syllabus topic classification and OCR exam paper parsing.
            </p>
          </div>
        </div>

        {/* Persona Role Switcher */}
        <div className="p-5 bg-white rounded-md border border-[#ebebeb] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ebebeb]">
            <div className="w-6 h-6 rounded-[3px] bg-[#f7f6f3] text-[#37352f] flex items-center justify-center border border-[#ebebeb]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#37352f]">
                Persona Role Simulator
              </h3>
              <p className="text-[11px] text-[#787774]">Quickly toggle between testing personas to preview platform dimensions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleSwitchRole('student')}
              className={`p-3.5 rounded-md border text-left transition-colors ${
                currentUser?.role === 'student'
                  ? 'border-[#37352f] bg-[#f7f6f3] ring-1 ring-[#37352f]'
                  : 'border-[#ebebeb] hover:bg-[#fcfbf9]'
              }`}
            >
              <div className="text-xs font-semibold text-[#37352f]">Aspirant / Learner</div>
              <p className="text-[11px] text-[#787774] mt-0.5">Full CBT testing, mistake notebook, syllabus progression</p>
            </button>

            <button
              onClick={() => handleSwitchRole('admin')}
              className={`p-3.5 rounded-md border text-left transition-colors ${
                currentUser?.role === 'admin'
                  ? 'border-[#37352f] bg-[#f7f6f3] ring-1 ring-[#37352f]'
                  : 'border-[#ebebeb] hover:bg-[#fcfbf9]'
              }`}
            >
              <div className="text-xs font-semibold text-[#37352f]">Educator / Faculty</div>
              <p className="text-[11px] text-[#787774] mt-0.5">Test studio authoring, parser, student cohort analytics</p>
            </button>

            <button
              onClick={() => handleSwitchRole('superadmin')}
              className={`p-3.5 rounded-md border text-left transition-colors ${
                currentUser?.role === 'superadmin'
                  ? 'border-[#37352f] bg-[#f7f6f3] ring-1 ring-[#37352f]'
                  : 'border-[#ebebeb] hover:bg-[#fcfbf9]'
              }`}
            >
              <div className="text-xs font-semibold text-[#37352f]">Super Administrator</div>
              <p className="text-[11px] text-[#787774] mt-0.5">System governance, institution directory, global exams</p>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
