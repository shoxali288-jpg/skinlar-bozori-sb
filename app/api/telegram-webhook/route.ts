import { NextRequest, NextResponse } from 'next/server'
import { addCustomSkin, removeCustomSkin, getCustomSkins, getCustomSkinById, updateSkinPrice, updateSkinImage, updateSkinAvailable } from '@/lib/store'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ADMIN_ID = 6474297315
const SITE_URL = process.env.SITE_URL || process.env.APP_URL || 'https://skinlar-bozori-sb.vercel.app'
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function callTelegram(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function deletePrev(chatId: number) {
  const prevId = lastBotMsg.get(chatId)
  if (prevId) {
    try {
      await callTelegram('deleteMessage', { chat_id: chatId, message_id: prevId })
    } catch {}
    lastBotMsg.delete(chatId)
  }
}

let lastBotMsg: Map<number, number> = new Map()

async function send(chatId: number, text: string, extra?: Record<string, unknown>) {
  await callTelegram('sendMessage', { chat_id: chatId, text, ...extra })
}

const WELCOME = `Assalomu alaykum.

Skinlar Bozori'ga xush kelibsiz 🔥

Bu yerda siz:
🎯 CS2 skinlarni sotib olishingiz
💸 Skin sotishingiz
⚡ Eng yaxshi narxlarni topishingiz mumkin

🛒 Marketni ochish uchun pastdagi "SB" tugmasini bosing.

🚀 Tezkor • Ishonchli • Premium`

async function sendWelcome(chatId: number, fromId: number) {
  const buttons = [[{ text: 'SB', url: SITE_URL }]]
  if (fromId === ADMIN_ID) {
    buttons.push([{ text: '⚙&#xFE0F; Admin Panel', url: `${SITE_URL}/admin` }])
  }
  await deletePrev(chatId)
  const res = await callTelegram('sendPhoto', {
    chat_id: chatId,
    photo: `${SITE_URL}/api/welcome-photo?_=${Date.now()}`,
    caption: WELCOME,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons },
  })
  if (res.result?.message_id) {
    lastBotMsg.set(chatId, res.result.message_id)
  }
}

async function parseMarketLink(link: string): Promise<{ name: string; image: string }> {
  try {
    const decoded = decodeURIComponent(link)
    const name = decoded.split('/listings/730/')[1]?.split('?')[0]?.replace(/\+/g, ' ') || ''
    if (!name) return { name: link, image: '' }

    const res = await fetch(`https://steamcommunity.com/market/listings/730/${encodeURIComponent(name)}`, {
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

    return { name, image }
  } catch {
    return { name: link, image: '' }
  }
}

function parseSkinName(name: string): { weaponType: string; rarity: string; condition: string; stattrak: boolean } {
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

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
  }

  try {
    const update = await request.json()

    // Handle callback queries
    if (update.callback_query) {
      const { data, message, id: cbId } = update.callback_query
      const chatId = message.chat.id
      await callTelegram('answerCallbackQuery', { callback_query_id: cbId })

      if (data === 'admin_menu') {
        const fromId = update.callback_query.from?.id || 0
        await sendWelcome(chatId, fromId)
        return NextResponse.json({ ok: true })
      }

      if (data === 'list_skins') {
        const skins = await getCustomSkins()
        if (skins.length === 0) {
          await send(chatId, '📋 Hali qo\'shilgan skinlar yo\'q.', {
            reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_menu' }]] },
          })
        } else {
          const lines = skins.map((s, i) =>
            `${i + 1}. <b>${s.name}</b>\n   ID: ${s.id} | ${s.priceUsd > 0 ? `${s.priceUsd.toLocaleString()} so'm` : 'Admin bilan bog\'laning'} | ${s.available ? 'Mavjud' : 'Yashirin'}`
          ).join('\n\n')
          await send(chatId, `📋 <b>Skinlar (${skins.length})</b>\n\n${lines}`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_menu' }]] },
          })
        }
        return NextResponse.json({ ok: true })
      }

      if (data === 'del_skin_list') {
        const skins = await getCustomSkins()
        if (skins.length === 0) {
          await send(chatId, '🗑 O\'chirish uchun skinlar yo\'q.', {
            reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_menu' }]] },
          })
        } else {
          const rows = skins.map((s) => ([{
            text: `${s.available ? '' : '🔴 '}${s.name.slice(0, 32)}`,
            callback_data: `del_skin_${s.id}`,
          }]))
          rows.push([{ text: '🔙 Orqaga', callback_data: 'admin_menu' }])
          await send(chatId, `🗑 <b>O'chirish uchun skin tanlang:</b>`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: rows },
          })
        }
        return NextResponse.json({ ok: true })
      }

      if (data.startsWith('del_skin_')) {
        const skinId = data.replace('del_skin_', '')
        const removed = await removeCustomSkin(skinId)
        await send(chatId, removed ? '✅ Skin o\'chirildi!' : '❌ Skin topilmadi.', {
          reply_markup: { inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'admin_menu' }]] },
        })
        return NextResponse.json({ ok: true })
      }

      return NextResponse.json({ ok: true })
    }

    // Handle messages
    if (update.message) {
      const { chat, text, from } = update.message
      const chatId = chat.id
      const fromId = from?.id || 0
      const isAdmin = fromId === ADMIN_ID

      if (!text) {
        await send(chatId, 'Фақат матнли хабарларни қабул қиламан')
        return NextResponse.json({ ok: true })
      }

      const cmd = text.toLowerCase()

      // /start command
      if (cmd === '/start') {
        await sendWelcome(chatId, fromId)
        return NextResponse.json({ ok: true })
      }

      // Admin commands
      if (isAdmin) {
        if (cmd === '/admin' || cmd === '/panel') {
          await sendWelcome(chatId, fromId)
          return NextResponse.json({ ok: true })
        }

        // Steam market link → add skin
        if (text.includes('steamcommunity.com/market/listings')) {
          await send(chatId, '⏳ Skin ma\'lumotlari yuklanmoqda...')

          const parsed = await parseMarketLink(text)
          const info = parseSkinName(parsed.name)
          await addCustomSkin({
            name: parsed.name,
            image: parsed.image,
            weaponType: info.weaponType,
            rarity: info.rarity,
            rarityKey: info.rarity.toLowerCase(),
            condition: info.condition,
            float: Math.round(Math.random() * 100) / 100,
            stattrak: info.stattrak,
            priceUsd: 0,
            available: true,
          })

          await send(chatId,
            `✅ <b>Skin qo'shildi!</b>\n\n` +
            `<b>${parsed.name}</b>\n` +
            `🔫 ${info.weaponType}\n` +
            `💎 ${info.rarity}` +
            (info.condition ? `\n📦 ${info.condition}` : '') +
            `\n💵 Admin bilan bog'laning`,
            {
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '🔙 Admin panel', callback_data: 'admin_menu' }]] },
            }
          )
          return NextResponse.json({ ok: true })
        }
      }

      // Welcome for everyone
      await sendWelcome(chatId, fromId)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
