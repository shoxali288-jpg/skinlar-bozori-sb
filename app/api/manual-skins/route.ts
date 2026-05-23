import { NextRequest, NextResponse } from 'next/server'
import { addManualSkin, removeManualSkin, getManualSkins } from '@/lib/manual-skins'
import { getSteamSkinImage } from '@/lib/steam-image'
import { getAllSkins } from '@/lib/catalog'
import { getHiddenIds, hideSkin, unhideSkin } from '@/lib/hidden-skins'

export async function GET() {
  const [manualSkins] = await Promise.all([getManualSkins()])
  return NextResponse.json(manualSkins)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name } = body
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const parts = name.split(' | ')
  const weaponType = parts.length > 1 ? parts[0].trim() : ''
  const imgUrl = body.image || await getSteamSkinImage(name)

  const skin = await addManualSkin(name, weaponType, '', '', imgUrl, 0)
  return NextResponse.json(skin)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const ok = await removeManualSkin(id)
  return NextResponse.json({ ok })
}

// Admin endpoint: all skins + hidden IDs for the admin panel
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { action, skinId } = body
  if (!skinId) return NextResponse.json({ error: 'skinId required' }, { status: 400 })

  if (action === 'hide') {
    await hideSkin(skinId)
    return NextResponse.json({ ok: true })
  }
  if (action === 'unhide') {
    await unhideSkin(skinId)
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
export async function PUT() {
  const [allSkins, hidden] = await Promise.all([getAllSkins(), getHiddenIds()])
  return NextResponse.json({ allSkins, hidden })
}
