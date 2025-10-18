'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Item { id: string; order: number; clipVariantId: string | null; durationSec: number }

import createSession from './__session'
export default function FeelSahaj() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const [running, setRunning] = useState(false)

  const total = useMemo(() => (items ? items.reduce((s, i) => s + i.durationSec, 0) : 0), [items])
  const elapsed = useMemo(() => {
    if (!items) return 0
    let s = 0
    for (let i = 0; i < current; i++) s += items[i].durationSec
    return s + (items[current] ? (items[current].durationSec - remaining) : 0)
  }, [items, current, remaining])

  async function start() {
    setLoading(true)
    const res = await fetch('/api/meditations/feel-sahaj', { method: 'POST' })
    const data = await res.json()
    setItems(data.items); createSession(data)
    setCurrent(0)
    setRemaining(data.items[0]?.durationSec ?? 0)
    setLoading(false)
    setRunning(true)
  }

  function tick() {
    setRemaining((r) => {
      if (r <= 1) {
        // advance
        setCurrent((idx) => {
          const next = idx + 1
          if (!items || next >= items.length) {
            setRunning(false)
            return idx
          }
          setRemaining(items[next].durationSec)
          return next
        })
        return 0
      }
      return r - 1
    })
  }

  useEffect(() => {
    if (running) {
      timer.current = setInterval(tick, 1000)
    } else if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [running])

  function pause() { setRunning(false) }
  function resume() { if (items && items.length) setRunning(true) }
  function reset() { setRunning(false); setItems(null); setCurrent(0); setRemaining(0) }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">I Feel Sahaj</h1>
      {!items ? (
        <div className="space-y-4">
          <p className="opacity-80">Builds a simple meditation.</p>
          <button disabled={loading} onClick={start} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
            {loading ? 'Preparing...' : 'Start'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded border border-white/10">
            <div className="text-sm opacity-70">Progress</div>
            <div className="h-2 bg-white/10 rounded">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: `${(elapsed / total) * 100}%` }} />
            </div>
            <div className="flex justify-between text-sm mt-1 opacity-70">
              <span>{Math.round(elapsed)}s</span>
              <span>{total}s</span>
            </div>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={it.id} className={`p-3 rounded border ${idx === current ? 'border-emerald-500' : 'border-white/10'} flex justify-between`}>
                <span>Step {idx + 1}</span>
                <span>{idx === current ? `${remaining}s left` : `${it.durationSec}s`}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {!running ? (
              <button onClick={resume} className="px-3 py-2 rounded bg-blue-600 text-white">{elapsed ? 'Resume' : 'Start'}</button>
            ) : (
              <button onClick={pause} className="px-3 py-2 rounded bg-yellow-600 text-white">Pause</button>
            )}
            <button onClick={reset} className="px-3 py-2 rounded bg-gray-600 text-white">Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}




