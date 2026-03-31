import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assetBalances } from '@/lib/mock-data';
import { validateEvmAddress } from '@/lib/wallet';

const schema = z.object({
  recipientAddress: z.string().min(1),
  network: z.enum(['Ethereum Sepolia', 'Polygon Amoy', 'Base Sepolia']),
  assetSymbol: z.string().min(2),
  amount: z.number().positive(),
  recipientSaved: z.boolean().default(false),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!validateEvmAddress(parsed.data.recipientAddress)) {
    return NextResponse.json({ error: 'Invalid recipient address format.' }, { status: 400 });
  }

  const asset = assetBalances.find((entry) => entry.symbol === parsed.data.assetSymbol && entry.network === parsed.data.network);
  if (!asset) {
    return NextResponse.json({ error: 'Asset is not enabled for the selected network.' }, { status: 400 });
  }

  const estimatedFee = parsed.data.network === 'Ethereum Sepolia' ? 1.95 : 0.18;
  if (asset.balance < parsed.data.amount) {
    return NextResponse.json({ error: 'Insufficient balance for this transaction.' }, { status: 400 });
  }

  const warnings: string[] = [];
  if (!parsed.data.recipientSaved) {
    warnings.push('Recipient is not in the address book. Require an extra confirmation step.');
  }

  return NextResponse.json({
    confirmation: {
      recipientAddress: parsed.data.recipientAddress,
      network: parsed.data.network,
      asset: parsed.data.assetSymbol,
      amount: parsed.data.amount,
      estimatedFee,
      warnings,
      status: 'draft',
    },
  });
}
