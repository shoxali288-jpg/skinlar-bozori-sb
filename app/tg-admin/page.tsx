'use client'

import { useEffect, useState, useCallback } from 'react'

type SkinEntry = { id: string; name: string; image?: string }

export default function TgAdmin() {
  const [name, setName] = useState('')
  const [skins, setSkins] = useState<SkinEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const loadSkins = useCallback(async () => {
    try {
      const res = await fetch('/api/manual-skins')
      const data = await res.json()
      setSkins(data.map((s: { id: string; name: string; image?: string }) => ({ id: s.id, name: s.name, image: s.image })))
    } catch {}
  }, [])

  useEffect(() => {
    loadSkins()
  }, [loadSkins])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.expand()
      tg.ready()
    }
  }, [])

  const addSkin = async () => {
    if (!name.trim()) return
    setLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/manual-skins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        setMsg('✅ Qo\'shildi!')
        setName('')
        await loadSkins()
      } else {
        setMsg('❌ Xatolik')
      }
    } catch {
      setMsg('❌ Xatolik')
    }
    setLoading(false)
  }

  const deleteSkin = async (id: string) => {
    try {
      await fetch(`/api/manual-skins?id=${id}`, { method: 'DELETE' })
      await loadSkins()
    } catch {}
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-950 p-4 text-white">
      <div className="mb-6 flex items-center gap-3">
        <img src="/logo.jpg" alt="logo" className="h-10 w-10 rounded-full object-cover" />
        <h1 className="text-lg font-bold tracking-wide">Admin Panel</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Skin nomi</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSkin()}
          placeholder="Masalan: AK-47 | Redline"
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-neon/50"
        />
        <button
          onClick={addSkin}
          disabled={loading || !name.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-neon-dim to-neon py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? 'Qo\'shilmoqda...' : '➕ Skin qo\'shish'}
        </button>
        {msg && <p className="mt-2 text-center text-sm">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Qo&apos;lda qo&apos;shilgan skinlar ({skins.length})
        </p>
        {skins.length === 0 ? (
          <p className="text-sm text-white/30">Hozircha skinlar yo&apos;q</p>
        ) : (
          <div className="space-y-2">
            {skins.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                {s.image && (
                  <img src={s.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                )}
                <span className="flex-1 text-sm">{s.name}</span>
                <button
                  onClick={() => deleteSkin(s.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
                >
                  O&apos;chirish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
