export async function getSteamSkinImage(skinName: string): Promise<string> {
  try {
    const urlName = encodeURIComponent(skinName)
    const res = await fetch(
      `https://steamcommunity.com/market/listings/730/${urlName}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    )
    const html = await res.text()
    const match = html.match(/https:\/\/community\.steamstatic\.com\/economy\/image\/[^"']+/)
    if (match) {
      let url = match[0].replace('community.steamstatic.com', 'community.akamai.steamstatic.com')
      if (!url.match(/\/\d+[fx]+\d+[fx]*$/)) url += '/62fx62f'
      return url
    }
  } catch {}
  return 'https://community.akamai.steamstatic.com/public/shared/images/subscribed_apps/game_overlay/730.png'
}
