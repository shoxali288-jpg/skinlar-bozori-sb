'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Bosh sahifa' },
  { href: '/marketplace', label: 'Bozor' },
  { href: '/sell', label: 'Skin sotish' },
  { href: '/cart', label: 'Savat' },
  { href: '/support', label: 'Yordam' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/site-logo.jpg"
            alt="Skinlar Bozori SB"
            width={48}
            height={48}
            className="h-11 w-11 rounded-full object-cover shadow-glow-sm sm:h-12 sm:w-12"
          />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold tracking-wide text-white">Skinlar Bozori</span>
            <span className="text-xs font-semibold text-neon-bright">SB Premium</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-white/10 text-white shadow-innerGlow'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {l.label}
                {l.href === '/cart' && count > 0 ? (
                  <span className="ml-1 rounded-full bg-neon/25 px-2 py-0.5 text-xs text-neon-bright">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-xl border border-neon/30 bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:bg-white/10 lg:hidden"
          >
            Savat
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menyu</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-white/5 bg-surface/95 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium ${
                    active ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5'
                  }`}
                >
                  {l.label}
                  {l.href === '/cart' && count > 0 ? ` (${count})` : ''}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
