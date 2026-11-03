import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  X,
  Delete,
  CornerDownLeft,
  ChevronDown,
  Hash,
  Type,
  Coins,
  ArrowUp,
} from 'lucide-react';
import { playTap } from '@/lib/sound';

export interface VirtualKeyboardProps {
  onKeyPress?: (key: string) => void;
  onEnter?: () => void;
  onClose?: () => void;
  defaultMode?: 'numpad' | 'qwerty';
}

export function VirtualKeyboard({
  onKeyPress,
  onEnter,
  onClose,
  defaultMode = 'numpad',
}: VirtualKeyboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'numpad' | 'qwerty'>(defaultMode);
  const [isCaps, setIsCaps] = useState(false);

  // Helper to dispatch input into currently focused element
  const sendKeyToFocusedInput = (key: string) => {
    playTap();
    if (onKeyPress) onKeyPress(key);

    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
      return;
    }

    if (key === 'BACKSPACE') {
      const val = activeEl.value;
      const start = activeEl.selectionStart ?? val.length;
      const end = activeEl.selectionEnd ?? val.length;
      if (start === end && start > 0) {
        activeEl.value = val.slice(0, start - 1) + val.slice(end);
        activeEl.selectionStart = activeEl.selectionEnd = start - 1;
      } else {
        activeEl.value = val.slice(0, start) + val.slice(end);
        activeEl.selectionStart = activeEl.selectionEnd = start;
      }
    } else if (key === 'CLEAR') {
      activeEl.value = '';
    } else if (key === 'ENTER') {
      if (onEnter) onEnter();
      activeEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      activeEl.form?.dispatchEvent(new Event('submit', { bubbles: true }));
      return;
    } else {
      const val = activeEl.value;
      const start = activeEl.selectionStart ?? val.length;
      const end = activeEl.selectionEnd ?? val.length;
      activeEl.value = val.slice(0, start) + key + val.slice(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + key.length;
    }

    // Trigger synthetic input & change event so React form state updates
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const addCashAmount = (amount: number) => {
    playTap();
    const activeEl = document.activeElement as HTMLInputElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const currentVal = parseInt(activeEl.value.replace(/\D/g, '') || '0', 10);
      const newVal = currentVal + amount;
      activeEl.value = newVal.toString();
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      activeEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const qwertyRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '@'],
  ];

  return (
    <>
      {/* Floating Keyboard Launcher Trigger Button (Positioned at bottom-left to prevent overlap with CS widget) */}
      <button
        type="button"
        onClick={() => {
          playTap();
          setIsOpen(!isOpen);
        }}
        className={`fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-[8888] size-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer ${
          isOpen
            ? 'bg-[#0f2b5c] text-white rotate-0 scale-105'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:scale-105'
        }`}
        title="Keyboard Layar Sentuh"
        aria-label="Keyboard Layar Sentuh"
      >
        <Keyboard className="size-5" />
      </button>

      {/* Floating Keyboard Dock Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="fixed bottom-36 lg:bottom-20 left-4 sm:left-6 z-[8888] w-[calc(100vw-2rem)] sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] select-none text-white"
          >
            {/* Header Control Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  <Keyboard className="size-3.5 text-sky-400" />
                  <span>On-Screen Keyboard</span>
                </span>
                <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 border border-sky-400/30 px-2 py-0.5 rounded-full uppercase">
                  Touch Mode
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Switcher Mode: Numpad vs Qwerty */}
                <div className="flex bg-slate-800/90 p-0.5 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setMode('numpad');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      mode === 'numpad' ? 'bg-[#0f2b5c] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Numpad
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setMode('qwerty');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      mode === 'qwerty' ? 'bg-[#0f2b5c] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Huruf
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                  className="size-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </div>

            {/* NUMPAD MODE */}
            {mode === 'numpad' && (
              <div className="space-y-3">
                {/* Quick Cash Nominal Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => addCashAmount(10000)}
                    className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] font-bold text-sky-300 border border-slate-700/60 transition"
                  >
                    +10.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashAmount(20000)}
                    className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] font-bold text-sky-300 border border-slate-700/60 transition"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashAmount(50000)}
                    className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] font-bold text-sky-300 border border-slate-700/60 transition"
                  >
                    +50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => addCashAmount(100000)}
                    className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] font-bold text-sky-300 border border-slate-700/60 transition"
                  >
                    +100.000
                  </button>
                </div>

                {/* Numpad 4x4 Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {['7', '8', '9'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => sendKeyToFocusedInput(k)}
                      className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lg font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('BACKSPACE')}
                    className="h-12 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 flex items-center justify-center active:scale-95 transition shadow-sm"
                    title="Hapus"
                  >
                    <Delete className="size-5" />
                  </button>

                  {['4', '5', '6'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => sendKeyToFocusedInput(k)}
                      className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lg font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('CLEAR')}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition"
                  >
                    C
                  </button>

                  {['1', '2', '3'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => sendKeyToFocusedInput(k)}
                      className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lg font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('ENTER')}
                    className="row-span-2 h-full rounded-2xl bg-[#0f2b5c] hover:bg-[#163a75] border border-blue-400/40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-md shadow-blue-950/50"
                  >
                    <CornerDownLeft className="size-4" />
                    <span>OK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('0')}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lg font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('00')}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sm font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                  >
                    00
                  </button>
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('000')}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sm font-black font-mono active:scale-95 transition shadow-sm border border-slate-700/80"
                  >
                    000
                  </button>
                </div>
              </div>
            )}

            {/* QWERTY MODE */}
            {mode === 'qwerty' && (
              <div className="space-y-1.5">
                {qwertyRows.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1">
                    {rIdx === 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          setIsCaps(!isCaps);
                        }}
                        className={`px-3 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                          isCaps ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                    )}

                    {row.map((char) => {
                      const displayChar = isCaps ? char.toUpperCase() : char;
                      return (
                        <button
                          key={char}
                          type="button"
                          onClick={() => sendKeyToFocusedInput(displayChar)}
                          className="flex-1 min-w-[30px] h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-sm font-semibold font-mono border border-slate-700/60 transition flex items-center justify-center"
                        >
                          {displayChar}
                        </button>
                      );
                    })}

                    {rIdx === 3 && (
                      <button
                        type="button"
                        onClick={() => sendKeyToFocusedInput('BACKSPACE')}
                        className="px-3 h-10 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 flex items-center justify-center active:scale-95 transition"
                      >
                        <Delete className="size-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Bottom Row: Spacebar & Enter */}
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('CLEAR')}
                    className="px-3 h-10 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput(' ')}
                    className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold tracking-wider uppercase text-slate-300 border border-slate-700/60 transition"
                  >
                    Spasi
                  </button>
                  <button
                    type="button"
                    onClick={() => sendKeyToFocusedInput('ENTER')}
                    className="px-5 h-10 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] border border-blue-400/40 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition shadow-sm"
                  >
                    <CornerDownLeft className="size-3.5" />
                    <span>Enter</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default VirtualKeyboard;

