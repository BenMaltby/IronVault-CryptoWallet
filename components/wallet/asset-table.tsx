import { AssetBalance } from '@/types';
import { formatCurrency } from '@/lib/utils';

type Props = {
  assets: AssetBalance[];
};

export function AssetTable({ assets }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-800 p-4">
        <h3 className="text-lg font-semibold">Portfolio assets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-slate-400">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={`${asset.symbol}-${asset.network}`} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{asset.symbol} <span className="text-slate-400">{asset.name}</span></td>
                <td className="px-4 py-3">{asset.network}</td>
                <td className="px-4 py-3">{asset.balance.toFixed(2)}</td>
                <td className="px-4 py-3">{formatCurrency(asset.price)}</td>
                <td className="px-4 py-3">{formatCurrency(asset.balance * asset.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
