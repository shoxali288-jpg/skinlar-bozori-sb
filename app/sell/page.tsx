import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Skin sotish',
};

const TG = 'https://t.me/shoxsvoy';

export default function SellPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Skin sotish</h1>
        <p className="mt-2 text-sm text-white/60">
          Skinlaringizni tez va xavfsiz sotish uchun jarayonni Telegram orqali yakunlang.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-card/50 p-6 shadow-innerGlow sm:p-8">
        {[
          'Steam Trade URL va inventar holatingizni tayyorlang.',
          'Skin nomi, float, holat va skrinshot yuboring.',
          'Narx va to‘lov usulini operator bilan kelishib oling.',
          'Tasdiqlangandan keyin almashinuv vaqtini belgilang.',
        ].map((t, i) => (
          <div key={t} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neon/20 text-xs font-bold text-neon-bright ring-1 ring-neon/30">
              {i + 1}
            </span>
            <p className="text-sm text-white/75">{t}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={TG}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          Telegram orqali yozish
        </a>
        <Link
          href="/marketplace"
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          Bozorga qaytish
        </Link>
      </div>
    </div>
  );
}
