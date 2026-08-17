'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/pocketbase/client'

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const pb = createClient()
    try {
      if (mode === 'signup') {
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
        })
      }
      await pb.collection('users').authWithPassword(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setError('')
    setLoading(true)
    const pb = createClient()
    try {
      await pb.collection('users').authWithPassword(
        process.env.NEXT_PUBLIC_DEMO_EMAIL,
        process.env.NEXT_PUBLIC_DEMO_PASSWORD
      )
      router.push('/dashboard')
    } catch (err) {
      setError(err?.message || 'Demo login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="min. 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full"
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <button type="button" onClick={handleDemoLogin} disabled={loading}>
        → View Demo
      </button>
    </form>
  )
}
