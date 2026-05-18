import { MarketplaceBrowser } from '@/components/MarketplaceBrowser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bozor',
};

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Bozor</h1>
      </div>
      <MarketplaceBrowser />
    </div>
  );
}
