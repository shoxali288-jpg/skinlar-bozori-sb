import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yordam',
};

const TG = 'https://t.me/shoxsvoy';

const faq = [
  {
    q: 'Saytdan to‘g‘ridan-to‘g‘ri xarid qilish mumkinmi?',
    a: 'Hozircha sayt orqali to‘g‘ridan-to‘g‘ri to‘lov yo‘q. Xarid va savdo Telegram orqali @shoxsvoy bilan kelishiladi.',
  },
  {
    q: 'Skin rasmlari qayerdan olinadi?',
    a: 'Rasmlar Steam iqtisodiyot CDN orqali ko‘rsatiladi va odatdagi bozor ko‘rinishiga mos keladi.',
  },
  {
    q: 'Ma’lumotlarim qayerda saqlanadi?',
    a: 'Savat, profil va buyurtmalar demo tarzida brauzeringizning localStorage’ida saqlanadi.',
  },
  {
    q: 'Logotipni qanday almashtiraman?',
    a: 'Chatdan yuklangan logotip faylingizni loyihadagi public/logo.png fayli bilan almashtiring — navbar, footer, favicon va yuklanish ekrani avtomatik yangilanadi.',
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Yordam va qo‘llab-quvvatlash</h1>
        <p className="mt-2 text-sm text-white/60">
          Tez-tez beriladigan savollar va aloqa kanallari.
        </p>
      </div>

      <a
        href={TG}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-4 rounded-3xl border border-neon/35 bg-gradient-to-r from-neon-dim/40 to-neon/25 p-6 shadow-glow-sm transition hover:brightness-110"
      >
        <div>
          <p className="text-sm font-semibold text-white">Telegram orqali yozing</p>
          <p className="mt-1 text-xs text-white/70">@shoxsvoy — operativ javob</p>
        </div>
        <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white">ochish</span>
      </a>

      <div className="space-y-4">
        {faq.map((item) => (
          <div key={item.q} className="rounded-2xl border border-white/10 bg-card/40 p-5">
            <h2 className="text-sm font-semibold text-white">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 text-sm text-white/60">
        <p>
          Bosh sahifaga qaytish:{' '}
          <Link href="/" className="font-semibold text-neon-bright hover:underline">
            Bosh sahifa
          </Link>
        </p>
      </div>
    </div>
  );
}
