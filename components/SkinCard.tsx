'use client';

import { SkinImageViewport } from '@/components/SkinImageViewport';
import { useBuyModal } from '@/lib/buy-modal-context';
import { useCart } from '@/lib/cart-context';
import type { Skin } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';

export function SkinCard({ skin }: { skin: Skin }) {
  const { openBuyModal } = useBuyModal();
  const { addToCart } = useCart();

  const onBuy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openBuyModal();
    },
    [openBuyModal],
  );

  const onAddCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(skin, 1);
    },
    [addToCart, skin],
  );

  return (
    <Link
      href={`/skin/${skin.id}`}
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-[0_0_0_1px_rgba(168,85,247,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-neon/35 hover:shadow-glow"
    >
      <div className="relative px-4 pb-0 pt-4">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.2),transparent_55%)]" />
        </div>
        <SkinImageViewport className="h-[200px] w-full shadow-glow-sm">
          <div className="relative flex h-full w-full items-center justify-center">
            {skin.image ? (
              <Image
                src={skin.image}
                alt={skin.name}
                fill
                sizes="(max-width:768px) 100vw, 280px"
                className="object-contain object-center drop-shadow-[0_12px_36px_rgba(0,0,0,0.75)] transition duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="text-4xl text-white/10">?</span>
            )}
          </div>
        </SkinImageViewport>
        {skin.stattrak ? (
          <span className="absolute left-6 top-7 z-10 rounded-lg bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
            StatTrak™
          </span>
        ) : null}
        <span
          className={`absolute right-6 top-7 z-10 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
            skin.available
              ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
              : 'bg-white/10 text-white/70 ring-1 ring-white/10'
          }`}
        >
          {skin.available ? 'Mavjud' : 'Cheklangan'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="min-h-[3.25rem]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
            {skin.weaponType}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
            {skin.name}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
          <div className="rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/5">
            <span className="text-white/40">Nadirlik</span>
            <p className="truncate text-white/85">{skin.rarity}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/5">
            <span className="text-white/40">Holat</span>
            <p className="truncate text-white/85">{skin.condition}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/5">
            <span className="text-white/40">Float</span>
            <p className="font-mono text-white/85">{skin.float.toFixed(5)}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/5">
            <span className="text-white/40">Narx</span>
            <p className="text-white/85">Admin bilan bog&apos;laning</p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onBuy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-dim to-neon px-3 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.99]"
          >
            <span aria-hidden>🛒</span>
            Sotib olish
          </button>
          <button
            type="button"
            onClick={onAddCart}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Savatga qo‘shish
          </button>
        </div>
      </div>
    </Link>
  );
}
