import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'logo.jpg')
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath)
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    })
  }
  return new NextResponse(null, { status: 404 })
}
