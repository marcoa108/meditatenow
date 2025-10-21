import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'
import ProfileForm from './ProfileForm'
import RemindersForm from './RemindersForm'

export default async function Settings() {
  const session = await getServerSession()
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null
  const appLanguage = me?.profile?.appLanguage ?? 'en'
  const meditationLanguage = me?.profile?.meditationLanguage ?? 'en'
  const username = me?.profile?.username ?? null
  const avatarUrl = me?.profile?.avatarUrl ?? null
  const remindEnabled = me?.profile?.notifyReminders ?? false
  const remindTime = me?.profile?.reminderSchedule ?? null

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <SettingsForm initialAppLanguage={appLanguage} initialMeditationLanguage={meditationLanguage} />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <ProfileForm initialUsername={username} initialAvatarUrl={avatarUrl} />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reminders</h2>
        <RemindersForm initialEnabled={remindEnabled} initialTime={remindTime} />
        <p className="text-xs opacity-60">Processing is triggered via /api/reminders/trigger?secret=... (set REMINDERS_SECRET). Uses Resend email.</p>
      </div>
    </div>
  )
}

