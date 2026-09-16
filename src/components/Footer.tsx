'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, ShieldCheck, Compass, GraduationCap, BookOpen, Layers } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer during live exam
  if (pathname.startsWith('/exam/') && !pathname.includes('/result')) {
    return null;
  }

  return (
    <footer className="border-t border-stone-200 bg-white text-slate-600 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo size="md" className="mb-3" />
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
              An integrated, editorial learning and testing ecosystem connecting structured syllabus paths, computer-based diagnostic mock tests, learner readiness metrics, and educator publishing.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Syllabus-Aligned Paths
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> CBT Testing Engine
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                <Compass className="w-3.5 h-3.5 text-amber-600" /> AI Diagnostic Coaching
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Dimensions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Personal Learning & Mocks</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Exam Syllabus Tree</Link></li>
              <li><Link href="/tests/create" className="hover:text-slate-900 transition-colors">Test Studio & Parser</Link></li>
              <li><Link href="/dashboard/admin" className="hover:text-slate-900 transition-colors">Educator Publishing Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Curated Target Exams</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>NEET UG 2026 (Pre-Medical)</li>
              <li>UPSC Civil Services Prelims 2026</li>
              <li>JEE Advanced 2026 (Engineering)</li>
              <li>Custom Institutional Mock Series</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Architectural Foundation</h4>
            <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">
              Built on Next.js 15, React 19, Tailwind CSS, and localized embedded SQLite database for zero-latency execution.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-md text-[11px] font-mono text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Nalanda v1.0 Foundation
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Nalanda. Open, structured, and accessible academic learning.</p>
          <p>Designed for serious learners, academic institutions, and independent educators.</p>
        </div>
      </div>
    </footer>
  );
}
