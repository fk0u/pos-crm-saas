import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { Loader2 } from 'lucide-react';

export function NavigationPreloader() {
  const [loading, setLoading] = useState(false);
  const [transitionText, setTransitionText] = useState('Memuat Dasbor...');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const unregisterStart = router.on('start', (event) => {
      const url = event.detail.visit.url.pathname;
      const isAuthTransition = url.startsWith('/dashboard') || url.startsWith('/kasir');

      // Only show prominent preloader for key transitions like login/register to dashboard
      // Or requests taking longer than 350ms so fast clicks are completely smooth without flashing
      if (isAuthTransition) {
        setTransitionText('Menyiapkan sesi kasir & dasbor...');
        setLoading(true);
      } else {
        timer = setTimeout(() => {
          setTransitionText('Memuat halaman...');
          setLoading(true);
        }, 350);
      }
    });

    const unregisterFinish = router.on('finish', () => {
      clearTimeout(timer);
      setLoading(false);
    });

    return () => {
      unregisterStart();
      unregisterFinish();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 pointer-events-auto select-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl flex flex-col items-center max-w-sm w-full text-center space-y-5"
          >
            {/* Animated Logo */}
            <div className="relative">
              <QlonLogo variant="icon" size="lg" animated />
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center ring-2 ring-white">
                <Loader2 className="size-3 animate-spin" />
              </div>
            </div>

            <div>
              <p className="font-extrabold text-slate-900 text-base tracking-tight">
                {transitionText}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Menginisialisasi modul POS &amp; CRM QLon
              </p>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-[#0f2b5c] rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

