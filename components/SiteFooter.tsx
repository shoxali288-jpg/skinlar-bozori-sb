import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-surface/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-md flex-col gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Skinlar Bozori SB"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover shadow-glow-sm"
            />
            <div>
              <p className="text-base font-bold text-white">Skinlar Bozori SB</p>
              <p className="text-xs text-white/55">SKINLAR • SAVDO • ISHONCH</p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-white/60">
            CS2 skinlari uchun premium bozor tajribasi. Tezkor qidiruv, shaffof narxlar va ishonchli
            aloqa.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-bright/90">
              Bo‘limlar
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>
                <Link className="hover:text-white" href="/marketplace">
                  Bozor
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/sell">
                  Skin sotish
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/cart">
                  Savat
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-bright/90">
              Bog‘lanish
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>
                <Link className="hover:text-white" href="/support">
                  Yordam
                </Link>
              </li>
              <li>
                <a className="hover:text-white" href="https://t.me/shoxsvoy" target="_blank" rel="noopener noreferrer">
                  Telegram: @shoxsvoy
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-bright/90">
              Bozor
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>
                <Link className="hover:text-white" href="/marketplace">
                  Barcha skinlar
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Skinlar Bozori SB. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
