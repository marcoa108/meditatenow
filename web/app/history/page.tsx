import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export default async function HistoryPage() {
  const session = await getServerSession()
  const me = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null
  const sessions = me
    ? await prisma.meditationSession.findMany({ where: { userId: me.id }, orderBy: { createdAt: 'desc' }, take: 50 })
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">History</h1>
      {sessions.length === 0 ? (
        <p className="opacity-70">No sessions yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="p-3 rounded border border-white/10 flex justify-between">
              <span>{new Date(s.createdAt).toLocaleString()}</span>
              <span>{s.playedSec}/{s.durationSec}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
