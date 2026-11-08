import { useState } from 'react'
import { BRAND } from '../brand.ts'
import { SignInModa, type SignInCredentials } from './sign_in_moda.tsx'

export type ProfileModaProps = {
  open: boolean
  onClose: () => void
  name?: string
  email?: string
  /** Total likes this user has received across deals */
  totalLikes?: number
  /** Controlled signed-in state (optional — defaults to internal state) */
  signedIn?: boolean
  onSignIn?: (credentials: SignInCredentials) => void
  onSignOut?: () => void
}

export function ProfileModa({
  open,
  onClose,
  name = 'Placeholder name',
  email = 'name@example.com',
  totalLikes = 0,
  signedIn: signedInProp,
  onSignIn,
  onSignOut,
}: ProfileModaProps) {
  const [signedInLocal, setSignedInLocal] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [sessionEmail, setSessionEmail] = useState(email)
  const signedIn = signedInProp ?? signedInLocal

  if (!open && !signInOpen) return null

  function handleSignedIn(credentials: SignInCredentials) {
    if (signedInProp === undefined) setSignedInLocal(true)
    setSessionEmail(credentials.email || email)
    onSignIn?.(credentials)
    setSignInOpen(false)
  }

  function handleSignOut() {
    if (signedInProp === undefined) setSignedInLocal(false)
    onSignOut?.()
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={onClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-moda-title"
            className="my-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="profile-moda-title" className="text-xl font-bold text-zinc-900">
                Profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {signedIn ? (
              <>
                <div className="mb-4 flex items-center gap-3 border-b border-zinc-200 pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
                    <UserOutlineIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">{name}</p>
                    <p className="text-sm text-zinc-500">{sessionEmail}</p>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Total likes
                  </p>
                  <p className="mt-1 text-3xl font-bold" style={{ color: BRAND }}>
                    {totalLikes}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Likes received on your deals
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600">
                  Sign in to see your profile and total likes.
                </p>
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <SignInModa
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignIn={handleSignedIn}
      />
    </>
  )
}

function UserOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
