import { SkinCard } from '@/components/SkinCard';
import { getAllSkins } from '@/lib/catalog';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getUniqueSkins(skins: Awaited<ReturnType<typeof getAllSkins>>, count: number) {
  const seen = new Set<string>();
  const unique: typeof skins = [];
  for (const skin of skins) {
    if (!seen.has(skin.name)) {
      seen.add(skin.name);
      unique.push(skin);
      if (unique.length >= count) break;
    }
  }
  return unique;
}

export default async function HomePage() {
  const skins = await getAllSkins();
  const featured = getUniqueSkins(skins, Math.min(3, skins.length));

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/40 px-6 py-12 shadow-glow sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-neon-dim/15 blur-3xl" />
        <div className="relative max-w-3xl space-y-6">
          <p className="inline-flex rounded-full border border-neon/35 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neon-bright">
            Premium CS2 bozori
          </p>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
            Skinlar Bozori SB — ishonchli CS2 skin savdosi
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Bozorga o&apos;tish
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Mening skinlarim</h2>
            <p className="text-sm text-white/55">
              {skins.length > 0
                ? `${skins.length} ta skin`
                : 'Skinlar yuklanmoqda...'}
            </p>
          </div>
          <Link href="/marketplace" className="text-sm font-semibold text-neon-bright hover:underline">
            Barchasini ko‘rish
          </Link>
        </div>
        {skins.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-surface/40 p-10 text-center text-white/45">
            Skinlar mavjud emas.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SkinCard key={s.id} skin={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
