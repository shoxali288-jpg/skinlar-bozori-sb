import { NextRequest, NextResponse } from 'next/server'
import { addManualSkin, removeManualSkin, getManualSkinsList, getManualSkins } from '@/lib/manual-skins'
import { getSteamSkinImage } from '@/lib/steam-image'
import fs from 'fs'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ADMIN_USERNAME = 'shoxsvoy'
const SITE_URL = 'https://skinlar-bozori-sb.vercel.app'

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

interface UserInfo {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

let users: Map<number, UserInfo> = new Map()
let lastBotMsg: Map<number, number> = new Map()
let welcomePhoto: string | null = null
let adminUserId: number | null = null

async function deletePrev(chatId: number) {
  const prevId = lastBotMsg.get(chatId)
  if (prevId) {
    try {
      await fetch(`${TELEGRAM_API}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: prevId }),
      })
    } catch {}
    lastBotMsg.delete(chatId)
  }
}

async function sendMessage(chatId: number, text: string, extra?: Record<string, unknown>) {
  await deletePrev(chatId)
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  })
  const data = await res.json()
  if (data.result?.message_id) {
    lastBotMsg.set(chatId, data.result.message_id)
  }
}

async function sendWelcome(chatId: number, noPhoto?: boolean) {
  const text = `Assalomu alaykum.

Skinlar Bozori'ga xush kelibsiz 🔥

Bu yerda siz:
🎯 CS2 skinlarni sotib olishingiz
💸 Skin sotishingiz
⚡ Eng yaxshi narxlarni topishingiz mumkin

🛒 Marketni ochish uchun pastdagi "SB" tugmasini bosing.

🚀 Tezkor • Ishonchli • Premium`

  if (noPhoto) {
    await sendMessage(chatId, text, {
      reply_markup: { inline_keyboard: [[{ text: 'SB', url: SITE_URL }]] },
    })
    return
  }

  await deletePrev(chatId)
  const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: welcomePhoto || `${SITE_URL}/api/welcome-photo`,
      caption: text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: 'SB', url: SITE_URL }]] },
    }),
  })
  const data = await res.json()
  if (data.result?.message_id) {
    lastBotMsg.set(chatId, data.result.message_id)
  }
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
        [{ text: '⚙️ Admin panel (Mini App)', web_app: { url: `${SITE_URL}/tg-admin` } }],
      ],
    },
  })
}

async function handleAdminCallback(chatId: number, callbackData: string) {
  switch (callbackData) {
    case 'admin_users': {
      const count = users.size
      if (count === 0) {
        await sendMessage(chatId, `👥 <b>Foydalanuvchilar:</b> 0\n\nHali foydalanuvchilar yo\'q`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]],
          },
        })
        break
      }
      
      let list = ''
      for (const [, info] of users) {
        const name = info.username 
          ? `@${info.username}` 
          : (info.first_name || '') + (info.last_name ? ` ${info.last_name}` : '')
        list += `• ${name || `ID: ${info.id}`}\n`
      }
      
      await sendMessage(chatId, `👥 <b>Foydalanuvchilar (${count}):</b>\n\n${list.trim()}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]],
        },
      })
      break
    }
    case 'admin_stats': {
      const manual = getManualSkins()
      await sendMessage(
        chatId,
        `📊 <b>Statistika</b>\n\n👥 Foydalanuvchilar: ${users.size}\n📦 Qo\'lda qo\'shilgan skinlar: ${manual.length}`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] } },
      )
      break
    }
    case 'admin_add_skin': {
      await sendMessage(
        chatId,
        `➕ <b>Skin qo'shish</b>\n\nSkin nomini yuboring yoki Steam Market linkini tashlang.\n\nMasalan:\n<code>AK-47 | Redline (Field-Tested)</code>\n\nRasm avtomatik topiladi.`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Bekor qilish', callback_data: 'admin_back' }]] } },
      )
      break
    }
    case 'admin_delete_skin': {
      const list = getManualSkinsList()
      if (list.length === 0) {
        await sendMessage(
          chatId,
          `➖ <b>Skin o'chirish</b>\n\nHozircha qo'lda qo'shilgan skinlar yo'q.`,
          { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] } },
        )
        break
      }
      
      const keyboard = list.map((s) => [{ text: s.name, callback_data: `admin_del_${s.id}` }])
      keyboard.push([{ text: '🔙 Orqaga', callback_data: 'admin_back' }])
      
      await sendMessage(
        chatId,
        `➖ <b>Skin o'chirish</b>\n\nO'chirmoqchi bo'lgan skinngni tanlang:`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } },
      )
      break
    }
    case 'admin_refresh': {
      await sendMessage(chatId, '🔄 Sayt yangilanmoqda... Sahifani qayta yuklang.', {
        reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_back' }]] },
      })
      break
    }
    case 'admin_back':
      await sendAdminMenu(chatId)
      break
    default: {
      if (callbackData.startsWith('admin_del_')) {
        const id = callbackData.slice('admin_del_'.length)
        const removed = removeManualSkin(id)
        if (removed) {
          await sendMessage(chatId, `✅ Skin o'chirildi!`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_back' }]] },
          })
        } else {
          await sendMessage(chatId, `❌ Skin topilmadi.`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_back' }]] },
          })
        }
      }
    }
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
      const { chat, text, from, photo } = update.message
      const chatId = chat.id
      const username = from?.username || ''

      if (!users.has(chatId)) {
        users.set(chatId, {
          id: chatId,
          username: from?.username,
          first_name: from?.first_name,
          last_name: from?.last_name,
        })
      }

      const isAdmin = username.toLowerCase() === ADMIN_USERNAME
      if (isAdmin) adminUserId = from.id

      // Photo → only admin can set welcome photo
      if (photo && photo.length > 0) {
        if (isAdmin || from.id === adminUserId) {
          const fileId = photo[photo.length - 1].file_id
          welcomePhoto = `${SITE_URL}/api/welcome-photo`
          // Download photo from Telegram and save to /tmp/
          try {
            const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
            const fileData = await fileRes.json()
            if (fileData.result?.file_path) {
              const imgRes = await fetch(`${TELEGRAM_API}/file/${BOT_TOKEN}/${fileData.result.file_path}`)
              const imgBuf = Buffer.from(await imgRes.arrayBuffer())
              fs.writeFileSync('/tmp/welcome.jpg', imgBuf)
            }
          } catch {}
          await sendMessage(chatId, `✅ Rasm saqlandi! Endi /start da shu rasm ko'rinadi.`)
          return NextResponse.json({ ok: true })
        }
        await sendMessage(chatId, 'Faqat matnli habarlarni qabul qilaman')
        return NextResponse.json({ ok: true })
      }

      if (!text) {
        await sendMessage(chatId, 'Faqat matnli habarlarni qabul qilaman')
        return NextResponse.json({ ok: true })
      }



      // /start → welcome with admin keyboard at bottom
      if (text.toLowerCase() === '/start') {
        if (isAdmin) {
          await deletePrev(chatId)
          const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              photo: welcomePhoto || `${SITE_URL}/api/welcome-photo`,
              caption: `Assalomu alaykum, Admin! 🔐\n\n👉 ${SITE_URL}\n\nSkin nomini yozib qo\'shing yoki pastdagi tugmani bosing.`,
              reply_markup: { keyboard: [[{ text: '🔐 Admin', web_app: { url: `${SITE_URL}/tg-admin` } }]], resize_keyboard: true },
            }),
          })
          const data = await res.json()
          if (data.result?.message_id) lastBotMsg.set(chatId, data.result.message_id)
        } else {
          await sendWelcome(chatId)
        }
        return NextResponse.json({ ok: true })
      }

      // Admin check
      if (isAdmin) {
        const cmd = text.toLowerCase()

        // Commands
        if (['/admin', '/panel', '🔐 admin', '🏠 admin menu', '🔙 admin panel'].includes(cmd) || text === '🔙 Admin panel') {
          await sendAdminMenu(chatId)
          return NextResponse.json({ ok: true })
        }

        // Steam market link → extract name and add
        if (text.includes('steamcommunity.com/market/listings')) {
          const skinName = decodeURIComponent(text.split('/listings/730/')[1] || '').replace(/%20/g, ' ')
          await sendMessage(chatId, `🔍 Rasm qidirilmoqda...`)
          
          const imgUrl = await getSteamSkinImage(skinName)
          const parts = skinName.split(' | ')
          const weaponType = parts.length > 1 ? parts[0].trim() : ''
          addManualSkin(skinName, weaponType, '', '', imgUrl, 0)
          
          await sendMessage(
            chatId,
            `✅ <b>Skin qo'shildi!</b>\n\n<b>${skinName}</b>\n\nSahifani yangilang, skin saytda ko'rinadi.`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_back' }]] } },
          )
          return NextResponse.json({ ok: true })
        }

        // Any other text → treat as skin name to add
        await sendMessage(chatId, `🔍 Rasm qidirilmoqda...`)
        const name = text.trim()
        const imgUrl = await getSteamSkinImage(name)
        const parts = name.split(' | ')
        const weaponType = parts.length > 1 ? parts[0].trim() : ''
        addManualSkin(name, weaponType, '', '', imgUrl, 0)
        
        await sendMessage(
          chatId,
          `✅ <b>Skin qo'shildi!</b>\n\n<b>${name}</b>\n\nSahifani yangilang, skin saytda ko'rinadi.`,
          { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_back' }]] } },
        )
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
