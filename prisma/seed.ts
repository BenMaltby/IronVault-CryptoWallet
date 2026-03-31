import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { encryptSecret, generateRecoveryPhrase } from '../lib/wallet';

async function main() {
  const passwordHash = await hashPassword('DemoPass123!');
  const encrypted = encryptSecret(generateRecoveryPhrase(), 'DemoPass123!');

  await prisma.user.upsert({
    where: { email: 'demo@ironvault.app' },
    update: {},
    create: {
      username: 'demo-user',
      email: 'demo@ironvault.app',
      passwordHash,
      wallets: {
        create: {
          name: 'Primary Test Wallet',
          network: 'Ethereum Sepolia',
          encryptedRecoveryPhrase: JSON.stringify(encrypted),
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
