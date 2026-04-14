import { TransactionRecord } from '@/types';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
        {transactions.map((tx) => {
          const isSend = tx.type === 'send';

          return (
            <div
              key={tx.id}
              className="flex flex-col gap-3 p-4 transition hover:bg-slate-900/50 md:flex-row md:items-center md:justify-between"
            >
              {/* LEFT SIDE */}
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl ${
                    isSend ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {isSend ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>

                <div>
                  <p className="font-medium capitalize">
                    {tx.type} {tx.assetSymbol}
                  </p>

                  <p className="text-sm text-slate-400">
                    {tx.network} · {new Date(tx.createdAt).toLocaleString()}
                  </p>

                  {tx.recipientAddress ? (
                    <p className="text-sm text-slate-400">
                      To {shortenAddress(tx.recipientAddress)}
                    </p>
                  ) : null}

                  {tx.senderAddress ? (
                    <p className="text-sm text-slate-400">
                      From {shortenAddress(tx.senderAddress)}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-right">
                <p className="font-semibold">
                  {tx.amount} {tx.assetSymbol}
                </p>

                <p className="text-sm text-slate-400">
                  Fee {formatCurrency(tx.estimatedFee)}
                </p>

                <span
                  className={`mt-1 inline-block rounded-lg px-2 py-1 text-xs font-medium ${
                    tx.status === 'submitted'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : tx.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}