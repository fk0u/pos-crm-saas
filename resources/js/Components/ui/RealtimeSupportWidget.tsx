import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Headphones,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { playTap, playSuccessChime } from '@/lib/sound';

export function RealtimeSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    try {
      const res = await fetch('/api/support/conversation', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setTicketId(data.ticket?.id || null);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Live chat connection notice:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !ticketId || loading) return;

    playTap();
    setLoading(true);
    const tempText = inputMsg;
    setInputMsg('');

    try {
      const csrfToken =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ||
        (document.querySelector('input[name="_token"]') as HTMLInputElement)?.value ||
        '';

      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          message: tempText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
          playSuccessChime();
        }
      }
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Pill Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            playTap();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 h-12 px-4 rounded-full bg-[#0f2b5c] hover:bg-[#163a75] text-white shadow-xl shadow-blue-950/30 font-bold text-xs transition active:scale-95 cursor-pointer border border-white/20 select-none"
          aria-label="Buka Live Chat Dukungan CS"
        >
          <div className="relative">
            <Headphones className="size-4.5" />
            <span className="size-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#0f2b5c]" />
          </div>
          <span className="hidden sm:inline">Bantuan CS Real-time</span>
        </button>
      </div>

      {/* Floating Chat Box Dialog */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#0f2b5c] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Headphones className="size-4.5" />
              </div>
              <div>
                <p className="font-bold text-xs leading-tight">Customer Support QLon</p>
                <p className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Online Siap Membantu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsOpen(false);
              }}
              className="size-8 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc] text-xs">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/70 text-[#0f2b5c] text-[11px] leading-relaxed">
              Halo! Ada kendala kasir POS, scanner, atau cetak nota? Tim support QLon terhubung langsung di sini.
            </div>

            {messages.map((m, i) => {
              const isSupport = m.is_from_support;
              return (
                <div
                  key={m.id || i}
                  className={`flex flex-col ${isSupport ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {isSupport ? 'Tim Dukungan QLon' : 'Anda'}
                  </span>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      isSupport
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-[#0f2b5c] text-white shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{m.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ketik pesan kendala..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="size-10 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
