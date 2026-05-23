export type Skin = {
  id: string;
  name: string;
  weaponType: string;
  rarity: string;
  rarityKey: string;
  condition: string;
  float: number;
  stattrak: boolean;
  priceUsd: number;
  available: boolean;
  image: string;
  source: 'steam' | 'manual';
};

export type CartLine = {
  skin: Skin;
  qty: number;
  addedAt: number;
};

export type Order = {
  id: string;
  createdAt: number;
  totalUsd: number;
  items: { skinId: string; name: string; qty: number; priceUsd: number }[];
  status: 'kutilmoqda' | 'qayta ishlanmoqda' | 'yakunlangan';
};
