import { Sidebar } from '@/components/layout/sidebar';
import { TransactionList } from '@/components/wallet/transaction-list';
import { transactions } from '@/lib/mock-data';

export default function TransactionsPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">RQ14 / RQ20 / RQ44</span>
          <h1 className="mt-3 text-3xl font-bold">Transaction history</h1>
          <p className="mt-2 text-slate-400">Add filters by asset, date range, direction, and status here.</p>
        </div>
        <TransactionList transactions={transactions} />
      </section>
    </main>
  );
}
