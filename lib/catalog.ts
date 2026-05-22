import type { Skin } from '@/lib/types';
import { getCustomSkins } from '@/lib/store';

export async function getAllSkins(): Promise<Skin[]> {
  return getCustomSkins();
}

export async function getSkinById(id: string): Promise<Skin | undefined> {
  const all = await getAllSkins();
  return all.find((s) => s.id === id);
}

export async function getWeaponTypes(): Promise<string[]> {
  const all = await getAllSkins();
  const set = new Set<string>();
  for (const s of all) set.add(s.weaponType);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'uz'));
}

export async function getRarities(): Promise<{ key: string; label: string }[]> {
  const all = await getAllSkins();
  const map = new Map<string, string>();
  for (const s of all) {
    if (!map.has(s.rarityKey)) map.set(s.rarityKey, s.rarity);
  }
  return Array.from(map.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'uz'));
}

export type CatalogFilters = {
  q: string;
  weapon: string;
  rarity: string;
  minPrice: number;
  maxPrice: number;
};

export async function filterSkins(f: CatalogFilters): Promise<Skin[]> {
  const all = await getAllSkins();
  const q = f.q.trim().toLowerCase();
  let min = f.minPrice;
  let max = f.maxPrice;
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 1e9;
  if (min > max) [min, max] = [max, min];

  return all.filter((s) => {
    if (q) {
      const hay = `${s.name} ${s.weaponType} ${s.rarity} ${s.condition}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.weapon && s.weaponType !== f.weapon) return false;
    if (f.rarity && s.rarityKey !== f.rarity) return false;
    if (s.priceUsd < min || s.priceUsd > max) return false;
    return true;
  });
}

export async function priceBounds(): Promise<{ min: number; max: number }> {
  const all = await getAllSkins();
  let min = Infinity;
  let max = -Infinity;
  for (const s of all) {
    min = Math.min(min, s.priceUsd);
    max = Math.max(max, s.priceUsd);
  }
  if (!Number.isFinite(min)) return { min: 0, max: 5_000_000 };
  return { min, max };
}
