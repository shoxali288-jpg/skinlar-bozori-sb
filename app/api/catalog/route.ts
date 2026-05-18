import { NextResponse } from 'next/server';
import { getAllSkins } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const skins = await getAllSkins();
  return NextResponse.json(
    { count: skins.length, skins },
    { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
  );
}
