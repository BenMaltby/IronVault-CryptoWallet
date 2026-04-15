'use client';

import { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/wallet/summary-cards';
import { PortfolioChart } from '@/components/wallet/portfolio-chart';
import { AssetTable } from '@/components/wallet/asset-table';
import { cryptoCatalog } from '@/lib/crypto-catalog';
import type { AssetBalance } from '@/types';
import type { LiveCoinData } from '@/app/api/crypto/route';

type RawBalance = {
  symbol: string;
  network: string;
  balance: number;
};

type Props = {
  rawBalances: RawBalance[];
  totalAssets: number;
  pendingTransactions: number;
};

const CATALOG_NAME = Object.fromEntries(cryptoCatalog.map((c) => [c.symbol, c.name]));
const CATALOG_FALLBACK = Object.fromEntries(cryptoCatalog.map((c) => [c.symbol, c.price]));

export function LivePortfolio({ rawBalances, totalAssets, pendingTransactions }: Props) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/crypto')
      .then((r) => r.json())
      .then((data: LiveCoinData[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, number> = {};
        for (const entry of data) {
          const coin = cryptoCatalog.find((c) => c.id === entry.id);
          if (coin) map[coin.symbol] = entry.price;
        }
        setPrices(map);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Only include assets the user actually holds with a positive balance
  const assetBalances: AssetBalance[] = rawBalances
    .filter((row) => row.balance > 0)
    .map((row, i) => ({
      assetId: `${row.symbol}-${row.network}-${i}`,
      symbol: row.symbol,
      name: CATALOG_NAME[row.symbol] ?? row.symbol,
      balance: row.balance,
      price: prices[row.symbol] ?? CATALOG_FALLBACK[row.symbol] ?? 0,
      network: row.network as AssetBalance['network'],
    }));

  // For the chart only include assets whose price has loaded so no 0% ghost slices appear
  const chartAssets = loaded
    ? assetBalances
    : assetBalances.filter((a) => a.price > 0);

  const totalValue = assetBalances.reduce((sum, a) => sum + a.balance * a.price, 0);

  return (
    <>
      <SummaryCards
        totalValue={totalValue}
        totalAssets={totalAssets}
        pendingTransactions={pendingTransactions}
      />
      <PortfolioChart assets={chartAssets} totalValue={totalValue} />
      <AssetTable assets={assetBalances} />
    </>
  );
}
