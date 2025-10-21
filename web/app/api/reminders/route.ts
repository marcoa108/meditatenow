import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json().catch(() => ({} as any))
  const notifyReminders = Boolean(body?.notifyReminders)
  const reminderSchedule = (body?.reminderSchedule ?? null) as string | null // format: HH:mm in 24h

  await prisma.profile.upsert({
    where: { userId: me.id },
    create: { userId: me.id, notifyReminders, reminderSchedule },
    update: { notifyReminders, reminderSchedule },
  })

  return NextResponse.json({ ok: true })
}
