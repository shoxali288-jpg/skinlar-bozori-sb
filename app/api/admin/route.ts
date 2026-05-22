import { NextRequest, NextResponse } from 'next/server'
import { addCustomSkin, removeCustomSkin, getCustomSkins, getCustomSkinById, updateSkinPrice, updateSkinImage, updateSkinAvailable, searchCustomSkins } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'add': {
        const inputName = body.name || ''
        const info = parseSkinMeta(inputName)
        const skin = await addCustomSkin({
          name: inputName,
          image: body.image || '',
          weaponType: info.weaponType,
          rarity: info.rarity,
          rarityKey: info.rarity.toLowerCase(),
          condition: info.condition,
          float: parseFloat(body.float) || Math.round(Math.random() * 100) / 100,
          stattrak: info.stattrak,
          priceUsd: 0,
          available: true,
        })
        return NextResponse.json({ ok: true, skin })
      }

      case 'update_price': {
        const ok = await updateSkinPrice(body.id, parseInt(body.price))
        return NextResponse.json({ ok })
      }

      case 'update_image': {
        const ok = await updateSkinImage(body.id, body.image)
        return NextResponse.json({ ok })
      }

      case 'toggle_available': {
        const skin = await getCustomSkinById(body.id)
        if (!skin) return NextResponse.json({ ok: false })
        const ok = await updateSkinAvailable(body.id, !skin.available)
        return NextResponse.json({ ok, available: !skin.available })
      }

      case 'delete': {
        const ok = await removeCustomSkin(body.id)
        return NextResponse.json({ ok })
      }

      case 'search': {
        const q = body.query || ''
        const skins = await searchCustomSkins(q)
        return NextResponse.json({ ok: true, skins })
      }

      case 'list': {
        const skins = await getCustomSkins()
        return NextResponse.json({ ok: true, skins })
      }

      default:
        return NextResponse.json({ ok: false, error: 'Unknown action' })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
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
