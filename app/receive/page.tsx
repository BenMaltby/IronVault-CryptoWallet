import { Sidebar } from '@/components/layout/sidebar';

export default function ReceivePage() {
  const demoAddress = '0x9Bf2A3b0e487C8Dc1A7c8319143454B2e04f11Af';

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">RQ13</span>
          <h1 className="mt-3 text-3xl font-bold">Receive crypto</h1>
        </div>
        <div className="card max-w-3xl p-6">
          <p className="text-sm text-slate-400">Primary wallet address</p>
          <p className="mt-2 break-all rounded-xl bg-slate-950 p-3 font-mono text-sm">{demoAddress}</p>
          <div className="mt-6 flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-center text-sm text-slate-400">
            QR placeholder
          </div>
        </div>
      </section>
    </main>
  );
}
