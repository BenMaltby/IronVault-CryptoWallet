'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  WalletCards,
  Menu,
  X,
  TrendingUp,
  History,
  BookUser,
  Search,
  Settings,
  GraduationCap,
  LifeBuoy,
  House,
  Shield,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';

type Props = {
  username: string;
  roleLabel: string;
  isAdmin: boolean;
};

type NavItem = { href: string; label: string; icon: typeof Wallet };

const BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Wallet },
  { href: '/wallets',   label: 'Wallets',   icon: WalletCards },
  { href: '/send',      label: 'Send',       icon: ArrowUpRight },
  { href: '/receive',   label: 'Receive',    icon: ArrowDownLeft },
];

const DRAWER_NAV: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard', icon: Wallet },
  { href: '/portfolio',    label: 'Portfolio', icon: TrendingUp },
  { href: '/wallets',      label: 'Wallets',   icon: WalletCards },
  { href: '/send',         label: 'Send',       icon: ArrowUpRight },
  { href: '/receive',      label: 'Receive',    icon: ArrowDownLeft },
  { href: '/transactions', label: 'History',    icon: History },
  { href: '/contacts',     label: 'Contacts',   icon: BookUser },
  { href: '/search',       label: 'Search',     icon: Search },
  { href: '/learning',     label: 'Learning',   icon: GraduationCap },
  { href: '/settings',     label: 'Settings',   icon: Settings },
  { href: '/support',      label: 'Support',    icon: LifeBuoy },
];

const ADMIN_ITEM: NavItem = { href: '/admin', label: 'Admin', icon: Shield };

export function MobileNavClient({ username, roleLabel, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const drawerItems: NavItem[] = isAdmin ? [...DRAWER_NAV, ADMIN_ITEM] : DRAWER_NAV;

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-up drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          className="flex flex-col overflow-hidden rounded-t-2xl border-t border-slate-700 bg-slate-900"
          style={{ maxHeight: '85vh' }}
        >
          {/* Drag handle bar */}
          <div className="relative flex shrink-0 items-start justify-between px-4 pt-3 pb-3">
            <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-600" />
            <div className="mt-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">IronVault</p>
              <p className="font-semibold text-white">{username}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">{roleLabel}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable nav list */}
          <nav className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="grid gap-0.5">
              {drawerItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
                return (
                  <Link
                    key={href}
                    href={href as Route}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="mt-4 grid gap-2 border-t border-slate-800 pt-4">
              <LogoutButton />
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                <House className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Fixed bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href as Route}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition ${
                  active ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition ${
              open ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
