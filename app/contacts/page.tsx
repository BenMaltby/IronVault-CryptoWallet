import { Sidebar } from '@/components/layout/sidebar';
import { ContactManager } from '@/components/wallet/contact-manager';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import type { Contact } from '@/types';

export default async function ContactsPage() {
  const session = await requireSession();

  const rows = await prisma.contact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { name: 'asc' },
  });

  const contacts: Contact[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    address: c.address,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[256px_1fr]">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Address book</h1>
          <p className="mt-2 text-slate-400">Save frequently used addresses with a contact name.</p>
        </div>
        <ContactManager contacts={contacts} />
      </section>
    </main>
  );
}
