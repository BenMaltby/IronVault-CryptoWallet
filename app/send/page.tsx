import { Sidebar } from '@/components/layout/sidebar';

export default function SendPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">RQ12 / RQ17 / RQ18 / RQ22</span>
          <h1 className="mt-3 text-3xl font-bold">Send crypto</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            This starter page is intentionally simple. Wire this form to <code className="rounded bg-slate-800 px-1 py-0.5">POST /api/transactions/send</code> to validate addresses, check balances, estimate fees, and return a confirmation payload before signing.
          </p>
        </div>
        <div className="card max-w-3xl p-6">
          <form className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Recipient address</span>
              <input className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="0x..." />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Network</span>
              <select className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                <option>Ethereum Sepolia</option>
                <option>Polygon Amoy</option>
                <option>Base Sepolia</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Asset</span>
              <select className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                <option>ETH</option>
                <option>MATIC</option>
                <option>USDC</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Amount</span>
              <input type="number" step="0.0001" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="0.10" />
            </label>
          </form>
        </div>
      </section>
    </main>
  );
}
