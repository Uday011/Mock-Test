import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({
  children,
  interactive = false,
  padded = true,
  className = '',
  ...props
}: CardProps) {
  const interactiveStyles = interactive
    ? 'hover:border-stone-400 hover:shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.995]'
    : '';

  const paddingStyle = padded ? 'p-5 sm:p-6' : '';

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-2xs text-slate-900 overflow-hidden ${interactiveStyles} ${paddingStyle} ${className}`}
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
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
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
      className={`text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug ${className}`}
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
    <p className={`text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
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
    <div className={`space-y-4 ${className}`} {...props}>
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
      className={`mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3 text-xs text-slate-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
