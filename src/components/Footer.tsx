'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, ShieldCheck, Compass, GraduationCap, BookOpen, Layers } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer during live exam and inside workspace
  const isWorkspace =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/mistakes') ||
    pathname.startsWith('/performance') ||
    pathname.startsWith('/question-bank') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/tests') ||
    pathname.startsWith('/exams') ||
    pathname.startsWith('/series') ||
    pathname.startsWith('/creators') ||
    pathname.startsWith('/exam');

  if (isWorkspace) {
    return null;
  }

  return (
    <footer className="border-t border-[#E6E6E3] bg-[#F7F7F5] text-[#787774] mt-16 sm:mt-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo size="md" className="mb-3" />
            <p className="text-xs sm:text-sm max-w-sm mb-4 leading-relaxed text-[#787774]">
              A high-performance personal exam preparation engine designed for CAT and MBA aspirants to study systematically, master sectional speed, and maximize percentile scores.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#202124]">
                <CheckCircle className="w-3.5 h-3.5 text-[#1B5E20]" /> Syllabus-Aligned Paths
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#202124]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4F46A5]" /> CBT Testing Engine
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#202124]">
                <Compass className="w-3.5 h-3.5 text-[#B7791F]" /> AI Diagnostic Coaching
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Prep Engine Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="text-[#787774] hover:text-[#202124] transition-colors">Candidate Dashboard</Link></li>
              <li><Link href="/learn" className="text-[#787774] hover:text-[#202124] transition-colors">CAT Syllabus Tree</Link></li>
              <li><Link href="/library" className="text-[#787774] hover:text-[#202124] transition-colors">Mock Test Series</Link></li>
              <li><Link href="/dashboard/mistakes" className="text-[#787774] hover:text-[#202124] transition-colors">Mistake Diagnostic Notebook</Link></li>
              <li><Link href="/dashboard/analytics" className="text-[#787774] hover:text-[#202124] transition-colors">Percentile Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Curated MBA Entrance Exams</h4>
            <ul className="space-y-2 text-xs text-[#787774]">
              <li>CAT 2026 (IIMs Common Admission Test)</li>
              <li>XAT 2026 (XLRI Aptitude Test)</li>
              <li>NMAT 2026 by GMAC</li>
              <li>SNAP 2026 (Symbiosis National Aptitude Test)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Engine Architecture</h4>
            <p className="text-xs mb-2.5 leading-relaxed text-[#787774]">
              Zero-latency CBT testing simulator with real-time sectional timer enforcement and percentile calculation.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[11px] font-mono bg-[#f1f1ef] text-[#202124] border border-[#E6E6E3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20]" /> ExamCraft Prep Engine v2.4
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E6E6E3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9b9a97] gap-2">
          <p>© {new Date().getFullYear()} ExamCraft. Personal exam preparation engine for MBA aspirants.</p>
          <p>Engineered for serious CAT aspirants targeting 99+ percentile.</p>
        </div>
      </div>
    </footer>
  );
}
