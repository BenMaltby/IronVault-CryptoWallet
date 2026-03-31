import { TransactionRecord } from '@/types';
import { formatCurrency, shortenAddress } from '@/lib/utils';

type Props = {
  transactions: TransactionRecord[];
};

export function TransactionList({ transactions }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-800 p-4">
        <h3 className="text-lg font-semibold">Recent transactions</h3>
      </div>
      <div className="divide-y divide-slate-800">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium capitalize">{tx.type} {tx.assetSymbol}</p>
              <p className="text-sm text-slate-400">{tx.network} · {new Date(tx.createdAt).toLocaleString()}</p>
              {tx.recipientAddress ? (
                <p className="text-sm text-slate-400">To {shortenAddress(tx.recipientAddress)}</p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="font-semibold">{tx.amount} {tx.assetSymbol}</p>
              <p className="text-sm text-slate-400">Fee {formatCurrency(tx.estimatedFee)}</p>
              <span className="badge mt-1">{tx.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
