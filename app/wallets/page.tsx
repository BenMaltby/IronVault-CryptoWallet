import { Sidebar } from '@/components/layout/sidebar';
import { WalletManager } from '@/components/wallet/wallet-manager';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export default async function WalletsPage() {
  const session = await requireSession();
  const wallets = await prisma.wallet.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      addresses: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <span className="badge">Wallet management</span>
          <h1 className="mt-3 text-3xl font-bold">Create and manage wallets</h1>
          <p className="mt-2 text-slate-400">
            Review all wallets on your account and create additional wallets for different networks or purposes.
          </p>
        </div>
        <WalletManager wallets={wallets} />
      </section>
    </main>
  );
}
