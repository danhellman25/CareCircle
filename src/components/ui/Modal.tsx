'use client';

import { classNames } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={classNames(
          'relative w-full h-full sm:h-auto bg-card sm:rounded-2xl shadow-2xl overflow-y-auto',
          sizes[size],
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-4 sm:p-6 pb-0 pt-14 sm:pt-6">
            <div>
              {title && <h2 className="text-lg sm:text-xl font-semibold text-text">{title}</h2>}
              {description && <p className="text-sm text-text-light mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-text-light hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 sm:p-6 pb-safe">{children}</div>
      </div>
    </div>
  );
}
