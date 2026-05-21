import { SkinDetailClient } from '@/components/SkinDetailClient';

export const dynamic = 'force-dynamic';

export default function SkinPage({ params }: { params: { id: string } }) {
  return <SkinDetailClient params={params} />;
}
