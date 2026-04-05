import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { validateEvmAddress } from '@/lib/wallet';

const schema = z.object({
  walletId: z.string().min(1),
  recipientAddress: z.string().min(1),
  network: z.enum(['Ethereum Sepolia', 'Polygon Amoy', 'Base Sepolia']),
  assetSymbol: z.string().min(2),
  amount: z.number().positive(),
  recipientSaved: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in to send a transaction.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { walletId, recipientAddress, network, assetSymbol, amount, recipientSaved } = parsed.data;

  if (!validateEvmAddress(recipientAddress)) {
    return NextResponse.json({ error: 'Invalid recipient address format.' }, { status: 400 });
  }

  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, ownerId: session.user.id },
    include: { addresses: { take: 1, orderBy: { createdAt: 'asc' } } },
  });
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 });
  }

  const warnings: string[] = [];

  if (wallet.network !== network) {
    warnings.push(
      `Network mismatch: your wallet is on ${wallet.network} but you selected ${network}. Double-check before continuing.`,
    );
  }

  // Look up the real DB balance for this wallet/asset/network combination.
  const balanceRecord = await prisma.balance.findUnique({
    where: {
      walletId_assetSymbol_network: { walletId, assetSymbol, network },
    },
  });

  if (!balanceRecord) {
    return NextResponse.json(
      { error: `No ${assetSymbol} balance found on ${network} for this wallet.` },
      { status: 400 },
    );
  }

  const estimatedFee = network === 'Ethereum Sepolia' ? 0.95 : 0.18;

  if (balanceRecord.amount < amount + estimatedFee) {
    return NextResponse.json(
      {
        error: `Insufficient balance. Available: ${balanceRecord.amount} ${assetSymbol}, required: ${amount + estimatedFee} ${assetSymbol} (amount + fee).`,
      },
      { status: 400 },
    );
  }

  if (!recipientSaved) {
    warnings.push('Recipient is not in your address book. Double-check the address before confirming.');
  }

  const senderAddress = wallet.addresses[0]?.address ?? null;

  const transaction = await prisma.transaction.create({
    data: {
      walletId,
      assetSymbol,
      amount,
      estimatedFee,
      recipientAddress,
      senderAddress,
      network,
      direction: 'SEND',
      status: 'DRAFT',
      riskWarning: warnings[0] ?? null,
    },
  });

  return NextResponse.json(
    {
      draft: {
        id: transaction.id,
        walletId,
        senderAddress,
        recipientAddress,
        network,
        assetSymbol,
        amount,
        estimatedFee,
        availableBalance: balanceRecord.amount,
        warnings,
        status: 'DRAFT',
      },
    },
    { status: 201 },
  );
}
