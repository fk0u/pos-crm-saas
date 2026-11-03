import React, { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { playTap } from '@/lib/sound';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  showCloseButton?: boolean;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-6xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playTap();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Lock body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Full Screen Black Coverage Backdrop (Solid 80% opacity with blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playTap();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-200/90 overflow-hidden z-10 my-auto`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 bg-white">
                <div>
                  {title && (
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      onClose();
                    }}
                    className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95 cursor-pointer ml-3 shrink-0"
                    aria-label="Tutup modal"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}

            <div className="p-5 sm:p-6 max-h-[calc(85vh-8rem)] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;

