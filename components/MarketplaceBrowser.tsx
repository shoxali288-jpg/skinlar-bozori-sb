'use client';

import { SkinCard } from '@/components/SkinCard';
import type { Skin } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

export function MarketplaceBrowser() {
  const [allSkins, setAllSkins] = useState<Skin[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [weapon, setWeapon] = useState('');
  const [rarity, setRarity] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data.skins) {
          setAllSkins(data.skins);

          const weapons = [...new Set(data.skins.map((s: Skin) => s.weaponType))].sort();
          const rarities = [...new Map(data.skins.map((s: Skin) => [s.rarityKey, s.rarity])).entries()];

          const prices = data.skins.map((s: Skin) => s.priceUsd);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);

          setMinPrice(Number.isFinite(minP) ? minP : 0);
          setMaxPrice(Number.isFinite(maxP) ? maxP : 5_000_000);
          setLoaded(true);
        } else {
          setError('Ma\'lumot topilmadi');
          setLoaded(true);
        }
      })
      .catch(() => {
        setError('Serverga ulanishda xatolik');
        setLoaded(true);
      });
  }, []);

  const results = useMemo(() => {
    if (!loaded) return [];
    const query = q.trim().toLowerCase();
    let min = minPrice;
    let max = maxPrice;
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1e9;
    if (min > max) [min, max] = [max, min];

    return allSkins.filter((s) => {
      if (query) {
        const hay = `${s.name} ${s.weaponType} ${s.rarity} ${s.condition}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (weapon && s.weaponType !== weapon) return false;
      if (rarity && s.rarityKey !== rarity) return false;
      if (s.priceUsd < min || s.priceUsd > max) return false;
      return true;
    });
  }, [allSkins, q, weapon, rarity, minPrice, maxPrice, loaded]);

  const weapons = useMemo(
    () => [...new Set(allSkins.map((s) => s.weaponType))].sort(),
    [allSkins],
  );
  const rarities = useMemo(
    () => [...new Map(allSkins.map((s) => [s.rarityKey, s.rarity])).entries()],
    [allSkins],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-card/50 p-4 shadow-innerGlow sm:p-6">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Qidiruv
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Masalan: AK-47, AWP, Doppler..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-neon/50 focus:shadow-glow-sm"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Qurol turi
            </label>
            <select
              value={weapon}
              onChange={(e) => setWeapon(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-neon/50"
            >
              <option value="">Hammasi</option>
              {weapons.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Nadirlik
            </label>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-neon/50"
            >
              <option value="">Hammasi</option>
              {rarities.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Min narx
              </label>
              <input
                type="number"
                value={minPrice}
                min={0}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-neon/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Max narx
              </label>
              <input
                type="number"
                value={maxPrice}
                min={0}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-neon/50"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/55">
          <p>
            <span className="font-semibold text-white">{results.length}</span> ta natija
          </p>
          <button
            type="button"
            onClick={() => {
              setQ('');
              setWeapon('');
              setRarity('');
              setMinPrice(Math.min(...allSkins.map((s) => s.priceUsd)));
              setMaxPrice(Math.max(...allSkins.map((s) => s.priceUsd)));
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Filtrlarni tozalash
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : !loaded ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-2xl border border-white/10 bg-card/60" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-surface/40 p-10 text-center text-white/65">
          Hech narsa topilmadi. Boshqa kalit so‘z yoki filtrni sinab ko‘ring.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => (
            <SkinCard key={s.id} skin={s} />
          ))}
        </div>
      )}
    </div>
  );
}
