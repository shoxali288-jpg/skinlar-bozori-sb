export function extractSteamId(tradeUrl: string): string | null {
  if (!tradeUrl) return null;

  const partnerMatch = tradeUrl.match(/partner=(\d+)/);
  if (partnerMatch) {
    const partnerId = parseInt(partnerMatch[1], 10);
    return partnerIdToSteamId(partnerId);
  }

  const profileMatch = tradeUrl.match(/profiles\/(\d+)/);
  if (profileMatch) return profileMatch[1];

  const idMatch = tradeUrl.match(/steamid\/(\d+)/);
  if (idMatch) return idMatch[1];

  const digitsOnly = tradeUrl.replace(/\D/g, '');
  if (/^\d{17}$/.test(digitsOnly)) return digitsOnly;

  return null;
}

function partnerIdToSteamId(partnerId: number): string {
  return (BigInt(partnerId) + BigInt('76561197960265728')).toString();
}

export interface SteamInventoryItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: number;
  name: string;
  market_hash_name: string;
  icon_url: string;
  rarity: string;
  tradable: boolean;
  commodity: boolean;
  type: string;
  wear: string;
  stattrak: boolean;
}

export interface SteamInventoryResult {
  items: SteamInventoryItem[];
  steamId: string;
}

export function parseInventory(raw: any): SteamInventoryItem[] {
  if (!raw?.assets || !raw?.descriptions) return [];

  const descMap = new Map<string, any>();
  for (const d of raw.descriptions) {
    descMap.set(`${d.classid}_${d.instanceid}`, d);
  }

  const items: SteamInventoryItem[] = [];
  for (const asset of raw.assets) {
    const key = `${asset.classid}_${asset.instanceid}`;
    const desc = descMap.get(key);
    if (!desc) continue;

    const name = desc.market_hash_name || desc.name || 'Unknown';
    const type = desc.type || '';
    const iconUrl = desc.icon_url
      ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}`
      : '';

    let wear: string;
    const descText = (desc.descriptions || [])
      .map((d: any) => d.value || '')
      .join(' ');
    const wearMatch = descText.match(/(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)/);
    if (wearMatch) {
      wear = wearMatch[1];
    } else if (desc.market_hash_name) {
      const marketMatch = desc.market_hash_name.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/);
      wear = marketMatch ? marketMatch[1] : '';
    } else {
      wear = '';
    }

    const stattrak = name.includes('StatTrak') || desc.tags?.some((t: any) => t.category === 'Quality' && t.internal_name === 'stattrak');

    items.push({
      assetid: asset.assetid,
      classid: asset.classid,
      instanceid: asset.instanceid,
      amount: parseInt(asset.amount) || 1,
      name,
      market_hash_name: desc.market_hash_name || '',
      icon_url: iconUrl,
      rarity: desc.rarity || '',
      tradable: desc.tradable === 1,
      commodity: desc.commodity === 1,
      type,
      wear,
      stattrak,
    });
  }

  return items;
}
