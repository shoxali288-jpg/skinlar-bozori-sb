import { NextResponse } from 'next/server';
import { getAllSkins } from '@/lib/catalog';
import { getHiddenIds } from '@/lib/hidden-skins';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [skins, hidden] = await Promise.all([getAllSkins(), getHiddenIds()]);
  const filtered = skins.filter((s) => !hidden.includes(s.id));
  return NextResponse.json(
    { count: filtered.length, skins: filtered },
    { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
  );
}
