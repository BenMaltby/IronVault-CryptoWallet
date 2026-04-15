import { Sidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile navigation — the fixed top bar + slide-in drawer.
          Wrapping in lg:hidden hides all fixed-position children on desktop. */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="grid min-h-screen w-full max-w-7xl mx-auto gap-6 px-4 pb-8 pt-20 sm:px-6 lg:grid-cols-[256px_1fr] lg:py-8">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden self-start lg:block lg:sticky lg:top-8 lg:shrink-0">
          <Sidebar />
        </div>

        <section className="min-w-0 space-y-6">{children}</section>
      </main>
    </>
  );
}
