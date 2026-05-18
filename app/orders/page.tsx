'use client';

import { useOrders } from '@/lib/orders-context';

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(ts),
  );
}

const statusUz: Record<string, string> = {
  kutilmoqda: 'Kutilmoqda',
  'qayta ishlanmoqda': 'Qayta ishlanmoqda',
  yakunlangan: 'Yakunlangan',
};

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Buyurtmalar</h1>
        <p className="mt-2 text-sm text-white/60">
          Buyurtmalar tarixi brauzeringizda saqlanadi. Yangi buyurtma Telegram orqali rasmiylashtiriladi.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-surface/40 p-10 text-center text-white/65">
          Hozircha buyurtmalar yo‘q.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-3xl border border-white/10 bg-card/50 p-6 shadow-innerGlow"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{o.id}</p>
                  <p className="text-xs text-white/45">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-white/60">Admin bilan bog&apos;laning</p>
                  <p className="text-xs text-white/55">{statusUz[o.status] ?? o.status}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm text-white/70">
                {o.items.map((it) => (
                  <li key={`${o.id}-${it.skinId}-${it.name}`} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {it.name}{' '}
                      <span className="text-white/45">×{it.qty}</span>
                    </span>
                    <span className="shrink-0 text-xs text-white/60">Admin bilan bog&apos;laning</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
