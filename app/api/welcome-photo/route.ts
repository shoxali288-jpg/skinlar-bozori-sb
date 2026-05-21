import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join('/tmp', 'welcome.jpg')
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath)
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    })
  }
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
