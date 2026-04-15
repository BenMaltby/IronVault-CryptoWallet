'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, House, Wallet, ArrowUpRight, ArrowDownLeft,
  History, Settings, Shield, WalletCards, BookUser,
  GraduationCap, Search, TrendingUp, LifeBuoy,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';

const baseItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Wallet },
  { href: '/learning',  label: 'Learning',  icon: GraduationCap },
  { href: '/portfolio', label: 'Portfolio', icon: TrendingUp },
  { href: '/wallets',   label: 'Wallets',   icon: WalletCards },
  { href: '/send',      label: 'Send',      icon: ArrowUpRight },
  { href: '/receive',   label: 'Receive',   icon: ArrowDownLeft },
  { href: '/transactions', label: 'History', icon: History },
  { href: '/contacts',  label: 'Contacts',  icon: BookUser },
  { href: '/search',    label: 'Search',    icon: Search },
  { href: '/settings',  label: 'Settings',  icon: Settings },
  { href: '/support',   label: 'Support',   icon: LifeBuoy },
];

const privilegedItems = [{ href: '/admin', label: 'Admin', icon: Shield }];

type Props = {
  username: string;
  roleLabel: string;
  isPrivileged: boolean;
};

export function MobileDrawer({ username, roleLabel, isPrivileged }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = isPrivileged ? [...baseItems, ...privilegedItems] : baseItems;

  // Close drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">IronVault</p>
          <p className="text-sm font-bold leading-tight text-white">Crypto Wallet</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:text-white"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Slide-in drawer ───────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-50 w-72 overflow-y-auto border-r border-slate-800 bg-slate-950 p-4 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">IronVault</p>
          <h2 className="text-xl font-bold">Crypto Wallet</h2>
          <p className="mt-3 text-sm font-medium text-white">{username}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{roleLabel}</p>
        </div>

        <nav className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 space-y-3">
          <LogoutButton />
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <House className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
