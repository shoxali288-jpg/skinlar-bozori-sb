import { put, list } from '@vercel/blob'

const BLOB_KEY = 'hidden-skins.json'

let cache: string[] | null = null

async function loadFromBlob(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      if (res.ok) {
        const data: string[] = await res.json()
        cache = data
        return data
      }
    }
    cache = []
  } catch {}
  return cache || []
}

async function saveToBlob(ids: string[]) {
  try {
    await put(BLOB_KEY, JSON.stringify(ids), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    })
  } catch (e) {
    console.error('Hidden skins save error:', e)
  }
}

export async function getHiddenIds(): Promise<string[]> {
  return [...(await loadFromBlob())]
}

export async function hideSkin(id: string) {
  const ids = await loadFromBlob()
  if (!ids.includes(id)) {
    ids.push(id)
    cache = ids
    await saveToBlob(ids)
  }
}

export async function unhideSkin(id: string) {
  const ids = await loadFromBlob()
  const filtered = ids.filter((i) => i !== id)
  if (filtered.length !== ids.length) {
    cache = filtered
    await saveToBlob(filtered)
  }
}
