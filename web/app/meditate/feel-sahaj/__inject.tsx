async function createSession(data: { meditationId: string; totalDurationSec: number; items: any[] }) {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meditationId: data.meditationId,
        requestedParams: { strategy: 'feel-sahaj' },
        sequence: data.items,
        durationSec: data.totalDurationSec,
      }),
    })
    const j = await res.json()
    ;(window as any).__sessionId = j.id
  } catch {}
}
