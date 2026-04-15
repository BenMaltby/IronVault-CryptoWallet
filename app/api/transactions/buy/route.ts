import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const schema = z.object({
  walletId: z.string().min(1),
  assetSymbol: z.string().min(1),
  coinAmount: z.number().positive(),
  usdAmount: z.number().min(1),
  priceAtPurchase: z.number().positive(),
  network: z.enum(['Ethereum Sepolia', 'Polygon Amoy', 'Base Sepolia']),
});

const EXCHANGE_FEE_USD = 1.99;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { walletId, assetSymbol, coinAmount, usdAmount, priceAtPurchase, network } = parsed.data;

  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, ownerId: session.user.id },
    include: { addresses: { take: 1, orderBy: { createdAt: 'asc' } } },
  });
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      walletId,
      assetSymbol,
      amount: coinAmount,
      estimatedFee: EXCHANGE_FEE_USD,
      recipientAddress: wallet.addresses[0]?.address ?? null,
      senderAddress: null,
      network,
      direction: 'RECEIVE',
      status: 'DRAFT',
      riskWarning: `BUY:Purchased at ${priceAtPurchase.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · ${usdAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} USD spent`,
    },
  });

  return NextResponse.json(
    {
      draft: {
        id: transaction.id,
        walletId,
        walletName: wallet.name,
        assetSymbol,
        coinAmount,
        usdAmount,
        priceAtPurchase,
        network,
        fee: EXCHANGE_FEE_USD,
      },
    },
    { status: 201 },
  );
}
