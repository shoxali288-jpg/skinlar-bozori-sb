import { NextRequest, NextResponse } from 'next/server'
import { addManualSkin, removeManualSkin, getManualSkins } from '@/lib/manual-skins'
import { getSteamSkinImage } from '@/lib/steam-image'

export async function GET() {
  const skins = await getManualSkins()
  return NextResponse.json(skins)
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
