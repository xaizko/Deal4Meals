import { useState, type FormEvent } from 'react'
import { BRAND } from '../brand.ts'

export type SignUpCredentials = {
  username: string
  password: string
}

export type SignUpModaProps = {
  open: boolean
  onClose: () => void
  onSignUp?: (credentials: SignUpCredentials) => void
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#066E14] focus:ring-1 focus:ring-[#066E14]'

export function SignUpModa({ open, onClose, onSignUp }: SignUpModaProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    onSignUp?.({ username: username.trim(), password })
    setPassword('')
    setConfirmPassword('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-16 pb-8 sm:pt-24"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-up-moda-title"
        className="mb-8 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="sign-up-moda-title" className="text-xl font-bold text-zinc-900">
              Sign up
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose a username to create your account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-zinc-900">
              Username
            </span>
            <input
              required
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-zinc-900">
              Password
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-zinc-900">
              Confirm password
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={inputClass}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
