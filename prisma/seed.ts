import {prisma} from '@/lib/prisma';
import {hashPassword} from '@/lib/auth';
import {generateRecoveryPhrase} from "@/lib/wallet";
import {encryptSecretBundle} from '@/lib/crypto/vault';

async function main() {
  const passwordHash = await hashPassword('DemoPass123!');
  const demoPhrase = generateRecoveryPhrase();
  const encryptedPayload = await encryptSecretBundle('DemoPass123!Demo', {
    type: 'recovery-phrase',
    recoveryPhrase: demoPhrase,
  });

  const demoUsers = [
    { username: 'admin-user', email: 'admin@ironvault.app', role: 'ADMIN' as const },
    { username: 'developer-user', email: 'developer@ironvault.app', role: 'DEVELOPER' as const },
    { username: 'beginner-user', email: 'beginner@ironvault.app', role: 'BEGINNER_TRADER' as const },
    { username: 'trader-user', email: 'trader@ironvault.app', role: 'GENERIC_TRADER' as const },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        role: user.role,
        passwordHash,
      },
      create: {
        username: user.username,
        email: user.email,
        role: user.role,
        passwordHash,
        wallets: {
          create: {
            name: 'Primary Test Wallet',
            network: 'Ethereum Sepolia',
            encryptedRecoveryPhrase: JSON.stringify(encryptedPayload),
            vault: {
              create: {
                vaultVersion: 1,
                keyVersion: encryptedPayload.keyVersion,
                recoverySecrets: {
                  create: {
                    secretType: 'RECOVERY_PHRASE',
                    label: 'Seeded recovery phrase',
                    encryptedPayload,
                  },
                },
              },
            },
            addresses: {
              create: {
                label: 'Main',
                address: '0x9Bf2A3b0e487C8Dc1A7c8319143454B2e04f11Af',
                network: 'Ethereum Sepolia',
              },
            },
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });