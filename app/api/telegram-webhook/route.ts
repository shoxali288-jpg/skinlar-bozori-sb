import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const SITE_URL = 'https://skinlar-bozori-sb.vercel.app'

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function sendMessage(chatId: number, text: string, extra?: Record<string, unknown>) {
  const body: Record<string, unknown> = { chat_id: chatId, text, ...extra }
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function sendWelcome(chatId: number) {
  const text = `💜 Assalomu alaykum.

Skinlar Bozori'ga xush kelibsiz 🔥

Bu yerda siz:
🎯 CS2 skinlarni sotib olishingiz
💸 Skin sotishingiz
⚡ Eng yaxshi narxlarni topishingiz mumkin

🛒 Marketni ochish uchun pastdagi "SB" tugmasini bosing.

🚀 Tezkor • Ishonchli • Premium`

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: 'SB', url: SITE_URL }]],
    },
  })
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
  }

  try {
    const update = await request.json()

    if (update.message) {
      const { chat, text } = update.message
      const chatId = chat.id

      if (!text) {
        await sendMessage(chatId, 'Фақат матнли хабарларни қабул қиламан')
        return NextResponse.json({ ok: true })
      }

      const cmd = text.split(' ')[0].toLowerCase()

      switch (cmd) {
        case '/start':
          await sendWelcome(chatId)
          break
        default:
          await sendWelcome(chatId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
