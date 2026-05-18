'use client';

import { useProfile } from '@/lib/profile-context';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { SteamInventoryItem } from '@/lib/steam';

export function SteamInventory() {
  const { profile } = useProfile();
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = useCallback(async () => {
    if (!profile.steamTradeUrl) {
      setError('Avval Steam ID yoki profil URL kiriting.');
      return;
    }

    setLoading(true);
    setError('');
    setItems([]);

    try {
      const res = await fetch(`/api/inventory?q=${encodeURIComponent(profile.steamTradeUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Xatolik yuz berdi.');
        return;
      }

      setItems(data.items || []);
    } catch {
      setError('Serverga ulanishda xatolik.');
    } finally {
      setLoading(false);
    }
  }, [profile.steamTradeUrl]);

  const [didAutoFetch, setDidAutoFetch] = useState(false);

  useEffect(() => {
    if (profile.steamTradeUrl && !didAutoFetch) {
      setDidAutoFetch(true);
      fetchInventory();
    }
  }, [profile.steamTradeUrl, didAutoFetch, fetchInventory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Mening Steam inventarim
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-white/45">
              {items.length} ta skin
            </span>
          )}
        </h2>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="rounded-xl border border-neon/30 bg-gradient-to-r from-neon-dim to-neon px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Yuklanmoqda...' : 'Inventarni yuklash'}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {items.length === 0 && !loading && !error ? (
        <div className="rounded-2xl border border-white/10 bg-surface/40 p-8 text-center text-sm text-white/45">
          Inventarni ko&apos;rish uchun &quot;Inventarni yuklash&quot; tugmasini bosing.
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] animate-pulse rounded-2xl border border-white/10 bg-card/60"
            />
          ))}
        </div>
      ) : null}

      {items.length > 0 && !loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <InventoryCard key={item.assetid} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InventoryCard({ item }: { item: SteamInventoryItem }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-[0_0_0_1px_rgba(168,85,247,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-neon/35 hover:shadow-glow">
      <div className="relative px-4 pb-0 pt-4">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.2),transparent_55%)]" />
        </div>
        <div className="relative flex h-[200px] w-full items-center justify-center rounded-xl bg-black/30">
          {item.icon_url ? (
            <Image
              src={item.icon_url}
              alt={item.name}
              fill
              sizes="280px"
              className="object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.75)] transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="text-sm text-white/30">No image</div>
          )}
        </div>
        {item.stattrak ? (
          <span className="absolute left-6 top-7 z-10 rounded-lg bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
            StatTrak™
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
          {item.type || item.market_hash_name.split(' | ')[0] || 'Skin'}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {item.name}
        </h3>
        {item.wear ? (
          <span className="w-fit rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/5">
            {item.wear}
          </span>
        ) : null}
        <p className="text-[11px] text-white/40">
          {item.tradable ? 'Savdo mumkin' : 'Savdo yo\'q'}
        </p>
      </div>
    </div>
  );
}
