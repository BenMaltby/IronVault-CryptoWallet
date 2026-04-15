'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, SendHorizonal, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAssistantReply, type ChatMessage } from '@/lib/help-chatbot-mock';

const introMessage: ChatMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    'Hello! What would you like help with, please? I am **IronVault AI** (keyword rules only — **not** a connected LLM); try send, receive, wallets, history, or the dashboard.',
};

function nextId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderInlineBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-emerald-200">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function MockHelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: mockAssistantReply(trimmed),
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 450);
  }, [input, thinking]);

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 hover:scale-105 active:scale-95"
          aria-label="Open IronVault AI"
          title="Open IronVault AI (prototype)"
        >
          <span className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" />
          </span>
        </button>
      )}

      {/* ── Full-screen overlay ──────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">

          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-gradient-to-r from-violet-950/60 to-slate-950 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30">
                <Bot className="h-5 w-5" />
                <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-300/95" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">IronVault AI</p>
                  <span className="rounded-md border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                    Prototype
                  </span>
                </div>
                <p className="text-xs text-slate-400">Not a real model — keyword replies only</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:border-slate-500 hover:text-white"
              aria-label="Close IronVault AI"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'ml-auto bg-emerald-600/25 text-slate-100'
                      : 'mr-auto border border-violet-500/20 bg-slate-900 text-slate-200 ring-1 ring-violet-500/10',
                  )}
                >
                  <p className="whitespace-pre-wrap">{renderInlineBold(msg.content)}</p>
                </div>
              ))}
              {thinking && (
                <div className="mr-auto max-w-[85%] rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="inline-flex gap-0.5">
                      <span className="animate-bounce [animation-delay:0ms]">.</span>
                      <span className="animate-bounce [animation-delay:150ms]">.</span>
                      <span className="animate-bounce [animation-delay:300ms]">.</span>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Input footer */}
          <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-2">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask IronVault AI…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  aria-label="Message to IronVault AI"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || thinking}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <SendHorizonal className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-600">
                Prototype · no API keys · no data leaves your session
              </p>
            </div>
          </footer>

        </div>
      )}
    </>
  );
}
