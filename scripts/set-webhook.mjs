const BOT_TOKEN = process.env.BOT_TOKEN
if (!BOT_TOKEN) {
  console.log('⏭️ BOT_TOKEN not set, skipping webhook registration')
  process.exit(0)
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`
const SITE_URL = 'https://skinlar-bozori-sb.vercel.app'
const WEBHOOK_URL = `${SITE_URL}/api/telegram-webhook`

async function main() {
  try {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
      }),
    })
    const data = await res.json()
    if (data.ok) {
      console.log(`✅ Webhook set: ${WEBHOOK_URL} with allowed_updates: message, callback_query`)
    } else {
      console.error(`❌ Webhook error: ${data.description}`)
    }
  } catch (e) {
    console.error(`❌ Webhook failed: ${e.message}`)
  }
}

main()