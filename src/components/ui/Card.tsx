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
    ? 'hover:border-stone-400 hover:bg-[#f7f6f3]/50 transition-all duration-150 cursor-pointer'
    : '';

  const paddingStyle = padded ? 'p-4 sm:p-5' : '';

  return (
    <div
      className={`bg-white rounded-lg border border-[#ebebeb] text-[#37352f] overflow-hidden ${interactiveStyles} ${paddingStyle} ${className}`}
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
      className={`text-sm sm:text-base font-semibold text-[#37352f] tracking-tight leading-snug ${className}`}
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
    <p className={`text-xs text-[#787774] mt-0.5 leading-relaxed ${className}`} {...props}>
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
      className={`mt-4 pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-3 text-xs text-[#787774] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
