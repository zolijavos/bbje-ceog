'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'float' | 'static' | 'elevated';
  href?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'float', href, padding = 'md', className = '', ...props }, ref) => {
    const variantClass =
      variant === 'float'
        ? 'card-float'
        : variant === 'elevated'
        ? 'card-elevated'
        : 'card-static';

    const paddingClass = paddingClasses[padding];
    const combinedClassName = `${variantClass} ${paddingClass} ${className}`;

    if (href) {
      return (
        <Link href={href} className="block">
          <div ref={ref} className={combinedClassName} {...props}>
            {children}
          </div>
        </Link>
      );
    }

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({
  title,
  icon,
  action,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between mb-3 ${className}`}
      {...props}
    >
      <h2 className="font-semibold pwa-text-primary flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {title}
      </h2>
      {action && <div className="pwa-text-tertiary text-sm">{action}</div>}
    </div>
  );
}

// Card Content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={`pwa-text-secondary ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
