'use client'
import { useState } from 'react'

export default function OnboardingPage() {
  const [form, setForm] = useState({
    inviteCode: '',
    name: '',
    appLanguage: 'en',
    meditationLanguage: 'en',
    level: 'beginner',
  })
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setOk(true)
    else setError((await res.json()).error ?? 'Failed')
  }

  if (ok) return <p className="p-4">All set! You can start meditating.</p>

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-sm opacity-80">Enter your invite code and basic preferences.</p>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full p-3 rounded bg-white/5 border border-white/10"
          placeholder="Invite code"
          value={form.inviteCode}
          onChange={(e) => setForm({ ...form, inviteCode: e.target.value.trim() })}
          required
        />
        <input
          className="w-full p-3 rounded bg-white/5 border border-white/10"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="text-sm">App language</div>
            <select
              className="w-full p-2 rounded bg-white/5 border border-white/10"
              value={form.appLanguage}
              onChange={(e) => setForm({ ...form, appLanguage: e.target.value })}
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
            </select>
          </label>
          <label className="space-y-1">
            <div className="text-sm">Meditation language</div>
            <select
              className="w-full p-2 rounded bg-white/5 border border-white/10"
              value={form.meditationLanguage}
              onChange={(e) => setForm({ ...form, meditationLanguage: e.target.value })}
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
            </select>
          </label>
        </div>
        <label className="space-y-1 block">
          <div className="text-sm">Level</div>
          <select
            className="w-full p-2 rounded bg-white/5 border border-white/10"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="px-4 py-2 rounded bg-emerald-600 text-white">Save</button>
      </form>
    </div>
  )
}
