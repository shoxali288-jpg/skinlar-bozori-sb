import { SkinDetailClient } from '@/components/SkinDetailClient';
import { getAllSkins } from '@/lib/catalog';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SkinPage({ params }: { params: { id: string } }) {
  const skins = await getAllSkins();
  const skin = skins.find((s) => s.id === params.id);
  if (!skin) notFound();
  return <SkinDetailClient skin={skin} />;
}
