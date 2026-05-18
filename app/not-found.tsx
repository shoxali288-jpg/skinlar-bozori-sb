import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-bold text-white">Sahifa topilmadi</h1>
      <p className="mt-3 text-sm text-white/60">
        Manzil noto‘g‘ri yoki skin o‘chirilgan bo‘lishi mumkin.
      </p>
      <Link
        href="/marketplace"
        className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm"
      >
        Bozorga o‘tish
      </Link>
    </div>
  );
}
