import { NextResponse } from 'next/server';
import { z } from 'zod';
import { encryptSecret, generateRecoveryPhrase } from '@/lib/wallet';

const schema = z.object({
  walletName: z.string().min(2),
  passphrase: z.string().min(8),
  network: z.string().min(2),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recoveryPhrase = generateRecoveryPhrase();
  const encryptedVault = encryptSecret(recoveryPhrase, parsed.data.passphrase);

  return NextResponse.json({
    walletName: parsed.data.walletName,
    network: parsed.data.network,
    recoveryPhrase,
    encryptedVault,
    warning: 'Show the recovery phrase once, then store only ciphertext. Do not keep plaintext in your database.',
  });
}
