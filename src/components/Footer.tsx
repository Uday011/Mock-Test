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
              An integrated, editorial learning and testing workspace connecting structured syllabus paths, computer-based diagnostic mock tests, learner readiness metrics, and educator publishing.
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
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Platform Dimensions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="text-[#787774] hover:text-[#202124] transition-colors">Personal Learning & Mocks</Link></li>
              <li><Link href="/learn" className="text-[#787774] hover:text-[#202124] transition-colors">Exam Syllabus Tree</Link></li>
              <li><Link href="/library" className="text-[#787774] hover:text-[#202124] transition-colors">Public Assessment Library</Link></li>
              <li><Link href="/tests/create" className="text-[#787774] hover:text-[#202124] transition-colors">Test Studio & Parser</Link></li>
              <li><Link href="/dashboard/educator" className="text-[#787774] hover:text-[#202124] transition-colors">Educator Publishing Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Curated Target Exams</h4>
            <ul className="space-y-2 text-xs text-[#787774]">
              <li>SSC CGL 2026 (Tier I & II)</li>
              <li>Banking & Insurance (IBPS PO)</li>
              <li>UPSC Civil Services Prelims</li>
              <li>Railways RRB (NTPC & Group D)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider mb-3">Architectural Foundation</h4>
            <p className="text-xs mb-2.5 leading-relaxed text-[#787774]">
              Built on Next.js 15, React 19, Tailwind CSS, and embedded SQLite with zero-latency CBT execution.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[11px] font-mono bg-[#f1f1ef] text-[#202124] border border-[#E6E6E3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20]" /> Nalanda Workspace v2.4
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E6E6E3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9b9a97] gap-2">
          <p>© {new Date().getFullYear()} Nalanda. Open, structured, and accessible academic learning.</p>
          <p>Designed for serious learners, academic institutions, and independent educators.</p>
        </div>
      </div>
    </footer>
  );
}
