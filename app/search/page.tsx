import { Sidebar } from '@/components/layout/sidebar';
import { CryptoSearch } from '@/components/search/crypto-search';

export default function SearchPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">Live market data</span>
          <h1 className="mt-3 text-3xl font-bold">Crypto search</h1>
          <p className="mt-2 text-slate-400">
            Prices via Binance WebSocket in real time. Market cap and volume from CoinGecko, refreshed every minute.
          </p>
        </div>
        <CryptoSearch />
      </section>
    </main>
  );
}
