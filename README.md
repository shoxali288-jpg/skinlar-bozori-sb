# Skinlar Bozori SB

CS2 skin marketplace with Telegram bot + Mini App admin panel.

## Required Environment Variables

Set these in Vercel Project Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Telegram bot token from @BotFather |
| `ADMIN_ID` | Your Telegram user ID (default: 6474297315) |
| `SITE_URL` | Vercel deployment URL (e.g. https://skinlar-bozori-sb.vercel.app) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for persistent storage |

## Persistent Storage

All data is stored in **Vercel Blob** — survives deploy, restart, cold start:

- **Manual skins** → `manual-skins.json` (added via Admin Panel)
- **Hidden skin IDs** → `hidden-skins.json` (hidden via Admin Panel)
- **Welcome photo** → `welcome.jpg` (sent to bot by admin)
- **Bot users** → `bot-users.json` (registered users)

No local JSON files or in-memory-only storage for critical data.

## Deploy Without Data Loss

```bash
git push origin main
npx vercel --prod
```

That's it. All data persists because it lives in Vercel Blob, not on the filesystem.

## Verify Manual Skins Survive

1. Add a skin via Admin Panel → `/tg-admin`
2. Run `npx vercel --prod` (cold deploy)
3. Open the site — skin still appears
4. Start the bot — `/start` still works with saved photo

## Bot Welcome Message

The welcome message is hardcoded in the webhook (it's static text, not user data):

> Assalomu alaykum.
> Skinlar Bozori'ga xush kelibsiz 🔥
> ...

## Data Safety

- Steam sync NEVER removes manual skins (`source: 'manual'`)
- Manual skins only removed via Admin Panel "O'chirish" button
- Hidden skins persist in Blob, not affected by cache clear or deploy
- Welcome photo saved to Blob on upload, survives all restarts
