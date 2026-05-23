import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

export async function GET() {
  // Try local /tmp/ first
  const tmpPath = path.join('/tmp', 'welcome.jpg')
  if (fs.existsSync(tmpPath)) {
    const buf = fs.readFileSync(tmpPath)
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    })
  }

  // Try Blob storage
  try {
    const { blobs } = await list({ prefix: 'welcome.jpg', limit: 1 })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        // Cache in /tmp/ for next time
        try { fs.writeFileSync(tmpPath, buf) } catch {}
        return new NextResponse(buf, {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
        })
      }
    }
  } catch {}

  // Fallback to default logo
  const publicPath = path.join(process.cwd(), 'public', 'logo.jpg')
  if (fs.existsSync(publicPath)) {
    const buf = fs.readFileSync(publicPath)
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    })
  }
  return new NextResponse(null, { status: 404 })
}
