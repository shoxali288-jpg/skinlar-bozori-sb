import { getAllSkins, getSkinById } from '@/lib/catalog';
import { SkinDetailClient } from '@/components/SkinDetailClient';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skin = await getSkinById(params.id);
  if (!skin) return { title: 'Topilmadi' };
  return { title: skin.name };
}

export default async function SkinPage({ params }: Props) {
  const skin = await getSkinById(params.id);
  if (!skin) notFound();

  return <SkinDetailClient skin={skin} />;
}
