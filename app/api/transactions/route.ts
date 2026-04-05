import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { TransactionRecord } from '@/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get('walletId') ?? undefined;
  const direction = searchParams.get('direction') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const rows = await prisma.transaction.findMany({
    where: {
      wallet: { ownerId: session.user.id },
      ...(walletId ? { walletId } : {}),
      ...(direction ? { direction: direction as 'SEND' | 'RECEIVE' } : {}),
      ...(status ? { status: status as 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'FAILED' | 'CANCELLED' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const transactions: TransactionRecord[] = rows.map((row) => ({
    id: row.id,
    // Fall back to inferring direction from address fields for any legacy documents
    // that pre-date the direction field.
    type: (row.direction ?? (row.recipientAddress ? 'SEND' : 'RECEIVE')) === 'SEND' ? 'send' : 'receive',
    assetSymbol: row.assetSymbol,
    amount: row.amount,
    recipientAddress: row.recipientAddress ?? undefined,
    senderAddress: row.senderAddress ?? undefined,
    network: row.network as TransactionRecord['network'],
    status: row.status.toLowerCase() as TransactionRecord['status'],
    estimatedFee: row.estimatedFee,
    createdAt: row.createdAt.toISOString(),
    riskWarning: row.riskWarning ?? undefined,
  }));

  return NextResponse.json({ transactions });
}
