import type { Skin } from '@/lib/types';
import { getCustomSkins } from '@/lib/store';
import https from 'https';

const STEAM_ID = '76561198712742591';
const CACHE_TTL = 5_000;

let cached: Skin[] | null = null;
let lastFetch = 0;

const UZS_PER_USD = 12800;

function fetchUrl(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 500, body: data }));
    }).on('error', reject);
  });
}

function extractWeaponType(name: string): string {
  const parts = name.split(' | ');
  if (parts.length > 1) return parts[0].trim()
  const lower = name.toLowerCase()
  if (lower.includes('case') || lower.includes('capsule')) return 'Case'
  if (lower.includes('sticker') || lower.includes('decal')) return 'Sticker'
  if (lower.includes('graffiti')) return 'Graffiti'
  if (lower.includes('patch')) return 'Patch'
  if (lower.includes('souvenir')) return 'Souvenir'
  if (lower.includes('key')) return 'Key'
  return name.replace(/\(.*\)/g, '').trim() || 'Other'
}

function extractCondition(name: string, desc: string): string {
  return (
    desc.match(/(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)/)?.[1] ||
    name.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/)?.[1] ||
    ''
  );
}

function extractRarity(tags: any[] | undefined): { key: string; label: string } {
  if (!tags) return { key: '', label: '' };
  for (const t of tags) {
    if (t.category === 'Rarity' || t.category === 'Quality') {
      return { key: t.internal_name || '', label: t.localized_tag_name || t.name || '' };
    }
  }
  return { key: '', label: '' };
}

function isStatTrak(name: string, tags: any[] | undefined): boolean {
  if (name.includes('StatTrak')) return true;
  return !!tags?.some((t: any) => t.internal_name === 'stattrak');
}

async function fetchFromSteam(): Promise<Skin[]> {
  const url = `https://steamcommunity.com/inventory/${STEAM_ID}/730/2?l=english&count=1000`;

  const { status, body } = await fetchUrl(url);
  if (status !== 200) return [];

  let raw: any;
  try {
    raw = JSON.parse(body);
  } catch {
    return [];
  }

  if (!raw?.assets || !raw?.descriptions) return [];

  const descMap = new Map<string, any>();
  for (const d of raw.descriptions) {
    descMap.set(`${d.classid}_${d.instanceid}`, d);
  }

  const floatMap = new Map<string, number>();
  if (raw.asset_properties) {
    for (const entry of raw.asset_properties) {
      const props = entry.asset_properties || [];
      for (const p of props) {
        if (p.name === 'Wear Rating' && p.float_value) {
          floatMap.set(entry.assetid, parseFloat(p.float_value));
          break;
        }
      }
    }
  }

  const skins: Skin[] = [];
  for (const asset of raw.assets) {
    const key = `${asset.classid}_${asset.instanceid}`;
    const desc = descMap.get(key);
    if (!desc) continue;

    const name = desc.market_hash_name || desc.name || 'Unknown';
    const iconUrl = desc.icon_url
      ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}`
      : '/placeholder.png';

    const descText = (desc.descriptions || []).map((d: any) => d.value || '').join(' ');
    const condition = extractCondition(name, descText);
    const weaponType = extractWeaponType(name);
    const rarity = extractRarity(desc.tags);
    const stattrak = isStatTrak(name, desc.tags);
    const floatVal = floatMap.get(asset.assetid) || 0;

    const usdPrice = Math.max(1, Math.round(floatVal * 500 + Math.random() * 200));
    const uzsPrice = usdPrice * UZS_PER_USD;

    skins.push({
      id: `steam-${asset.assetid}`,
      name,
      weaponType,
      rarity: rarity.label || 'Unknown',
      rarityKey: rarity.key || 'unknown',
      condition,
      float: floatVal,
      stattrak,
      priceUsd: uzsPrice,
      available: true,
      image: iconUrl,
    });
  }

  return skins;
}

export async function getAllSkins(): Promise<Skin[]> {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) return [...cached, ...getCustomSkins()];

  if (!lastFetch) {
    cached = await fetchFromSteam();
    lastFetch = now;
  } else {
    fetchFromSteam().then((s) => {
      cached = s;
      lastFetch = Date.now();
    });
  }

  const steam = cached || []
  return [...steam, ...getCustomSkins()];
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
