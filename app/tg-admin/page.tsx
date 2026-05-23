'use client'

import { useEffect, useState, useCallback } from 'react'

type SkinEntry = { id: string; name: string; image?: string; source?: string }

export default function TgAdmin() {
  const [name, setName] = useState('')
  const [manualSkins, setManualSkins] = useState<SkinEntry[]>([])
  const [allSkins, setAllSkins] = useState<SkinEntry[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [manRes, adminRes] = await Promise.all([
        fetch('/api/manual-skins'),
        fetch('/api/manual-skins', { method: 'PUT' }),
      ])
      const manData = await manRes.json()
      const adminData = await adminRes.json()
      setManualSkins(manData.map((s: SkinEntry) => ({ id: s.id, name: s.name, image: s.image, source: s.source })))
      setAllSkins((adminData.allSkins || []).map((s: SkinEntry) => ({ id: s.id, name: s.name, image: s.image, source: s.source })))
      setHiddenIds(adminData.hidden || [])
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

  const toggleHide = async (skinId: string, isHidden: boolean) => {
    try {
      await fetch('/api/manual-skins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isHidden ? 'unhide' : 'hide', skinId }),
      })
      await loadAll()
    } catch {}
  }

  const steamSkins = allSkins.filter(s => s.source !== 'manual')

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
          Steam skinlar ({steamSkins.length})
        </p>
        {steamSkins.length === 0 ? (
          <p className="text-sm text-white/30">Steam inventarda skin yo&apos;q</p>
        ) : (
          <div className="space-y-2">
            {steamSkins.map((s) => {
              const isHidden = hiddenIds.includes(s.id)
              return (
                <div key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isHidden ? 'bg-white/[0.02] opacity-40' : 'bg-white/5'}`}>
                  {s.image && <img src={s.image} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                  <span className="flex-1 text-sm">{s.name}</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">STEAM</span>
                  <button
                    onClick={() => toggleHide(s.id, isHidden)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${isHidden ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'}`}
                  >
                    {isHidden ? 'Ko\'rsatish' : 'Yashirish'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
