"use client"
import { useState } from 'react'

type Props = {
  initialEnabled: boolean
  initialTime: string | null
}

export default function RemindersForm({ initialEnabled, initialTime }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [time, setTime] = useState(initialTime ?? '20:00')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  async function onSave() {
    setSaving(true)
    setOk(false)
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyReminders: enabled, reminderSchedule: enabled ? time : null })
    })
    setSaving(false)
    setOk(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input id="enable-reminders" type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <label htmlFor="enable-reminders">Enable daily reminders</label>
      </div>
      <div className="space-y-1 opacity-90">
        <label className="block text-sm opacity-80">Time (UTC)</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent border border-white/20 rounded px-3 py-2" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{saving ? '...' : 'Save'}</button>
        {ok && <span className="text-sm opacity-70">Saved</span>}
      </div>
    </div>
  )
}
