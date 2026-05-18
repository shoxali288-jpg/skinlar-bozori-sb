'use client';

import { SkinImageViewport } from '@/components/SkinImageViewport';
import { useCart } from '@/lib/cart-context';
import type { Skin } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';

export function SkinDetailClient({ skin }: { skin: Skin }) {
  const { addToCart } = useCart();
  const onAdd = useCallback(() => addToCart(skin, 1), [addToCart, skin]);

  return (
    <div className="space-y-8">
      <nav className="text-xs text-white/45">
        <Link href="/marketplace" className="hover:text-white">
          Bozor
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{skin.weaponType}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-innerGlow sm:p-8">
          <SkinImageViewport className="mx-auto w-full max-w-[420px] shadow-glow">
            <div className="relative aspect-square w-full">
              <Image
                src={skin.image}
                alt={skin.name}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 420px"
                className="object-contain object-center drop-shadow-2xl"
              />
            </div>
          </SkinImageViewport>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-bright/90">
              {skin.weaponType}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">{skin.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {skin.stattrak ? (
                <span className="rounded-lg bg-orange-500/20 px-2 py-1 text-xs font-bold text-orange-200 ring-1 ring-orange-400/30">
                  StatTrak™
                </span>
              ) : null}
              <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-semibold text-white/75 ring-1 ring-white/10">
                {skin.rarity}
              </span>
              <span
                className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${
                  skin.available
                    ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25'
                    : 'bg-white/5 text-white/65 ring-white/10'
                }`}
              >
                {skin.available ? 'Mavjud' : 'Cheklangan'}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { k: 'Holat', v: skin.condition, mono: false },
              { k: 'Float', v: skin.float.toFixed(6), mono: true },
              { k: 'Narx', v: 'Admin bilan bog&apos;laning', mono: false },
              { k: 'Mavjudlik', v: skin.available ? 'Ha' : 'Cheklangan', mono: false },
            ] as { k: string; v: string; mono: boolean }[]).map((row) => (
              <div key={row.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {row.k}
                </p>
                <p className={`mt-1 text-sm text-white ${row.mono ? 'font-mono text-neon-bright' : ''}`}>
                  {row.v}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://t.me/shoxsvoy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[0.99]"
            >
              <span aria-hidden>🛒</span>
              Admin TG
            </a>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Savatga qo‘shish
            </button>
          </div>

          <p className="text-xs leading-relaxed text-white/45">
            Tasvirlar Steam iqtisodiyot CDN orqali ko‘rsatiladi. Yakuniy ko‘rinish bozor va o‘yin
            sozlamalariga qarab farq qilishi mumkin.
          </p>
        </div>
      </div>
    </div>
  );
}
