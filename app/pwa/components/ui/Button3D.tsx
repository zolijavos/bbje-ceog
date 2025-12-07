'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useHaptic } from '../../hooks/useHaptic';

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  (
    {
      children,
      variant = 'primary',
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const { patterns } = useHaptic();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Haptic feedback
      patterns.medium();

      onClick?.(e);
    };

    const baseClass = variant === 'primary' ? 'btn-3d' : 'btn-3d btn-3d-secondary';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseClass} ${widthClass} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="text-lg">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button3D.displayName = 'Button3D';

export default Button3D;
