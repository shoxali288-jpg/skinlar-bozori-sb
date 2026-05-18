'use client';

import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { lines, setQty, removeLine, clearCart } = useCart();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Savat</h1>
          <p className="mt-2 text-sm text-white/60">
            Tanlangan skinlar ro‘yxati. Narx va xarid haqida Admin bilan bog‘laning.
          </p>
        </div>
        {lines.length > 0 ? (
          <button
            type="button"
            onClick={clearCart}
            className="self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
          >
            Savatni tozalash
          </button>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-surface/40 p-10 text-center">
          <p className="text-white/70">Savat bo‘sh.</p>
          <Link
            href="/marketplace"
            className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm"
          >
            Bozorni ochish
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((l) => (
              <div
                key={l.skin.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-card/50 p-4 shadow-innerGlow"
              >
                <Link href={`/skin/${l.skin.id}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-black/40">
                  <Image src={l.skin.image} alt={l.skin.name} fill className="object-contain p-2" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/skin/${l.skin.id}`} className="line-clamp-2 text-sm font-semibold text-white hover:underline">
                    {l.skin.name}
                  </Link>
                  <p className="mt-1 text-xs text-white/45">{l.skin.weaponType}</p>
                  <p className="mt-2 text-sm text-white/60">Admin bilan bog&apos;laning</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="text-xs text-white/45">
                      Soni
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={l.qty}
                        onChange={(e) => setQty(l.skin.id, Number(e.target.value))}
                        className="ml-2 w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeLine(l.skin.id)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10"
                    >
                      O‘chirish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-3xl border border-white/10 bg-surface/60 p-6 shadow-glow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Jami</p>
            <p className="mt-2 text-sm text-white/60">Admin bilan bog&apos;laning</p>
            <p className="mt-2 text-xs text-white/50">
              Bu yerda faqat savat jamlanmasi ko‘rsatiladi. Haqiqiy xarid Telegram orqali.
            </p>
            <Link
              href="https://t.me/shoxsvoy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <span aria-hidden>🛒</span>
              Admin TG
            </Link>
            <Link
              href="/marketplace"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Xaridni davom ettirish
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
