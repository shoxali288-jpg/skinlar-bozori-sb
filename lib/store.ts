import { Redis } from '@upstash/redis'
import type { Skin } from '@/lib/types'

export type CustomSkin = Skin & { addedAt: string }

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const KEY = 'custom_skins'
const CNT = 'skin_counter'

const fallback: CustomSkin[] = []
let fbCnt = 0

function serialize(skins: CustomSkin[]) {
  return JSON.stringify(skins)
}
function deserialize(raw: string): CustomSkin[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export async function addCustomSkin(skin: Omit<CustomSkin, 'id' | 'addedAt'>) {
  const addedAt = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
  if (redis) {
    const n = await redis.incr(CNT)
    const entry: CustomSkin = { ...skin, id: `custom-${n}`, addedAt }
    await redis.lpush(KEY, JSON.stringify(entry))
    return entry
  }
  fbCnt++
  const entry: CustomSkin = { ...skin, id: `custom-${fbCnt}`, addedAt }
  fallback.unshift(entry)
  return entry
}

export async function removeCustomSkin(id: string): Promise<boolean> {
  if (redis) {
    const raw = await redis.lrange(KEY, 0, -1)
    const skins = raw.map((s) => JSON.parse(s as string))
    const idx = skins.findIndex((s: CustomSkin) => s.id === id)
    if (idx === -1) return false
    skins.splice(idx, 1)
    await redis.del(KEY)
    if (skins.length) await redis.lpush(KEY, ...skins.map((s: CustomSkin) => JSON.stringify(s)))
    return true
  }
  const idx = fallback.findIndex((s) => s.id === id)
  if (idx === -1) return false
  fallback.splice(idx, 1)
  return true
}

export async function getCustomSkins(): Promise<CustomSkin[]> {
  if (redis) {
    const raw = await redis.lrange(KEY, 0, -1)
    return raw.map((s) => JSON.parse(s as string))
  }
  return [...fallback]
}

export async function getCustomSkinById(id: string): Promise<CustomSkin | undefined> {
  const all = await getCustomSkins()
  return all.find((s) => s.id === id)
}

async function updateAll(skins: CustomSkin[]) {
  if (redis) {
    await redis.del(KEY)
    if (skins.length) await redis.lpush(KEY, ...skins.map((s) => JSON.stringify(s)))
    return
  }
  fallback.length = 0
  fallback.push(...skins)
}

export async function updateSkinPrice(id: string, priceUsd: number): Promise<boolean> {
  const all = await getCustomSkins()
  const skin = all.find((s) => s.id === id)
  if (!skin) return false
  skin.priceUsd = priceUsd
  await updateAll(all)
  return true
}

export async function updateSkinImage(id: string, image: string): Promise<boolean> {
  const all = await getCustomSkins()
  const skin = all.find((s) => s.id === id)
  if (!skin) return false
  skin.image = image
  await updateAll(all)
  return true
}

export async function updateSkinAvailable(id: string, available: boolean): Promise<boolean> {
  const all = await getCustomSkins()
  const skin = all.find((s) => s.id === id)
  if (!skin) return false
  skin.available = available
  await updateAll(all)
  return true
}

export async function searchCustomSkins(query: string): Promise<CustomSkin[]> {
  const q = query.toLowerCase().trim()
  if (!q) return await getCustomSkins()
  const all = await getCustomSkins()
  return all.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    s.weaponType.toLowerCase().includes(q) ||
    s.rarity.toLowerCase().includes(q) ||
    s.condition.toLowerCase().includes(q)
  )
}
