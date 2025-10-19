"use client"
import { useState } from 'react'

type Props = {
  initialUsername: string | null
  initialAvatarUrl: string | null
}

export default function ProfileForm({ initialUsername, initialAvatarUrl }: Props) {
  const [username, setUsername] = useState(initialUsername ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSave() {
    setSaving(true)
    setError(null)
    setOk(false)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username || null, avatarUrl: avatarUrl || null })
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({} as any))
      setError(j?.error || 'Error')
    } else {
      setOk(true)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={avatarUrl || '/avatar-placeholder.png'} alt="avatar" className="w-16 h-16 rounded-full border border-white/10 object-cover" />
        <div className="flex-1">
          <label className="block text-sm opacity-80">Avatar URL</label>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className="block text-sm opacity-80">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" placeholder="yourname" />
        <p className="text-xs opacity-60 mt-1">Leave blank to remove.</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{saving ? '...' : 'Save'}</button>
        {ok && <span className="text-sm opacity-70">Saved</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  )
}
