import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Users,
  ExternalLink,
  Sparkles,
  Clock,
  HelpCircle,
} from 'lucide-react';

export type TrustLabelType =
  | 'Nalanda Official'
  | 'Educator Published'
  | 'Reviewed'
  | 'Community Created'
  | 'Source Linked'
  | 'AI Assisted'
  | 'Under Review';

interface TrustLabelProps {
  label?: string | TrustLabelType;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

const trustConfigs: Record<
  TrustLabelType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    text: string;
    border: string;
    tooltip: string;
  }
> = {
  'Nalanda Official': {
    icon: ShieldCheck,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    tooltip: 'Vetted directly by Nalanda Academic Chairs adhering to official TCS examination syllabi.',
  },
  'Educator Published': {
    icon: GraduationCap,
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    tooltip: 'Created and verified by faculty from affiliated coaching institutions and universities.',
  },
  Reviewed: {
    icon: CheckCircle2,
    bg: 'bg-teal-500/10',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
    tooltip: 'Peer-reviewed by community top-scorers with verified answer keys and solutions.',
  },
  'Community Created': {
    icon: Users,
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    tooltip: 'Created by an aspirant or educator in the open Nalanda public library.',
  },
  'Source Linked': {
    icon: ExternalLink,
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    tooltip: 'Directly linked to historical government exam question papers or official answer keys.',
  },
  'AI Assisted': {
    icon: Sparkles,
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    tooltip: 'Synthesized using AI pedagogy models with human validation and LaTeX mathematical derivations.',
  },
  'Under Review': {
    icon: Clock,
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-400',
    border: 'border-zinc-700/60',
    tooltip: 'Currently undergoing moderation and quality control review.',
  },
};

export function TrustLabel({
  label = 'Community Created',
  size = 'sm',
  showTooltip = false,
  className = '',
}: TrustLabelProps) {
  const normalizedKey = (label as TrustLabelType) in trustConfigs
    ? (label as TrustLabelType)
    : 'Community Created';

  const config = trustConfigs[normalizedKey];
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={showTooltip ? config.tooltip : undefined}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} />
      <span>{normalizedKey}</span>
    </span>
  );
}
