import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { inviteCode, name, appLanguage, meditationLanguage, level } = body ?? {}
  if (!inviteCode || typeof inviteCode !== 'string')
    return NextResponse.json({ error: 'Invite code required' }, { status: 400 })

  const code = await prisma.invitationCode.findUnique({ where: { code: inviteCode } })
  if (!code || !code.active)
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })

  // upsert user and profile
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { inviteCode, name: name || undefined },
  })

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { appLanguage, meditationLanguage, level },
    create: { userId: user.id, appLanguage, meditationLanguage, level },
  })

  return NextResponse.json({ ok: true })
}
