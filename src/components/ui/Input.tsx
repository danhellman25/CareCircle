import { classNames } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={classNames(
            'w-full px-4 py-3 sm:py-2.5 rounded-xl border bg-white text-text placeholder-text-muted',
            'text-base sm:text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all duration-200',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-text-light">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
