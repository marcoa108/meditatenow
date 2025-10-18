import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

type Body = {
  language?: string
  level?: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = (await req.json().catch(() => ({}))) as Body
  const language = body.language || me.profile?.meditationLanguage || 'en'
  const level = body.level || me.profile?.level || 'beginner'

  // select clips
  const clips = await prisma.clip.findMany({
    where: { language },
  })
  const byType = Object.fromEntries(clips.map((c) => [c.type + '_' + c.number, c])) as Record<string, any>

  const sequence: { clipId: string; variantId: string | null; label: string; durationSec: number }[] = []

  function pushClip(c?: any) {
    if (!c) return
    sequence.push({ clipId: c.id, variantId: null, label: `${c.type} #${c.number}`, durationSec: c.durationSec })
  }

  // very naive builder for MVP
  pushClip(byType['intro_1'])
  if (level === 'beginner') pushClip(byType['first_meditation_1'])
  pushClip(byType['outro_1'])

  // resolve first variant for each clip
  const variantMap: Record<string, string | null> = {}
  for (const item of sequence) {
    if (!variantMap[item.clipId]) {
      const v = await prisma.clipVariant.findFirst({ where: { clipId: item.clipId }, orderBy: { variantNo: 'asc' } })
      variantMap[item.clipId] = v?.id ?? null
    }
    item.variantId = variantMap[item.clipId]
  }

  const total = sequence.reduce((s, i) => s + i.durationSec, 0)
  const meditation = await prisma.meditation.create({
    data: {
      userId: me.id,
      level,
      params: JSON.stringify({ strategy: 'feel-sahaj', language, level }),
      totalDurationSec: total,
      items: {
        create: sequence.map((i, idx) => ({ order: idx, clipVariantId: i.variantId ?? undefined, isSilence: false, durationSec: i.durationSec })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({
    meditationId: meditation.id,
    totalDurationSec: meditation.totalDurationSec,
    items: meditation.items.map((i) => ({ id: i.id, order: i.order, clipVariantId: i.clipVariantId, durationSec: i.durationSec })),
  })
}
