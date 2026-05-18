'use client';

import { useBuyModal } from '@/lib/buy-modal-context';

const TG = 'https://t.me/shoxsvoy';

export function BuyModal() {
  const { open, closeBuyModal } = useBuyModal();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Yopish"
        onClick={closeBuyModal}
      />
      <div className="relative w-full max-w-lg animate-fadeIn rounded-2xl border border-neon/40 bg-card/95 p-6 shadow-glow backdrop-blur-xl">
        <h2 id="buy-modal-title" className="text-lg font-semibold text-white">
          Xarid haqida
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          Hozirda sayt orqali skin sotib olish mavjud emas.
          <br />
          Skin sotib olish uchun Telegram orqali bog‘laning:
          <br />
          <span className="mt-2 inline-block font-mono text-neon-bright">@shoxsvoy</span>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeBuyModal}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Yopish
          </button>
          <a
            href={TG}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-dim to-neon px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition hover:brightness-110"
          >
            Telegram orqali bog‘lanish
          </a>
        </div>
      </div>
    </div>
  );
}
