import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const { id } = await params;

  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
  }

  if (contact.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
