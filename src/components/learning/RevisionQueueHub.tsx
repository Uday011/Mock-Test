'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function RevisionQueueHub() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revisingId, setRevisingId] = useState<string | null>(null);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/revision');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionData();
  }, []);

  const handleCompleteRevision = async (topicId: string) => {
    try {
      setRevisingId(topicId);
      const res = await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId, action: 'complete_revision' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchRevisionData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevisingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-mono text-stone-500">
        Calibrating Spaced Repetition Schedules & Memory Retention Curves...
      </div>
    );
  }

  const overdueTopics = data?.overdueTopics || [];
  const upcomingTopics = data?.upcomingTopics || [];
  const retryQuestions = data?.retryQuestions || [];
  const repeatedMistakes = data?.repeatedMistakes || [];
  const weakAreas = data?.weakAreas || [];
  const sessions = data?.sessions || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-8">
      {/* Revision Queue Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-rose-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-600 font-mono">Overdue for Recall</span>
            <Badge variant="rose" size="sm">Urgent</Badge>
          </div>
          <div className="text-2xl font-sans font-bold text-stone-900 mt-1">
            {summary.overdue_topics_count || 0} Topics
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Memory decay threshold exceeded</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-700 font-mono">Questions Due for Retry</span>
            <Badge variant="saffron" size="sm">Pending</Badge>
          </div>
          <div className="text-2xl font-sans font-bold text-stone-900 mt-1">
            {summary.unresolved_mistakes_count || 0} Questions
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">{summary.repeated_mistakes_count || 0} repeated mistakes</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono">Upcoming (Next 7d)</span>
            <Badge variant="stone" size="sm">Scheduled</Badge>
          </div>
          <div className="text-2xl font-sans font-bold text-stone-900 mt-1">
            {summary.upcoming_topics_count || 0} Topics
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Pre-scheduled spaced checkpoints</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono">Weak Friction Areas</span>
            <Badge variant="stone" size="sm">&lt; 60% Mastery</Badge>
          </div>
          <div className="text-2xl font-sans font-bold text-stone-900 mt-1">
            {summary.weak_topics_count || 0} Topics
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Priority reinforcement targets</span>
        </div>
      </div>

      {/* Topics Due for Spaced Repetition */}
      <Card className="p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-sans font-bold text-stone-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Topics Due for Immediate Spaced Retrieval</span>
            </h3>
            <p className="text-xs text-stone-500">
              Retrieval practice scheduled based on the Ebbinghaus forgetting curve: 1d → 3d → 7d → 14d → 30d.
            </p>
          </div>
          <Badge variant="rose" size="md">
            {overdueTopics.length} Overdue Checks
          </Badge>
        </div>

        {overdueTopics.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            No topics currently overdue for spaced retrieval. Your memory intervals are up to date!
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTopics.map((topic: any) => (
              <div
                key={topic.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 transition-all bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-bold">
                      {topic.subject_name}
                    </span>
                    <Badge variant={topic.status === 'needs_revision' ? 'rose' : 'saffron'} size="sm">
                      {topic.status === 'needs_revision' ? 'Needs Revision' : 'Recall Due'}
                    </Badge>
                    <span className="text-xs font-mono text-stone-400">
                      Repetition #{topic.repetition_count || 1} • Interval: {topic.repetition_interval_days || 1}d
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900">{topic.topic_title}</h4>
                  <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
                    <span>Weightage: {topic.weightage_percentage}%</span>
                    <span>•</span>
                    <span>Current Mastery: {topic.mastery_percentage}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/learn/${topic.topic_id}`}>
                    <Button variant="outline" size="sm">
                      Review Concepts
                    </Button>
                  </Link>
                  <Button
                    variant="saffron"
                    size="sm"
                    disabled={revisingId === topic.topic_id}
                    onClick={() => handleCompleteRevision(topic.topic_id)}
                  >
                    {revisingId === topic.topic_id ? (
                      'Logging...'
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Revised
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Curated Recommended Revision Sessions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-sans font-bold text-stone-900">
            Recommended Revision Sessions
          </h3>
          <p className="text-xs text-stone-500">
            Structured micro-sprints formulated to target your high-friction error categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((sess: any) => (
            <Card key={sess.id} className="p-5 bg-white hover:border-amber-300 transition-all flex flex-col justify-between">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    {sess.duration_minutes} Mins
                  </span>
                  <Badge variant={sess.urgency === 'critical' ? 'rose' : sess.urgency === 'high' ? 'saffron' : 'stone'} size="sm">
                    {sess.question_count} Questions
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-stone-900">{sess.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{sess.focus}</p>
              </div>

              <Link href="/mistakes">
                <Button variant="outline" size="sm" className="w-full justify-between hover:bg-stone-50">
                  <span>Start Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Questions Due for Retry */}
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-sans font-bold text-stone-900">
              High-Yield Questions Due for Blind Re-Attempt
            </h3>
            <p className="text-xs text-stone-500">
              Questions answered incorrectly in diagnostic mocks scheduled for retention verification.
            </p>
          </div>
          <Link href="/mistakes">
            <Button variant="outline" size="sm">
              All Mistakes ({summary.unresolved_mistakes_count || 0}) →
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {retryQuestions.slice(0, 4).map((q: any) => (
            <div
              key={q.id}
              className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                    {q.error_category?.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-stone-800">{q.subject_name}</span>
                  {q.attempt_count > 1 && (
                    <span className="text-[10px] text-rose-700 font-mono font-bold">• {q.attempt_count} attempts</span>
                  )}
                </div>
                <div className="text-stone-900 font-medium line-clamp-1">{q.question_text}</div>
              </div>

              <Link href="/mistakes">
                <Button variant="saffron" size="sm">
                  Retry Question
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
