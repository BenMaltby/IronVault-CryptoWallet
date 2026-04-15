import { IdleAutoLogout } from '@/components/auth/idle-auto-logout';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

/** Matches dashboard: outer padding and grid with nav sidebar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleAutoLogout />
      {/* Mobile bottom nav — visible only below lg breakpoint */}
      <MobileNav />
      <main className="grid min-h-screen w-full max-w-7xl mx-auto gap-6 px-4 py-4 pb-24 lg:grid-cols-[256px_1fr] lg:px-6 lg:py-8 lg:pb-8">
        {/* Sidebar — hidden on mobile, sticky on desktop */}
        <div className="hidden self-start lg:block lg:sticky lg:top-8 lg:shrink-0">
          <Sidebar />
        </div>
        <section className="min-w-0 space-y-4 lg:space-y-6">{children}</section>
      </main>
    </>
  );
}
