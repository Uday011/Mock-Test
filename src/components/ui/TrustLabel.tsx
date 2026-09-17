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
    bg: 'bg-[#EDF7ED]',
    text: 'text-[#1B5E20]',
    border: 'border-[#C8E6C9]',
    tooltip: 'Vetted directly by Nalanda Academic Chairs adhering to official examination syllabi.',
  },
  'Educator Published': {
    icon: GraduationCap,
    bg: 'bg-[#EEF0FB]',
    text: 'text-[#4F46A5]',
    border: 'border-[#DCDDF7]',
    tooltip: 'Created and verified by faculty from affiliated institutions and educators.',
  },
  Reviewed: {
    icon: CheckCircle2,
    bg: 'bg-[#FDF6EC]',
    text: 'text-[#B7791F]',
    border: 'border-[#F6E3C7]',
    tooltip: 'Peer-reviewed by top-scorers with verified answer keys and solutions.',
  },
  'Community Created': {
    icon: Users,
    bg: 'bg-[#F1F1EF]',
    text: 'text-[#202124]',
    border: 'border-[#E6E6E3]',
    tooltip: 'Created by an aspirant or educator in the open Nalanda public library.',
  },
  'Source Linked': {
    icon: ExternalLink,
    bg: 'bg-[#FDF6EC]',
    text: 'text-[#B7791F]',
    border: 'border-[#F6E3C7]',
    tooltip: 'Directly linked to historical government exam question papers or official answer keys.',
  },
  'AI Assisted': {
    icon: Sparkles,
    bg: 'bg-[#EEF0FB]',
    text: 'text-[#4F46A5]',
    border: 'border-[#DCDDF7]',
    tooltip: 'Synthesized using AI pedagogy models with human validation and verified derivations.',
  },
  'Under Review': {
    icon: Clock,
    bg: 'bg-[#F1F1EF]',
    text: 'text-[#787774]',
    border: 'border-[#E6E6E3]',
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
