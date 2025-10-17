'use client'
import { FormEvent, useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/'
    const params = new URLSearchParams(window.location.search)
    return params.get('callbackUrl') || '/'
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await signIn('email', { email, callbackUrl, redirect: false })
    if (res?.ok) setSent(true)
    else setError(res?.error ?? 'Failed to send email')
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {sent ? (
        <p>Check your email for a sign-in link.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-3 rounded bg-white/5 border border-white/10"
          />
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Send magic link</button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      )}
    </div>
  )
}
