'use client'

import { useEffect, useState, useCallback } from 'react'

type SkinEntry = { id: string; name: string; image?: string; source?: string }

export default function TgAdmin() {
  const [name, setName] = useState('')
  const [allSkins, setAllSkins] = useState<SkinEntry[]>([])
  const [manualSkins, setManualSkins] = useState<SkinEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [catRes, manRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/manual-skins'),
      ])
      const catData = await catRes.json()
      const manData = await manRes.json()
      setAllSkins((catData.skins || []).map((s: SkinEntry) => ({ id: s.id, name: s.name, image: s.image, source: s.source })))
      setManualSkins(manData.map((s: SkinEntry) => ({ id: s.id, name: s.name, image: s.image, source: s.source })))
    } catch {}
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

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
        await loadAll()
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
      await loadAll()
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
          Admin qo&apos;shgan skinlar ({manualSkins.length})
        </p>
        {manualSkins.length === 0 ? (
          <p className="text-sm text-white/30">Hali skin qo&apos;shilmagan</p>
        ) : (
          <div className="space-y-2">
            {manualSkins.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                {s.image && <img src={s.image} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                <span className="flex-1 text-sm">{s.name}</span>
                <span className="rounded-md bg-neon/20 px-2 py-0.5 text-[10px] font-bold text-neon">ADMIN</span>
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

      <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
          Steam inventardagi skinlar ({allSkins.filter(s => s.source !== 'manual').length})
        </p>
        <div className="space-y-1">
          {allSkins.filter(s => s.source !== 'manual').slice(0, 20).map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-1.5">
              {s.image && <img src={s.image} alt="" className="h-7 w-7 rounded object-cover" />}
              <span className="flex-1 text-xs text-white/50">{s.name}</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">STEAM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
