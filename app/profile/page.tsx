'use client';

import { useProfile } from '@/lib/profile-context';
import { SteamInventory } from '@/components/SteamInventory';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { profile, setProfile } = useProfile();
  const searchParams = useSearchParams();
  const steamIdParam = searchParams.get('steamid') || '';
  const [name, setName] = useState(profile.displayName);
  const [trade, setTrade] = useState(profile.steamTradeUrl || steamIdParam);
  const [note, setNote] = useState(profile.note);
  const [saved, setSaved] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    setName(profile.displayName);
    if (!steamIdParam) setTrade(profile.steamTradeUrl);
    setNote(profile.note);
  }, [profile.displayName, profile.steamTradeUrl, profile.note, steamIdParam]);

  useEffect(() => {
    if (trade && !profile.steamTradeUrl) {
      setProfile({ ...profile, steamTradeUrl: trade });
    }
  }, []);

  useEffect(() => {
    if (steamIdParam) setFetchKey((k) => k + 1);
  }, [steamIdParam]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Profil</h1>
        <p className="mt-2 text-sm text-white/60">
          Ko‘rinadigan ism va aloqa ma’lumotlarini yangilang. Ma’lumotlar brauzeringizda saqlanadi.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-card/50 p-6 shadow-innerGlow">
        <Image
          src="/site-logo.jpg"
          alt="Skinlar Bozori SB"
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-neon/35 shadow-glow-sm"
        />
        <div>
          <p className="text-sm font-semibold text-white">{profile.displayName}</p>
          <p className="text-xs text-white/45">Skinlar Bozori SB foydalanuvchisi</p>
        </div>
      </div>

      <form
        className="space-y-4 rounded-3xl border border-white/10 bg-surface/50 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          setProfile({
            displayName: name.trim() || 'Oʻyinchi',
            steamTradeUrl: trade.trim(),
            note: note.trim(),
          });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      >
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Ko‘rinadigan ism
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-neon/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Steam ID yoki profil
          </label>
          <input
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="https://steamcommunity.com/profiles/... yoki Steam ID"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-neon/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Eslatma
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-neon/50"
          />
        </div>
        <button
          type="submit"
          className="inline-flex rounded-2xl bg-gradient-to-r from-neon-dim to-neon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          Saqlash
        </button>
        {saved ? <p className="text-sm text-emerald-300">Saqlandi.</p> : null}
      </form>

      <div className="rounded-3xl border border-white/10 bg-surface/50 p-6 sm:p-8">
        <SteamInventory />
      </div>
    </div>
  );
}
