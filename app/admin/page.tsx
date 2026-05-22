'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type AdminSkin = {
  id: string
  name: string
  image: string
  weaponType: string
  rarity: string
  condition: string
  priceUsd: number
  available: boolean
  float: number
  stattrak: boolean
  addedAt: string
}

export default function AdminPage() {
  const [skins, setSkins] = useState<AdminSkin[]>([])
  const [tab, setTab] = useState<'list' | 'add' | 'edit'>('list')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Add form
  const [addName, setAddName] = useState('')
  const [addImage, setAddImage] = useState('')
  const [addPreview, setAddPreview] = useState('')
  const [addCondition, setAddCondition] = useState('')
  const [addRarity, setAddRarity] = useState('')
  const [addWeapon, setAddWeapon] = useState('')

  // Edit
  const [editSkin, setEditSkin] = useState<AdminSkin | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editImage, setEditImage] = useState('')

  const load = async (q?: string) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: q ? 'search' : 'list', query: q || '' }),
    })
    const data = await res.json()
    if (data.ok) setSkins(data.skins)
  }

  useEffect(() => {
    load()
    document.title = 'Admin Panel — SB'
  }, [])

  const fetchImage = async () => {
    if (!addName.trim()) return
    setLoading(true)
    setError('')
    setAddImage('')
    setAddPreview('')
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        body: JSON.stringify({ action: 'fetch_image', name: addName }),
      })
      const data = await res.json()
      if (data.ok && data.image) {
        setAddImage(data.image)
        setAddPreview(data.image)
        if (data.condition) setAddCondition(data.condition)
        if (data.rarity) setAddRarity(data.rarity)
        if (data.weaponType) setAddWeapon(data.weaponType)
      } else {
        setError('Rasm topilmadi. Skin nomini tekshiring.')
      }
    } catch {
      setError('Rasm topilmadi. Skin nomini tekshiring.')
    }
    setLoading(false)
  }

  const addSkin = async () => {
    if (!addName.trim() || !addImage) {
      setError('Avval rasmni yuklang')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        name: addName,
        image: addImage,
        condition: addCondition,
        rarity: addRarity,
        weaponType: addWeapon,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) {
      setAddName('')
      setAddImage('')
      setAddPreview('')
      setAddCondition('')
      setAddRarity('')
      setAddWeapon('')
      setError('')
      setTab('list')
      load()
    } else {
      setError(data.error || 'Xatolik')
    }
  }

  const toggleAvailable = async (id: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'toggle_available', id }),
    })
    load(search)
  }

  const deleteSkin = async (id: string) => {
    if (!confirm('Skin o\'chirilsinmi?')) return
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id }),
    })
    load(search)
  }

  const updatePrice = async () => {
    if (!editSkin || !editPrice) return
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_price', id: editSkin.id, price: editPrice }),
    })
    setEditSkin(null)
    load(search)
  }

  const updateImage = async () => {
    if (!editSkin || !editImage) return
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_image', id: editSkin.id, image: editImage }),
    })
    setEditSkin(null)
    load(search)
  }

  const onSearch = (q: string) => {
    setSearch(q)
    load(q)
  }

  return (
    <div className="min-h-screen bg-[#000] text-white font-sans">
      {/* Header */}
      <div className="border-b border-[#a855f7]/20 px-4 sm:px-6 py-4 flex items-center gap-3"
        style={{ boxShadow: '0 0 20px rgba(168,85,247,0.15)' }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-sm font-bold">SB</div>
        <h1 className="text-lg font-bold tracking-wide" style={{ textShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
          Admin Panel
        </h1>
        <span className="ml-auto text-[10px] text-[#a855f7]/60 uppercase tracking-widest">Premium</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#a855f7]/10 px-4 sm:px-6 flex gap-4 overflow-x-auto">
        {([
          { key: 'list', label: '📋 Skinlar' },
          { key: 'add', label: '➕ Qo\'shish' },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setError('') }}
            className={`py-3 text-sm border-b-2 transition whitespace-nowrap ${
              tab === t.key ? 'border-[#a855f7] text-white' : 'border-transparent text-white/40 hover:text-white/70'
            }`}>
            {t.label} {t.key === 'list' ? `(${skins.length})` : ''}
          </button>
        ))}
        {editSkin && (
          <button onClick={() => setEditSkin(null)}
            className="py-3 text-sm border-b-2 border-[#a855f7] text-white whitespace-nowrap">
            ✏ Tahrirlash
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* ADD TAB */}
        {tab === 'add' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Skin nomi</label>
              <input value={addName} onChange={(e) => setAddName(e.target.value)}
                placeholder="M: AK-47 | Redline"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50 transition"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.1)' }}
              />
            </div>

            <button onClick={fetchImage} disabled={loading || !addName.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              style={{ boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
              {loading ? 'Yuklanmoqda...' : '🔍 Rasmni topish'}
            </button>

            {addPreview && (
              <div className="rounded-xl border border-[#a855f7]/20 bg-black/40 p-4 text-center"
                style={{ boxShadow: '0 0 15px rgba(168,85,247,0.1)' }}>
                <div className="relative w-full h-40 mx-auto max-w-[300px]">
                  <Image src={addPreview} alt="Preview" fill className="object-contain" />
                </div>
                <p className="mt-2 text-xs text-white/50">Rasm topildi</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Weapon</label>
                <input value={addWeapon} onChange={(e) => setAddWeapon(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Rarity</label>
                <input value={addRarity} onChange={(e) => setAddRarity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Condition</label>
                <input value={addCondition} onChange={(e) => setAddCondition(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={addSkin} disabled={loading || !addImage}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
                {loading ? 'Saqlanmoqda...' : '💾 Skin saqlash'}
              </button>
              <button onClick={() => { setTab('list'); setError('') }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10">
                Bekor qilish
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editSkin && (
          <div className="rounded-2xl border border-[#a855f7]/20 bg-black/80 p-5 space-y-4"
            style={{ boxShadow: '0 0 30px rgba(168,85,247,0.15)' }}>
            <h3 className="font-semibold text-white">✏ Tahrirlash: {editSkin.name}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Yangi narx (USD)</label>
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={String(Math.round(editSkin.priceUsd / 12800))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50" />
                <button onClick={updatePrice}
                  className="mt-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
                  Yangilash
                </button>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Yangi rasm URL</label>
                <input value={editImage} onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50" />
                <button onClick={updateImage}
                  className="mt-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
                  Rasmni yangilash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST TAB */}
        {tab === 'list' && (
          <div className="space-y-4">
            {/* Search */}
            <input value={search} onChange={(e) => onSearch(e.target.value)}
              placeholder="Qidirish..."
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-[#a855f7]/50 transition"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.1)' }}
            />

            <div className="space-y-2">
              {skins.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-sm">Skinlar yo&apos;q</div>
              ) : (
                skins.map((s) => (
                  <div key={s.id}
                    className="rounded-xl border border-white/5 bg-black/60 p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-4 transition hover:border-[#a855f7]/20"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.05)' }}>
                    <div className="relative w-full sm:w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-black/40">
                      <Image src={s.image} alt={s.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{s.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-white/50">
                        <span>{s.weaponType}</span>
                        <span className="text-[#a855f7]">{s.rarity}</span>
                        {s.condition && <span>{s.condition}</span>}
                        <span>{s.priceUsd > 0 ? `${s.priceUsd.toLocaleString()} so'm` : 'Admin bilan bog\'laning'}</span>
                        {s.stattrak && <span className="text-orange-400">StatTrak</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button onClick={() => toggleAvailable(s.id)}
                          className={`text-xs px-3 py-1 rounded-lg border transition ${
                            s.available
                              ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                              : 'border-red-500/30 text-red-300 bg-red-500/10'
                          }`}>
                          {s.available ? 'Mavjud' : 'Yashirin'}
                        </button>
                        <button onClick={() => {
                          setEditSkin(s)
                          setEditPrice('')
                          setEditImage('')
                        }}
                          className="text-xs px-3 py-1 rounded-lg border border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/10 transition">
                          ✏ Tahrirlash
                        </button>
                        <button onClick={() => deleteSkin(s.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition">
                          🗑 O&apos;chirish
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { background: #000 !important; background-image: none !important; }
        header, footer, .sb-shimmer { display: none !important; }
        main { max-width: none !important; padding: 0 !important; margin: 0 !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input, button { font-family: inherit; }
      `}</style>
    </div>
  )
}
