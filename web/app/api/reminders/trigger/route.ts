import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

function shouldSend(now: Date, schedule: string, last?: Date | null) {
  // schedule format HH:mm (24h), assumed UTC
  const [hh, mm] = schedule.split(':').map((s) => parseInt(s, 10))
  if (isNaN(hh) || isNaN(mm)) return false
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0))
  if (now < today) return false
  if (!last) return true
  // do not send more than once per calendar day
  return last.getUTCFullYear() !== now.getUTCFullYear() || last.getUTCMonth() !== now.getUTCMonth() || last.getUTCDate() !== now.getUTCDate()
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (!process.env.REMINDERS_SECRET || secret !== process.env.REMINDERS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const now = new Date()
  const profiles = await prisma.profile.findMany({
    where: { notifyReminders: true, reminderSchedule: { not: null } },
    include: { user: true },
  })

  let sent = 0
  for (const p of profiles) {
    const schedule = p.reminderSchedule as string
    if (!schedule) continue
    if (!p.user?.email) continue
    if (!shouldSend(now, schedule, p.reminderLastSentAt)) continue
    try {
      await resend.emails.send({
        from: 'MeditateNow <noreply@meditatenow.app>',
        to: p.user.email,
        subject: 'Time to meditate',
        text: 'Gentle reminder to take a few minutes to meditate today.'
      })
      await prisma.profile.update({ where: { userId: p.userId }, data: { reminderLastSentAt: now } })
      sent++
    } catch (e) {
      // ignore failures
    }
  }

  return NextResponse.json({ ok: true, sent })
}
