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
  const [activeExam, setActiveExam] = useState('CAT 2026');
  const [targetScore, setTargetScore] = useState('105');
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
        <div className="p-5 bg-white rounded-md border border-[#E6E6E3] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E6E3]">
            <div className="w-6 h-6 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#202124]">
                Target Examination & Score Goals
              </h3>
              <p className="text-[11px] text-[#787774]">Define your primary national examination and target Tier-I marks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1">
                Primary Target Exam
              </label>
              <select
                value={activeExam}
                onChange={(e) => setActiveExam(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#E6E6E3] rounded-[4px] focus:outline-none focus:border-[#202124] bg-[#fcfbf9] text-[#202124]"
              >
                <option value="CAT 2026">CAT 2026 (Common Admission Test - IIMs)</option>
                <option value="XAT 2026">XAT 2026 (Xavier Aptitude Test - XLRI)</option>
                <option value="NMAT 2026">NMAT by GMAC 2026 (NMIMS & Leading B-Schools)</option>
                <option value="SNAP 2026">SNAP 2026 (Symbiosis National Aptitude)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1">
                Target Score Benchmark (CAT)
              </label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#E6E6E3] rounded-[4px] focus:outline-none focus:border-[#202124] bg-[#fcfbf9] text-[#202124]"
                placeholder="e.g. 105"
              />
              <span className="text-[10px] text-[#787774] mt-1 block">IIM 99th percentile cutoff benchmark: ~90-105 / 198</span>
            </div>
          </div>
        </div>

        {/* AI Pedagogical Intelligence & Gemini Key */}
        <div className="p-5 bg-white rounded-md border border-[#E6E6E3] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E6E3]">
            <div className="w-6 h-6 rounded-[3px] bg-[#FFFBEB] text-[#4d3800] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#202124]">
                Cognitive AI & Diagnostic Engine
              </h3>
              <p className="text-[11px] text-[#787774]">Power automated question parsing, hint generation, and mistake categorization</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#E6E6E3] rounded-[4px] focus:outline-none focus:border-[#202124] bg-[#fcfbf9] text-[#202124]"
            />
            <p className="text-[11px] text-[#787774] mt-1 leading-relaxed">
              Stored locally in your browser. Used for rapid syllabus topic classification and OCR exam paper parsing.
            </p>
          </div>
        </div>

        {/* Active Candidate Profile */}
        <div className="p-5 bg-white rounded-md border border-[#E6E6E3] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E6E3]">
            <div className="w-6 h-6 rounded-[3px] bg-[#F1F1EF] text-[#202124] flex items-center justify-center border border-[#E6E6E3]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#202124]">
                Candidate Preparation Profile
              </h3>
              <p className="text-[11px] text-[#787774]">Your active preparation tier and diagnostic engine privileges</p>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-[#E6E6E3] bg-[#FCFBF9] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#202124]">{currentUser?.name || 'CAT Aspirant'}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] rounded">
                  Active Candidate
                </span>
              </div>
              <p className="text-[11px] text-[#787774] mt-0.5">
                Target: {activeExam} • Full CBT Mocks, Mistake Notebook & AI Analytics Activated
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-[#202124] hover:underline"
            >
              Go to Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
