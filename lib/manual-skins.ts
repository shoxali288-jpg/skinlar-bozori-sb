import type { Skin } from '@/lib/types'
import { put, list } from '@vercel/blob'

const BLOB_KEY = 'manual-skins.json'

let cache: Skin[] | null = null

function generateId(): string {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function loadFromBlob(): Promise<Skin[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      if (res.ok) {
        const data: Skin[] = await res.json()
        cache = data
        return data
      }
    }
    cache = []
  } catch {
    // Blob unavailable — keep cache=null so next call retries
  }
  return cache || []
}

async function saveToBlob(skins: Skin[]) {
  try {
    const json = JSON.stringify(skins)
    await put(BLOB_KEY, json, { contentType: 'application/json', access: 'public', addRandomSuffix: false })
  } catch (e) {
    console.error('Blob save error:', e)
  }
}

async function ensureLoaded(): Promise<Skin[]> {
  if (cache === null) {
    return await loadFromBlob()
  }
  return cache
}

export async function addManualSkin(
  name: string,
  weaponType: string,
  condition: string,
  rarity: string,
  image: string,
  floatValue: number,
): Promise<Skin> {
  const skins = await ensureLoaded()
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
    source: 'manual',
  }
  skins.push(skin)
  cache = skins
  await saveToBlob(skins)
  return skin
}

export async function removeManualSkin(id: string): Promise<boolean> {
  const skins = await ensureLoaded()
  const idx = skins.findIndex((s) => s.id === id)
  if (idx === -1) return false
  skins.splice(idx, 1)
  cache = skins
  await saveToBlob(skins)
  return true
}

export async function getManualSkins(): Promise<Skin[]> {
  return [...(await ensureLoaded())]
}

export async function getManualSkinsList(): Promise<{ id: string; name: string }[]> {
  const skins = await ensureLoaded()
  return skins.map((s) => ({ id: s.id, name: s.name }))
}
