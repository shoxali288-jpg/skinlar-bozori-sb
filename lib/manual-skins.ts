import type { Skin } from '@/lib/types'

let manualSkins: Skin[] = []

function generateId(): string {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function addManualSkin(
  name: string,
  weaponType: string,
  condition: string,
  rarity: string,
  image: string,
  floatValue: number,
): Skin {
  const skin: Skin = {
    id: generateId(),
    name,
    weaponType: weaponType || 'Skin',
    rarity: rarity || 'Premium',
    rarityKey: 'premium',
    condition,
    float: floatValue,
    stattrak: name.includes('StatTrak'),
    priceUsd: 0,
    available: true,
    image: image || '/placeholder.png',
  }

  manualSkins.push(skin)
  return skin
}

export function removeManualSkin(id: string): boolean {
  const idx = manualSkins.findIndex((s) => s.id === id)
  if (idx === -1) return false
  manualSkins.splice(idx, 1)
  return true
}

export function getManualSkins(): Skin[] {
  return [...manualSkins]
}

export function getManualSkinsList(): { id: string; name: string }[] {
  return manualSkins.map((s) => ({ id: s.id, name: s.name }))
}
