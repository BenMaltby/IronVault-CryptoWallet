import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { wallet: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
  }
  if (transaction.wallet.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  if (transaction.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Transaction has already been processed.' }, { status: 409 });
  }
  if (!transaction.riskWarning?.startsWith('BUY:')) {
    return NextResponse.json({ error: 'Not a buy transaction.' }, { status: 400 });
  }

  const fakeTxHash = '0x' + crypto.randomBytes(32).toString('hex');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTx = await tx.transaction.update({
      where: { id },
      data: { status: 'SUBMITTED', txHash: fakeTxHash },
    });

    await tx.balance.upsert({
      where: {
        walletId_assetSymbol_network: {
          walletId: transaction.walletId,
          assetSymbol: transaction.assetSymbol,
          network: transaction.network,
        },
      },
      update: { amount: { increment: transaction.amount } },
      create: {
        walletId: transaction.walletId,
        assetSymbol: transaction.assetSymbol,
        network: transaction.network,
        amount: transaction.amount,
      },
    });

    return updatedTx;
  });

  return NextResponse.json({
    result: {
      id: updated.id,
      txHash: updated.txHash,
      status: 'SUBMITTED',
      coinAmount: updated.amount,
      assetSymbol: updated.assetSymbol,
      network: updated.network,
    },
  });
}
