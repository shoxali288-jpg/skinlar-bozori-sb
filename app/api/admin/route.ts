import { NextRequest, NextResponse } from 'next/server'
import { addCustomSkin, removeCustomSkin, getCustomSkins, getCustomSkinById, updateSkinPrice, updateSkinImage, updateSkinAvailable, searchCustomSkins } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'add': {
        const parsed = await parseSkinNameFromWeb(body.name)
        if (!parsed || !parsed.image) {
          return NextResponse.json({ ok: false, error: 'Rasm topilmadi. Skin nomini tekshiring.' })
        }
        const priceUsd = 0
        const info = parseSkinMeta(parsed.name)
        const skin = addCustomSkin({
          name: parsed.name,
          image: parsed.image,
          weaponType: body.weaponType || info.weaponType,
          rarity: body.rarity || info.rarity,
          rarityKey: (body.rarity || info.rarity).toLowerCase(),
          condition: body.condition || info.condition,
          float: body.float ? parseFloat(body.float) : Math.round(Math.random() * 100) / 100,
          stattrak: info.stattrak,
          priceUsd,
          available: true,
        })
        return NextResponse.json({ ok: true, skin })
      }

      case 'fetch_image': {
        const parsed = await parseSkinNameFromWeb(body.name)
        if (!parsed || !parsed.image) {
          return NextResponse.json({ ok: false, error: 'Rasm topilmadi. Skin nomini tekshiring.' })
        }
        const info = parseSkinMeta(parsed.name)
        return NextResponse.json({ ok: true, name: parsed.name, image: parsed.image, ...info })
      }

      case 'update_price': {
        const ok = updateSkinPrice(body.id, parseInt(body.price))
        return NextResponse.json({ ok })
      }

      case 'update_image': {
        const ok = updateSkinImage(body.id, body.image)
        return NextResponse.json({ ok })
      }

      case 'toggle_available': {
        const skin = getCustomSkinById(body.id)
        if (!skin) return NextResponse.json({ ok: false })
        const ok = updateSkinAvailable(body.id, !skin.available)
        return NextResponse.json({ ok, available: !skin.available })
      }

      case 'delete': {
        const ok = removeCustomSkin(body.id)
        return NextResponse.json({ ok })
      }

      case 'search': {
        const q = body.query || ''
        const skins = searchCustomSkins(q)
        return NextResponse.json({ ok: true, skins })
      }

      case 'list': {
        const skins = getCustomSkins()
        return NextResponse.json({ ok: true, skins })
      }

      default:
        return NextResponse.json({ ok: false, error: 'Unknown action' })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
  }
}

async function parseSkinNameFromWeb(name: string): Promise<{ name: string; image: string } | null> {
  try {
    const encoded = encodeURIComponent(name.trim())
    const res = await fetch(`https://steamcommunity.com/market/listings/730/${encoded}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const html = await res.text()
    const imgMatch = html.match(/<img[^>]+id="itemimage[^>]+src="([^"]+)"/) ||
                     html.match(/<img[^>]+class="market_listing_largeimage[^>]+src="([^"]+)"/) ||
                     html.match(/"economy\/image\/([^"]+)"/)
    let image = ''
    if (imgMatch) {
      const src = imgMatch[1]
      if (src.startsWith('http')) image = src
      else if (src.includes('economy/image')) image = `https://community.akamai.steamstatic.com/economy/image/${src.replace('economy/image/', '')}`
      else image = `https://community.akamai.steamstatic.com/economy/image/${src}`
    }
    if (!image) return null
    const marketName = html.match(/<title>(.+?)<\/title>/)?.[1]?.replace('Steam Community Market :: ', '') || name
    return { name: marketName, image }
  } catch {
    return null
  }
}

function parseSkinMeta(name: string): { weaponType: string; rarity: string; condition: string; stattrak: boolean } {
  const stattrak = name.toLowerCase().includes('stattrak')
  const cleanName = name.replace(/StatTrak™?\s*/i, '')
  const parts = cleanName.split(' | ')
  const weaponType = parts.length > 1 ? parts[0].trim() : 'Other'
  const conditionMatch = cleanName.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/)
  const condition = conditionMatch ? conditionMatch[1] : ''
  let rarity = 'Premium'
  if (conditionMatch) {
    const c = conditionMatch[1]
    if (c === 'Factory New') rarity = 'Elite'
    else if (c === 'Minimal Wear') rarity = 'Premium'
    else if (c === 'Field-Tested') rarity = 'Premium'
    else rarity = 'Standard'
  }
  return { weaponType, rarity, condition, stattrak }
}
