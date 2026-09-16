'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  BookOpen,
  Code,
  Tag,
  FileCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCallout } from '@/components/ui/MetricCallout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function QuestionBankPage() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleItems = [
    {
      id: 'qb-1',
      code: 'MATH-102-Q01',
      subject: 'Quantitative Aptitude',
      topic: 'Percentages, Profit & Loss',
      difficulty: 'Medium',
      type: 'Single Choice',
      text: 'A merchant marks goods 40% above cost price and allows a discount of 25%. If his profit is Rs. 140, calculate the original cost price.',
      tags: ['SSC CGL 2024', 'TCS Pattern', 'Profit-Loss'],
    },
    {
      id: 'qb-2',
      code: 'MATH-105-Q04',
      subject: 'Quantitative Aptitude',
      topic: 'Triangles, Circles & Geometry',
      difficulty: 'Hard',
      type: 'Single Choice',
      text: 'In a circle with centre O, chords AB and CD intersect perpendicularly at P. If AP = 6 cm, PB = 4 cm, and CP = 3 cm, determine the length of PD.',
      tags: ['Intersecting Chords', 'Geometry Proof'],
    },
    {
      id: 'qb-3',
      code: 'REAS-102-Q02',
      subject: 'General Intelligence & Reasoning',
      topic: 'Syllogisms & Logic',
      difficulty: 'Easy',
      type: 'Single Choice',
      text: 'Statements: All books are papers. Some papers are journals. Determine which conclusion logically follows.',
      tags: ['Venn Deductions', 'Tier-I Must-Solve'],
    },
    {
      id: 'qb-4',
      code: 'ENG-101-Q09',
      subject: 'English Comprehension',
      topic: 'Error Spotting & Grammar',
      difficulty: 'Medium',
      type: 'Single Choice',
      text: 'Spot the grammatical error: Neither the principal nor the senior professors was present at the symposium when the chief guest arrived.',
      tags: ['Subject-Verb Concord', 'Correlative Conjunctions'],
    },
    {
      id: 'qb-5',
      code: 'GA-101-Q15',
      subject: 'General Awareness',
      topic: 'Indian Constitution & Polity',
      difficulty: 'Easy',
      type: 'Single Choice',
      text: 'Under Article 32 of the Constitution of India, which writ is issued to command an authority to perform a statutory duty that it has neglected?',
      tags: ['Article 32', 'Constitutional Remedies', 'Writs'],
    },
  ];

  const filteredItems = sampleItems.filter((item) => {
    if (selectedSubject !== 'all' && item.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.text.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Studio & Repository', href: '/question-bank' },
        { label: 'Question Bank' },
      ]}
    >
      <PageHeader
        title="Question Bank & Item Repository"
        description="Curated assessment items with syllabus mapping, cognitive difficulty tagging, and LaTeX mathematical typesetting."
        badge={<Badge variant="saffron" size="md">Item Repository</Badge>}
        actions={
          <Link href="/tests/create">
            <Button variant="saffron" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Author Assessment in Studio
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCallout
          label="Total Question Items"
          value="1,240"
          subtext="Verified items across 4 subjects"
          accent="navy"
        />
        <MetricCallout
          label="SSC CGL Items"
          value="480"
          subtext="Tier-I & Tier-II calibrated"
          accent="saffron"
        />
        <MetricCallout
          label="Tagged with Topics"
          value="100%"
          subtext="Prerequisite and weightage mapped"
          accent="emerald"
        />
        <MetricCallout
          label="Authoring Status"
          value="Active"
          subtext="Educator submissions open"
          accent="stone"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Comprehension', 'General Awareness'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedSubject === s
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {s === 'all' ? 'All Subjects' : s}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search items by keyword or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 sm:p-5 hover:border-stone-300 transition-colors bg-white">
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-stone-700">{item.subject}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{item.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.difficulty === 'Easy' ? 'emerald' : item.difficulty === 'Medium' ? 'saffron' : 'rose'}
                    size="sm"
                  >
                    {item.difficulty}
                  </Badge>
                  <Badge variant="stone" size="sm">
                    {item.type}
                  </Badge>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-900 font-medium leading-relaxed">
                {item.text}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-50 text-stone-600 border border-stone-200">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Preview</Button>
                  <Button variant="secondary" size="sm">+ Add to Test</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
