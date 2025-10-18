import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

export default async function Settings() {
  const session = await getServerSession()
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null
  const appLanguage = me?.profile?.appLanguage ?? 'en'
  const meditationLanguage = me?.profile?.meditationLanguage ?? 'en'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForm initialAppLanguage={appLanguage} initialMeditationLanguage={meditationLanguage} />
    </div>
  )
}

