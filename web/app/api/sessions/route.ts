import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ sessions: [] })
  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ sessions: [] })
  const sessions = await prisma.meditationSession.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ sessions })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { meditationId, requestedParams, sequence, durationSec } = body || {}
  if (!meditationId || !durationSec) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const created = await prisma.meditationSession.create({
    data: {
      userId: me.id,
      meditationId,
      requestedParams: JSON.stringify(requestedParams ?? {}),
      sequence: JSON.stringify(sequence ?? []),
      durationSec,
      playedSec: 0,
    },
  })
  return NextResponse.json({ id: created.id })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { id, playedSec } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.meditationSession.update({ where: { id }, data: { playedSec: Math.max(0, Math.floor(playedSec ?? 0)) } })
  return NextResponse.json({ ok: true })
}
