import { Sidebar } from '@/components/layout/sidebar';
import { AssetTable } from '@/components/wallet/asset-table';
import { SummaryCards } from '@/components/wallet/summary-cards';
import { TransactionList } from '@/components/wallet/transaction-list';
import { assetBalances, transactions } from '@/lib/mock-data';

export default function DashboardPage() {
  const totalValue = assetBalances.reduce((sum, asset) => sum + asset.balance * asset.price, 0);
  const pendingTransactions = transactions.filter((tx) => tx.status === 'pending').length;

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">Core MVP</span>
          <h1 className="mt-3 text-3xl font-bold">Portfolio dashboard</h1>
          <p className="mt-2 text-slate-400">Use this as the starting point for portfolio value, supported assets, and transaction monitoring.</p>
        </div>
        <SummaryCards totalValue={totalValue} totalAssets={assetBalances.length} pendingTransactions={pendingTransactions} />
        <AssetTable assets={assetBalances} />
        <TransactionList transactions={transactions} />
      </section>
    </main>
  );
}
