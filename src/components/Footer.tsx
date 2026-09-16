'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, ShieldCheck, Compass, GraduationCap, BookOpen, Layers } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer during live exam and inside workspace
  if (
    (pathname.startsWith('/exam/') && !pathname.includes('/result')) ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/mistakes') ||
    pathname.startsWith('/performance') ||
    pathname.startsWith('/question-bank') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/exams/')
  ) {
    return null;
  }

  const isHome = pathname === '/';

  return (
    <footer className={isHome ? 'border-t border-white/10 bg-[#111113] text-stone-400' : 'border-t border-stone-200 bg-white text-slate-600 mt-16 sm:mt-24'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo size="md" className="mb-3" />
            <p className={`text-xs sm:text-sm max-w-sm mb-4 leading-relaxed ${isHome ? 'text-stone-400' : 'text-slate-500'}`}>
              An integrated, editorial learning and testing ecosystem connecting structured syllabus paths, computer-based diagnostic mock tests, learner readiness metrics, and educator publishing.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${isHome ? 'text-stone-300' : 'text-slate-600'}`}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Syllabus-Aligned Paths
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${isHome ? 'text-stone-300' : 'text-slate-600'}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> CBT Testing Engine
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${isHome ? 'text-stone-300' : 'text-slate-600'}`}>
                <Compass className="w-3.5 h-3.5 text-amber-500" /> AI Diagnostic Coaching
              </span>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isHome ? 'text-white' : 'text-slate-900'}`}>Platform Dimensions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className={isHome ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}>Personal Learning & Mocks</Link></li>
              <li><Link href="/dashboard" className={isHome ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}>Exam Syllabus Tree</Link></li>
              <li><Link href="/tests/create" className={isHome ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}>Test Studio & Parser</Link></li>
              <li><Link href="/dashboard/admin" className={isHome ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}>Educator Publishing Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isHome ? 'text-white' : 'text-slate-900'}`}>Curated Target Exams</h4>
            <ul className={`space-y-2 text-xs ${isHome ? 'text-stone-400' : 'text-slate-500'}`}>
              <li>SSC CGL 2026 (Tier I & II)</li>
              <li>Banking & Insurance (IBPS PO)</li>
              <li>UPSC Civil Services Prelims</li>
              <li>Railways RRB (NTPC & Group D)</li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isHome ? 'text-white' : 'text-slate-900'}`}>Architectural Foundation</h4>
            <p className={`text-xs mb-2.5 leading-relaxed ${isHome ? 'text-stone-400' : 'text-slate-500'}`}>
              Built on Next.js 15, React 19, Tailwind CSS, shadcn/ui, and embedded SQLite with zero-latency CBT execution.
            </p>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono ${isHome ? 'bg-white/10 border border-white/10 text-stone-300' : 'bg-stone-100 border border-stone-200 text-slate-700'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Nalanda v2.4 Platform
            </div>
          </div>
        </div>

        <div className={`pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 ${isHome ? 'border-t border-white/10 text-stone-500' : 'border-t border-stone-100 text-slate-400'}`}>
          <p>© {new Date().getFullYear()} Nalanda. Open, structured, and accessible academic learning.</p>
          <p>Designed for serious learners, academic institutions, and independent educators.</p>
        </div>
      </div>
    </footer>
  );
}
