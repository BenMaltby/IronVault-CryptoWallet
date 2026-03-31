import { formatCurrency } from '@/lib/utils';

type Props = {
  totalValue: number;
  totalAssets: number;
  pendingTransactions: number;
};

export function SummaryCards({ totalValue, totalAssets, pendingTransactions }: Props) {
  const cards = [
    { label: 'Portfolio value', value: formatCurrency(totalValue) },
    { label: 'Tracked assets', value: String(totalAssets) },
    { label: 'Pending transactions', value: String(pendingTransactions) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="card p-5">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
