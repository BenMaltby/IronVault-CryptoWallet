'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({ className, label = 'Sign out' }: LogoutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Signing out...' : label}
    </button>
  );
}
