import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { encryptSecret, generateDemoEvmAddress, generateRecoveryPhrase } from '@/lib/wallet';

const schema = z.object({
  walletName: z.string().trim().min(2),
  passphrase: z.string().min(8),
  network: z.enum(['Ethereum Sepolia', 'Polygon Amoy', 'Base Sepolia']),
});

// Starting balances given to every new wallet so demo users can try sending immediately.
const STARTING_BALANCES: Record<string, { assetSymbol: string; amount: number }[]> = {
  'Ethereum Sepolia': [
    { assetSymbol: 'ETH', amount: 1.24 },
    { assetSymbol: 'USDC', amount: 500 },
  ],
  'Polygon Amoy': [
    { assetSymbol: 'MATIC', amount: 240 },
    { assetSymbol: 'USDC', amount: 200 },
  ],
  'Base Sepolia': [
    { assetSymbol: 'ETH', amount: 0.5 },
    { assetSymbol: 'USDC', amount: 640 },
  ],
};

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'You must be logged in to create a wallet.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recoveryPhrase = generateRecoveryPhrase();
  const encryptedVault = encryptSecret(recoveryPhrase, parsed.data.passphrase);
  const primaryAddress = generateDemoEvmAddress();

  const wallet = await prisma.wallet.create({
    data: {
      name: parsed.data.walletName,
      network: parsed.data.network,
      encryptedRecoveryPhrase: JSON.stringify(encryptedVault),
      ownerId: session.user.id,
      addresses: {
        create: {
          label: 'Main',
          address: primaryAddress,
          network: parsed.data.network,
        },
      },
    },
    include: {
      addresses: { orderBy: { createdAt: 'asc' } },
    },
  });

  // Create starting balances for the new wallet.
  const seedBalances = STARTING_BALANCES[parsed.data.network] ?? [];
  await prisma.balance.createMany({
    data: seedBalances.map(({ assetSymbol, amount }) => ({
      walletId: wallet.id,
      assetSymbol,
      network: parsed.data.network,
      amount,
    })),
  });

  return NextResponse.json({
    wallet: {
      id: wallet.id,
      name: wallet.name,
      network: wallet.network,
      addresses: wallet.addresses,
      createdAt: wallet.createdAt,
    },
    recoveryPhrase,
    encryptedVault,
    warning: 'Show the recovery phrase once, then store only ciphertext. Do not keep plaintext in your database.',
  });
}
