import { NextResponse } from 'next/server';
import { assetBalances } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    prices: assetBalances.map((asset) => ({
      symbol: asset.symbol,
      network: asset.network,
      price: asset.price,
      retrievedAt: new Date().toISOString(),
    })),
  });
}
