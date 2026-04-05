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

  // Check whether the recipient address belongs to a wallet inside IronVault.
  // If it does, we credit their balance as part of the same atomic transaction —
  // simulating what a real blockchain does when it settles a transfer.
  const recipientWalletAddress = transaction.recipientAddress
    ? await prisma.walletAddress.findFirst({
        where: { address: transaction.recipientAddress },
      })
    : null;

  // Simulate broadcasting to the blockchain by generating a fake transaction hash.
  // In a production wallet this would call an RPC provider (e.g. via ethers.js or viem).
  const fakeTxHash = '0x' + crypto.randomBytes(32).toString('hex');

  // Use the interactive transaction form so we can include conditional logic
  // (recipient credit + RECEIVE record) inside the same atomic write.
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Mark the send transaction as SUBMITTED.
    const updatedTx = await tx.transaction.update({
      where: { id },
      data: { status: 'SUBMITTED', txHash: fakeTxHash },
    });

    // 2. Decrement the sender's balance (amount + fee).
    await tx.balance.update({
      where: {
        walletId_assetSymbol_network: {
          walletId: transaction.walletId,
          assetSymbol: transaction.assetSymbol,
          network: transaction.network,
        },
      },
      data: { amount: { decrement: totalDebit } },
    });

    // 3. If the recipient address is registered in IronVault, credit their balance
    //    and create a RECEIVE transaction record so it appears in their history.
    if (recipientWalletAddress) {
      await tx.balance.upsert({
        where: {
          walletId_assetSymbol_network: {
            walletId: recipientWalletAddress.walletId,
            assetSymbol: transaction.assetSymbol,
            network: transaction.network,
          },
        },
        // Credit only the sent amount — fees are paid by the sender, not deducted from what arrives.
        update: { amount: { increment: transaction.amount } },
        create: {
          walletId: recipientWalletAddress.walletId,
          assetSymbol: transaction.assetSymbol,
          network: transaction.network,
          amount: transaction.amount,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: recipientWalletAddress.walletId,
          assetSymbol: transaction.assetSymbol,
          amount: transaction.amount,
          estimatedFee: 0,
          recipientAddress: transaction.recipientAddress,
          senderAddress: transaction.senderAddress,
          network: transaction.network,
          direction: 'RECEIVE',
          status: 'SUBMITTED',
          txHash: fakeTxHash,
        },
      });
    }

    return updatedTx;
  });

  return NextResponse.json({
    result: {
      id: updated.id,
      txHash: updated.txHash,
      status: 'SUBMITTED',
      amount: updated.amount,
      assetSymbol: updated.assetSymbol,
      network: updated.network,
      recipientAddress: updated.recipientAddress,
      internalTransfer: recipientWalletAddress !== null,
    },
  });
}
