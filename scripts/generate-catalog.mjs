import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'lib', 'catalog-data.json');
const TARGET = 350;

const WEAR_ORDER = [
  'Factory New',
  'Minimal Wear',
  'Field-Tested',
  'Well-Worn',
  'Battle-Scarred',
];

const RARITY_UZ = {
  rarity_default: 'Oddiy',
  rarity_common: 'Keng tarqalgan',
  rarity_uncommon: 'Yuqori sifat',
  rarity_rare: 'Noodatiy',
  rarity_mythical: 'Ajoyib',
  rarity_legendary: 'Mifik',
  rarity_ancient: 'Ekstraordinar',
  rarity_contraband: 'Kontrabanda',
  rarity_uncommon_weapon: 'Yuqori sifat',
  rarity_rare_weapon: 'Noodatiy',
  rarity_mythical_weapon: 'Ajoyib',
  rarity_legendary_weapon: 'Mifik',
  rarity_ancient_weapon: 'Yashirin (Covert)',
};

const WEAR_UZ = {
  'Factory New': 'Zavod yangi',
  'Minimal Wear': 'Yengil eskirgan',
  'Field-Tested': 'Sinovdan oʻtgan',
  'Well-Worn': 'Yaxshi eskirgan',
  'Battle-Scarred': 'Jangdan charchagan',
};

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function normalizeImageUrl(u) {
  if (typeof u !== 'string' || !u.startsWith('http')) return '';
  return u
    .replace(/^http:\/\//i, 'https://')
    .replace(
      'https://community.cloudflare.steamstatic.com',
      'https://community.akamai.steamstatic.com',
    );
}

async function imageLoads(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-8192',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'image/webp,image/*,*/*;q=0.8',
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.ok || res.status === 206;
  } catch {
    clearTimeout(t);
    return false;
  }
}

async function verifyUrlsParallel(urls, concurrency = 12) {
  const good = new Set();
  const list = [...urls];
  let next = 0;
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= list.length) break;
      const cur = list[i];
      if (!cur) continue;
      if (await imageLoads(cur)) good.add(cur);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return good;
}

/** Official in-game style: keep API `name`; StatTrak uses Valve-style prefix. */
function catalogDisplayName(skin, stattrak) {
  const raw = (skin.name || '').trim();
  if (!stattrak) return raw;
  if (raw.startsWith('★')) {
    const rest = raw.replace(/^★\s*/, '').trim();
    return `★ StatTrak™ ${rest}`;
  }
  return `StatTrak™ ${raw}`;
}

function floatForWear(skin, wearName) {
  const min = typeof skin.min_float === 'number' ? skin.min_float : 0;
  const max = typeof skin.max_float === 'number' ? skin.max_float : 1;
  const span = Math.max(0.0001, max - min);
  const bands = {
    'Factory New': [0, 0.07],
    'Minimal Wear': [0.07, 0.15],
    'Field-Tested': [0.15, 0.38],
    'Well-Worn': [0.38, 0.45],
    'Battle-Scarred': [0.45, 1],
  };
  const [lo, hi] = bands[wearName] ?? [0, 1];
  const a = min + span * lo;
  const b = Math.min(max, min + span * hi);
  const t = (hashSeed(`${skin.id}|${wearName}|float`) % 10000) / 10000;
  const v = a + (b - a) * t;
  return Math.round(Math.min(max, Math.max(min, v)) * 100000) / 100000;
}

function basePrice(skin) {
  const tier = {
    rarity_default: 8,
    rarity_common: 18,
    rarity_uncommon: 45,
    rarity_rare: 120,
    rarity_mythical: 280,
    rarity_legendary: 620,
    rarity_ancient: 1800,
    rarity_contraband: 4200,
  }[skin.rarity?.id] ?? 55;
  const cat = skin.category?.name ?? '';
  const mult =
    cat === 'Knives' || cat === 'Gloves'
      ? 2.8
      : cat === 'Sniper Rifles'
        ? 1.35
        : 1;
  const jitter = 0.75 + (hashSeed(skin.id) % 50) / 100;
  return Math.max(3, Math.round(tier * mult * jitter));
}

function priceFor(skin, wearName, stattrak) {
  const wearMul = {
    'Factory New': 2.35,
    'Minimal Wear': 1.75,
    'Field-Tested': 1.15,
    'Well-Worn': 0.92,
    'Battle-Scarred': 0.68,
  };
  let p = basePrice(skin) * (wearMul[wearName] ?? 1);
  if (stattrak) p *= 1.52;
  return Math.max(2, Math.round(p));
}

function isOfficialName(name) {
  if (typeof name !== 'string') return false;
  const t = name.trim();
  // Valve format: "Weapon | Finish" (knives/gloves may start with ★)
  return t.includes(' | ') && t.length > 5;
}

async function main() {
  const local = process.env.SKINS_JSON || path.join(__dirname, '..', 'data', 'skins.json');
  let raw;
  if (fs.existsSync(local)) {
    raw = JSON.parse(fs.readFileSync(local, 'utf8'));
  } else {
    const url =
      'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch skins failed: ${res.status}`);
    raw = await res.json();
  }

  const candidates = raw.filter(
    (s) =>
      s?.weapon?.name &&
      isOfficialName(s.name) &&
      typeof s.image === 'string' &&
      normalizeImageUrl(s.image),
  );

  const seenBase = new Set();
  const byWeapon = new Map();
  for (const s of candidates) {
    const key = `${s.weapon?.id ?? s.weapon?.name}|${s.pattern?.id ?? s.pattern?.name ?? s.paint_index ?? ''}`;
    if (seenBase.has(key)) continue;
    seenBase.add(key);
    const wn = s.weapon.name;
    if (!byWeapon.has(wn)) byWeapon.set(wn, []);
    byWeapon.get(wn).push(s);
  }

  for (const arr of byWeapon.values()) {
    arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en'));
  }

  /** Round-robin across weapons so the first N listings are not all one rifle. */
  const weaponKeys = [...byWeapon.keys()].sort((a, b) => a.localeCompare(b, 'en'));
  const idx = Object.fromEntries(weaponKeys.map((k) => [k, 0]));
  const bases = [];
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const w of weaponKeys) {
      const arr = byWeapon.get(w);
      const i = idx[w];
      if (i < arr.length) {
        bases.push(arr[i]);
        idx[w] = i + 1;
        progressed = true;
      }
    }
  }

  /** Steam CDN often returns 403 to non-browser clients; browsers still load icons. */
  const verifyImages = process.env.VERIFY_STEAM_IMAGES === '1';
  let goodUrls = null;
  if (verifyImages) {
    const uniqueUrls = [...new Set(bases.map((s) => normalizeImageUrl(s.image)).filter(Boolean))];
    console.log('Verifying', uniqueUrls.length, 'unique economy image URLs (VERIFY_STEAM_IMAGES=1)…');
    goodUrls = await verifyUrlsParallel(uniqueUrls, 14);
  }

  const out = [];
  let seq = 0;

  for (const skin of bases) {
    if (out.length >= TARGET) break;

    const image = normalizeImageUrl(skin.image);
    if (verifyImages && goodUrls && !goodUrls.has(image)) continue;

    const wears = (
      skin.wears?.length ? skin.wears : WEAR_ORDER.map((n) => ({ name: n }))
    ).filter((w) => WEAR_UZ[w.name]);

    const rarityUz = RARITY_UZ[skin.rarity?.id] ?? skin.rarity?.name ?? 'Nomaʼlum';
    const rarityKey = skin.rarity?.id ?? 'rarity_common';

    for (const w of wears) {
      if (out.length >= TARGET) break;
      const wearName = w.name;
      if (!WEAR_UZ[wearName]) continue;

      const floatVal = floatForWear(skin, wearName);
      const canSt = skin.stattrak === true;
      const variants = canSt ? [false, true] : [false];

      for (const stattrak of variants) {
        if (out.length >= TARGET) break;

        const id = `sb-${seq++}`;
        out.push({
          id,
          name: catalogDisplayName(skin, stattrak),
          weaponType: skin.weapon.name,
          rarity: rarityUz,
          rarityKey,
          condition: WEAR_UZ[wearName],
          float: floatVal,
          stattrak,
          priceUsd: priceFor(skin, wearName, stattrak),
          available: hashSeed(id) % 19 !== 0,
          image,
        });
      }
    }
  }

  if (out.length !== TARGET) {
    throw new Error(
      `Need exactly ${TARGET} skins, got ${out.length}. Try SKINS_JSON with full skins.json or check network.`,
    );
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
  console.log('Wrote', out.length, 'skins to', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
