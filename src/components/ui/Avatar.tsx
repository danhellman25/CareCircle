import { classNames, getInitials } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const fallbackText = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={classNames(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary-light text-primary-dark font-semibold',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{fallbackText}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
