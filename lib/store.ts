import type { Skin } from '@/lib/types'

export type CustomSkin = Skin & { addedAt: string }

const customSkins: CustomSkin[] = []
let idCounter = 0

export function addCustomSkin(skin: Omit<CustomSkin, 'id' | 'addedAt'>) {
  idCounter++
  const entry: CustomSkin = {
    ...skin,
    id: `custom-${idCounter}`,
    addedAt: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
  }
  customSkins.unshift(entry)
  return entry
}

export function removeCustomSkin(id: string): boolean {
  const idx = customSkins.findIndex((s) => s.id === id)
  if (idx === -1) return false
  customSkins.splice(idx, 1)
  return true
}

export function getCustomSkins(): CustomSkin[] {
  return [...customSkins]
}

export function getCustomSkinById(id: string): CustomSkin | undefined {
  return customSkins.find((s) => s.id === id)
}

export function updateSkinPrice(id: string, priceUsd: number): boolean {
  const skin = customSkins.find((s) => s.id === id)
  if (!skin) return false
  skin.priceUsd = priceUsd
  return true
}

export function updateSkinImage(id: string, image: string): boolean {
  const skin = customSkins.find((s) => s.id === id)
  if (!skin) return false
  skin.image = image
  return true
}

export function updateSkinAvailable(id: string, available: boolean): boolean {
  const skin = customSkins.find((s) => s.id === id)
  if (!skin) return false
  skin.available = available
  return true
}

export function searchCustomSkins(query: string): CustomSkin[] {
  const q = query.toLowerCase().trim()
  if (!q) return getCustomSkins()
  return customSkins.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    s.weaponType.toLowerCase().includes(q) ||
    s.rarity.toLowerCase().includes(q) ||
    s.condition.toLowerCase().includes(q)
  )
}
