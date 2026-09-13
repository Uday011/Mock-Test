'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer during live exam
  if (pathname.startsWith('/exam/') && !pathname.includes('/result')) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">ExamCraft Platform</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
              Transform any PDF, Word, or text question paper and answer key into an interactive digital exam with customizable timers and intelligent scoring.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Negative Marking</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Server Scoring</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Real-time Timer</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/tests/create" className="hover:text-indigo-600 transition-colors">Create Test</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Supported Formats</h4>
            <p className="text-xs text-slate-500 mb-2">
              Accepts PDF papers, Microsoft Word (.docx), Plain Text (.txt), and tabular answer keys.
            </p>
            <div className="inline-block px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-mono text-slate-600">
              Zero Config SQLite Database
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} ExamCraft. Modern Full-Stack MCQ Mock Test Platform.</p>
          <p>Built for educators, academies, and competitive exam candidates.</p>
        </div>
      </div>
    </footer>
  );
}
