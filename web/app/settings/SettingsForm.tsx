"use client"
import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Props = {
  initialAppLanguage: string
  initialMeditationLanguage: string
}

export default function SettingsForm({ initialAppLanguage, initialMeditationLanguage }: Props) {
  const t = useTranslations()
  const [appLanguage, setAppLanguage] = useState(initialAppLanguage)
  const [meditationLanguage, setMeditationLanguage] = useState(initialMeditationLanguage)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function onSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appLanguage, meditationLanguage })
    })
    setSaving(false)
    setSaved(true)
    // reload page to apply new locale messages
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm opacity-80">{t('settings.appLanguage')}</label>
        <select value={appLanguage} onChange={(e) => setAppLanguage(e.target.value)} className="bg-transparent border border-white/20 rounded px-3 py-2">
          <option value="en">{t('languages.en')}</option>
          <option value="it">{t('languages.it')}</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-sm opacity-80">{t('settings.meditationLanguage')}</label>
        <select value={meditationLanguage} onChange={(e) => setMeditationLanguage(e.target.value)} className="bg-transparent border border-white/20 rounded px-3 py-2">
          <option value="en">{t('languages.en')}</option>
          <option value="it">{t('languages.it')}</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
          {saving ? '...' : t('common.save')}
        </button>
        {saved && <span className="text-sm opacity-70">{t('common.saved')}</span>}
      </div>
    </div>
  )
}
