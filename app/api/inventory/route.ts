import { NextResponse } from 'next/server';
import { extractSteamId, parseInventory } from '@/lib/steam';
import https from 'https';

function fetchJson(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 500, body: data }));
    }).on('error', reject);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const steamId = extractSteamId(query);
  if (!steamId) {
    return NextResponse.json({ error: 'Steam ID topilmadi.' }, { status: 400 });
  }

  try {
    const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=1000`;
    const { status, body } = await fetchJson(url);

    if (status !== 200) {
      const msg =
        status === 403
          ? 'Inventar yopiq. Steam inventaringizni Public qilib oching.'
          : status === 429
            ? 'So\'rovlar chegarasi oshib ketdi.'
            : `Steam xatosi: ${status}`;
      return NextResponse.json({ error: msg, detail: body.slice(0, 500) }, { status: 502 });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Steam noto\'g\'ri javob qaytardi.', detail: body.slice(0, 500) },
        { status: 502 },
      );
    }

    const items = parseInventory(data);
    return NextResponse.json({ steamId, count: items.length, items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Noma\'lum xatolik';
    return NextResponse.json({ error: `Server xatosi: ${msg}` }, { status: 500 });
  }
}
