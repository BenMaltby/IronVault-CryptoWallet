import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in to submit a transaction.' }, { status: 401 });
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

  // Re-check the balance at submit time to guard against a race where the user
  // opened two confirmation screens simultaneously.
  const balanceRecord = await prisma.balance.findUnique({
    where: {
      walletId_assetSymbol_network: {
        walletId: transaction.walletId,
        assetSymbol: transaction.assetSymbol,
        network: transaction.network,
      },
    },
  });

  const totalDebit = transaction.amount + transaction.estimatedFee;

  if (!balanceRecord || balanceRecord.amount < totalDebit) {
    // Mark the draft as failed so it won't block future attempts.
    await prisma.transaction.update({ where: { id }, data: { status: 'FAILED' } });
    return NextResponse.json(
      { error: 'Insufficient balance at time of submission.' },
      { status: 400 },
    );
  }

  // Simulate broadcasting to the blockchain by generating a fake transaction hash.
  // In a production wallet this would call an RPC provider (e.g. via ethers.js or viem).
  const fakeTxHash = '0x' + crypto.randomBytes(32).toString('hex');

  // Atomically update the transaction status and decrement the balance in a single
  // Prisma transaction so the two writes either both succeed or both fail.
  const [updated] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id },
      data: { status: 'SUBMITTED', txHash: fakeTxHash },
    }),
    prisma.balance.update({
      where: {
        walletId_assetSymbol_network: {
          walletId: transaction.walletId,
          assetSymbol: transaction.assetSymbol,
          network: transaction.network,
        },
      },
      data: { amount: { decrement: totalDebit } },
    }),
  ]);

  return NextResponse.json({
    result: {
      id: updated.id,
      txHash: updated.txHash,
      status: 'SUBMITTED',
      amount: updated.amount,
      assetSymbol: updated.assetSymbol,
      network: updated.network,
      recipientAddress: updated.recipientAddress,
    },
  });
}
