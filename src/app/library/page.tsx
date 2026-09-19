'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Library,
  BookMarked,
  PlusCircle,
  Search,
  Filter,
  Youtube,
  FileText,
  BookOpen,
  ExternalLink,
  Bookmark,
  Check,
  Globe,
  StickyNote,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function ResourcesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState<'library' | 'my'>(
    tabParam === 'my' ? 'my' : 'library'
  );

  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Add Resource Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(actionParam === 'add' || tabParam === 'add');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'youtube' | 'pdf' | 'article' | 'website' | 'notes'>('youtube');
  const [subjectName, setSubjectName] = useState('Quantitative Aptitude');
  const [topicName, setTopicName] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tabParam === 'my') {
      setActiveTab('my');
    } else {
      setActiveTab('library');
    }
  }, [tabParam]);

  useEffect(() => {
    if (actionParam === 'add' || tabParam === 'add') {
      setIsAddModalOpen(true);
    }
  }, [actionParam, tabParam]);

  const fetchResources = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab === 'my') params.set('tab', 'my');
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedSubject !== 'all') params.set('subject', selectedSubject);
    if (selectedType !== 'all') params.set('type', selectedType);

    fetch(`/api/resources?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResources(data.resources || []);
          if (data.subjects) setSubjects(data.subjects);
        }
      })
      .catch((err) => console.error('Failed to load resources:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, selectedSubject, selectedType]);

  const handleToggleSave = async (id: string) => {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_save', resource_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_saved: data.is_saved } : r))
        );
      }
    } catch (err) {
      console.error('Failed to toggle save status:', err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          subject_name: subjectName,
          topic_name: topicName.trim() || null,
          source: source.trim() || (type === 'youtube' ? 'YouTube' : 'Personal Note'),
          url: url.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setTitle('');
        setTopicName('');
        setSource('');
        setUrl('');
        setNotes('');
        setActiveTab('my');
        fetchResources();
      }
    } catch (err) {
      console.error('Failed to add resource:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (resType: string) => {
    switch (resType) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600 shrink-0" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'website':
        return <Globe className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'notes':
      default:
        return <StickyNote className="w-4 h-4 text-[#4F46A5] shrink-0" />;
    }
  };

  const getTypeLabel = (resType: string) => {
    switch (resType) {
      case 'youtube': return 'YouTube Video';
      case 'pdf': return 'PDF Handout';
      case 'article': return 'Article';
      case 'website': return 'Website';
      case 'notes': return 'Personal Note';
      default: return resType;
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Resources' },
        { label: activeTab === 'my' ? 'My Resources' : 'Resource Library' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Page Header */}
        <div className="border-b border-[#E6E6E3] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#787774] mb-1">
              <span>Study Materials</span>
              <span>•</span>
              <span>Free & Saved Content</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
              {activeTab === 'my' ? 'My Resources' : 'Resource Library'}
            </h1>
          </div>

          {/* Top Actions: View Switcher + Add Resource */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex items-center bg-[#EAEAE7] p-1 rounded-xl text-xs w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('library')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all min-h-[38px] text-center ${
                  activeTab === 'library'
                    ? 'bg-white text-[#202124] shadow-xs'
                    : 'text-[#787774] hover:text-[#202124]'
                }`}
              >
                Resource Library
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all min-h-[38px] text-center ${
                  activeTab === 'my'
                    ? 'bg-white text-[#202124] shadow-xs'
                    : 'text-[#787774] hover:text-[#202124]'
                }`}
              >
                My Resources
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] bg-[#4F46A5] text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-[#4338CA] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E6E6E3] rounded-xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title, topic, or keyword..."
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-xs rounded-lg border border-[#E6E6E3] focus:border-[#202124] focus:outline-none placeholder:text-[#787774] min-h-[42px]"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="p-2.5 text-xs rounded-lg border border-[#E6E6E3] bg-white text-[#202124] focus:outline-none focus:border-[#202124] w-full sm:w-auto min-h-[42px]"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="p-2.5 text-xs rounded-lg border border-[#E6E6E3] bg-white text-[#202124] focus:outline-none focus:border-[#202124] w-full sm:w-auto min-h-[42px]"
              >
                <option value="all">All Types</option>
                <option value="youtube">YouTube Videos</option>
                <option value="pdf">PDF Handouts</option>
                <option value="article">Articles & Guides</option>
                <option value="notes">Personal Notes</option>
                <option value="website">Websites</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#787774] font-mono">
            Loading resources...
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {resources.map((r) => {
              const isSaved = Boolean(r.is_saved);

              return (
                <div
                  key={r.id}
                  className="p-4 bg-white border border-[#E6E6E3] rounded-xl hover:border-[#D4D4D1] shadow-2xs transition-colors flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="space-y-2">
                    {/* Header Row: Type + Subject + Bookmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(r.type)}
                        <span className="font-mono text-[10px] uppercase font-semibold text-[#787774]">
                          {getTypeLabel(r.type)}
                        </span>
                        {r.subject_name && (
                          <span className="text-[11px] text-[#787774] truncate">
                            • {r.subject_name}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSave(r.id)}
                        className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#787774] hover:text-[#202124] active:scale-95 transition-all ${
                          isSaved ? 'text-amber-600 bg-amber-50' : 'hover:bg-[#F1F1EF]'
                        }`}
                        title={isSaved ? 'Saved to My Resources' : 'Save to My Resources'}
                        aria-label="Toggle bookmark"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-[#202124] leading-snug">
                      {r.title}
                    </h3>

                    {/* Topic tag */}
                    {r.topic_name && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#787774]">Topic:</span>
                        <Badge variant="gray" size="sm">{r.topic_name}</Badge>
                      </div>
                    )}

                    {/* Notes / Summary */}
                    {r.notes && (
                      <p className="text-[11px] text-[#787774] leading-relaxed line-clamp-3 pt-1">
                        {r.notes}
                      </p>
                    )}
                  </div>

                  {/* Footer Row: Source + Link Button */}
                  <div className="pt-3 border-t border-[#F1F1EF] flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#787774] truncate max-w-[150px]">
                      Source: {r.source || 'Curated'}
                    </span>

                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 min-h-[36px] bg-[#EEF0FB] text-[#4F46A5] rounded-lg text-xs font-semibold hover:bg-[#E0E3F8] active:scale-95 transition-all"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#787774] italic">
                        In-app notes
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white border border-[#E6E6E3] rounded-lg text-center space-y-3">
            <Library className="w-8 h-8 mx-auto text-[#787774]" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#202124]">No Resources Found</h3>
              <p className="text-xs text-[#787774] max-w-sm mx-auto">
                {activeTab === 'my'
                  ? 'You have not saved or added any resources yet. Bookmark resources from the library or add your own.'
                  : 'No resources match your current filter criteria.'}
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add First Resource
            </Button>
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Learning Resource"
          description="Save a YouTube lecture, reference PDF, web article, or personal study note to your workspace."
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-[#202124] mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Percentage Concept & Short Tricks Marathon"
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#202124] mb-1">Resource Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none bg-white"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="pdf">PDF Handout</option>
                  <option value="article">Article / Guide</option>
                  <option value="website">Website Link</option>
                  <option value="notes">Personal Note</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">Subject</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none bg-white"
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                  <option value="General Awareness">General Awareness</option>
                  <option value="English Comprehension">English Comprehension</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#202124] mb-1">Topic Name (Optional)</label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Percentages, Profit & Loss"
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">Source / Channel Name</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. YouTube • Abhinay Maths or NCERT"
                  className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#202124] mb-1">URL / Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://..."
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#202124] mb-1">Notes & Key Takeaways</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summarize key formulas, timestamps, or reasons to review this..."
                className="w-full p-2 rounded-md border border-[#E6E6E3] text-xs focus:border-[#202124] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-24 text-center text-xs text-[#787774] font-mono">
            Loading resources...
          </div>
        </AppShell>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
