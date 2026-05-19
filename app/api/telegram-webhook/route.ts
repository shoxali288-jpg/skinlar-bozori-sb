import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ADMIN_USERNAME = 'shoxsvoy'
const SITE_URL = 'https://skinlar-bozori-sb.vercel.app'

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

let users: Set<number> = new Set()

async function callTelegram(method: string, body: Record<string, unknown>) {
  await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function sendMessage(chatId: number, text: string, extra?: Record<string, unknown>) {
  await callTelegram('sendMessage', { chat_id: chatId, text, ...extra })
}

async function sendWelcome(chatId: number) {
  const text = `Assalomu alaykum.

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

async function sendAdminMenu(chatId: number) {
  const text = `🔐 <b>Admin panel</b>

Xush kelibsiz, @${ADMIN_USERNAME}!

Quyidagi bo'limlardan birini tanlang:`

  await sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Saytni ochish', url: SITE_URL }],
        [{ text: '👥 Foydalanuvchilar', callback_data: 'admin_users' }],
        [{ text: '➕ Skin qo\'shish', callback_data: 'admin_add_skin' }],
        [{ text: '📊 Statistika', callback_data: 'admin_stats' }],
        [{ text: '🔄 Yangilash', callback_data: 'admin_refresh' }],
      ],
    },
  })
}

async function handleAdminCallback(chatId: number, callbackData: string) {
  switch (callbackData) {
    case 'admin_users': {
      const count = users.size
      const list = Array.from(users).join(', ') || 'Hali foydalanuvchilar yo\'q'
      await sendMessage(chatId, `👥 <b>Foydalanuvchilar:</b> ${count}\n\nChat ID: ${list}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]],
        },
      })
      break
    }
    case 'admin_stats': {
      await sendMessage(
        chatId,
        `📊 <b>Statistika</b>\n\nFoydalanuvchilar: ${users.size}`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] } },
      )
      break
    }
    case 'admin_add_skin': {
      await sendMessage(
        chatId,
        `➕ <b>Skin qo'shish</b>\n\nMenga Steam Market linkini yuboring.\n\nMasalan:\n<code>https://steamcommunity.com/market/listings/730/AK-47%20|%20Redline%20(Field-Tested)</code>`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] } },
      )
      break
    }
    case 'admin_refresh': {
      await sendMessage(chatId, '🔄 Sayt yangilanmoqda...', {
        reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] },
      })
      break
    }
    case 'admin_back':
      await sendAdminMenu(chatId)
      break
  }
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
  }

  try {
    const update = await request.json()

    if (update.callback_query) {
      const { data, message } = update.callback_query
      const chatId = message.chat.id
      await handleAdminCallback(chatId, data)
      return NextResponse.json({ ok: true })
    }

    if (update.message) {
      const { chat, text, from } = update.message
      const chatId = chat.id
      const username = from?.username || ''

      users.add(chatId)

      if (!text) {
        await sendMessage(chatId, 'Фақат матнли хабарларни қабул қиламан')
        return NextResponse.json({ ok: true })
      }

      // Admin check
      if (username.toLowerCase() === ADMIN_USERNAME) {
        // Check if it's a Steam market link
        if (text.includes('steamcommunity.com/market/listings')) {
          const skinName = decodeURIComponent(text.split('/listings/730/')[1] || '')
          await sendMessage(
            chatId,
            `✅ <b>Skin topildi!</b>\n\n${skinName.replace(/%20/g, ' ')}\n\nHozircha qo'lda qo'shiladi. Admin bilan bog'lanib skin nomini tasdiqlang.`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_back' }]] } },
          )
          return NextResponse.json({ ok: true })
        }

        const cmd = text.toLowerCase()
        switch (cmd) {
          case '/admin':
          case '/panel':
          case '🔐 admin':
            await sendAdminMenu(chatId)
            break
          default:
            await sendAdminMenu(chatId)
        }
        return NextResponse.json({ ok: true })
      }

      // Regular user
      await sendWelcome(chatId)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
