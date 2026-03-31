import { NextResponse } from 'next/server';
import { supportedNetworks } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({ networks: supportedNetworks });
}
