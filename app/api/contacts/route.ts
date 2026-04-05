import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { validateEvmAddress } from '@/lib/wallet';

const schema = z.object({
  name: z.string().trim().min(1).max(50),
  address: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, address } = parsed.data;

  if (!validateEvmAddress(address)) {
    return NextResponse.json({ error: 'Invalid address format.' }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { name, address, ownerId: session.user.id },
  });

  return NextResponse.json(
    { contact: { id: contact.id, name: contact.name, address: contact.address, createdAt: contact.createdAt } },
    { status: 201 },
  );
}
