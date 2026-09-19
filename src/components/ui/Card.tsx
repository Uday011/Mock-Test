import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
  hero?: boolean;
}

export function Card({
  children,
  interactive = false,
  padded = true,
  hero = false,
  className = '',
  ...props
}: CardProps) {
  const interactiveStyles = interactive
    ? 'hover:border-accent/40 hover:bg-secondary/40 transition-all duration-150 cursor-pointer'
    : '';

  const paddingStyle = padded ? 'p-4 sm:p-6' : '';
  const roundedStyle = hero ? 'rounded-hero' : 'rounded-card';

  return (
    <div
      className={`bg-surface ${roundedStyle} border border-line text-ink overflow-hidden transition-colors ${interactiveStyles} ${paddingStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-sm sm:text-base font-semibold text-ink tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-ink-muted mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-4 pt-3 border-t border-line flex items-center justify-between gap-3 text-xs text-ink-muted ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
