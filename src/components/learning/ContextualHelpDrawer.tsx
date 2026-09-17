'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  Zap,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContextualHelpDrawerProps {
  topicId: string;
  topicTitle: string;
}

export function ContextualHelpDrawer({ topicId, topicTitle }: ContextualHelpDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [response, setResponse] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const actions = [
    { id: 'simplify_explanation', label: 'Explain Simply', icon: BookOpen, desc: 'Everyday intuitive analogy' },
    { id: 'alternate_example', label: 'Another Example', icon: Zap, desc: 'Step-by-step worked problem' },
    { id: 'examiner_trap', label: "Examiner's Trap", icon: ShieldAlert, desc: 'Common trick & how to spot it' },
    { id: 'quick_practice', label: 'Quick Recall', icon: Sparkles, desc: '1-minute intuition check' },
  ];

  const handleAction = async (actionId: string) => {
    setActiveAction(actionId);
    setLoading(true);
    try {
      const res = await fetch('/api/learn/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId, action: actionId }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse({
          title: data.title,
          content: data.content,
        });
      }
    } catch (err) {
      console.error('Contextual assistance error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs text-stone-900">
              Pedagogical Assistance
            </h4>
            <span className="text-[10px] text-stone-500">
              Restrained, on-demand conceptual clarity
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-stone-400">Nalanda Tutor</span>
      </div>

      {/* Action Chips */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          const isActive = activeAction === act.id;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => handleAction(act.id)}
              disabled={loading}
              className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-all ${
                isActive
                  ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
              <div>
                <span className="text-xs font-semibold block leading-tight">{act.label}</span>
                <span className="text-[10px] text-stone-400 block leading-tight mt-0.5">{act.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Response Box */}
      {loading && (
        <div className="p-3 bg-white rounded-lg border border-stone-200 text-center text-xs font-mono text-stone-500">
          Retrieving pedagogical explanation...
        </div>
      )}

      {response && !loading && (
        <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2 text-xs text-stone-800 animate-fade-in shadow-inner">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h5 className="font-sans font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              {response.title}
            </h5>
            <button
              onClick={() => setResponse(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-stone-700 font-sans text-xs">
            {response.content}
          </div>
        </div>
      )}
    </div>
  );
}
