import { useState } from 'react'
import { BRAND } from '../brand.ts'
import { SignInModa } from './sign_in_moda.tsx'
import { SignUpModa, type SignUpCredentials } from './sign_up_moda.tsx'

export type ProfileModaProps = {
  open: boolean
  onClose: () => void
  username?: string
  totalLikes?: number
  signedIn?: boolean
  onSignIn?: (user: { id: number; username: string; reputation?: number }) => void
  onSignUp?: (credentials: SignUpCredentials) => void
  onSignOut?: () => void
}

export function ProfileModa({
  open,
  onClose,
  username = 'guest',
  totalLikes = 0,
  signedIn: signedInProp,
  onSignIn,
  onSignUp,
  onSignOut,
}: ProfileModaProps) {
  const [signedInLocal, setSignedInLocal] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [sessionUsername, setSessionUsername] = useState(username)
  const signedIn = signedInProp ?? signedInLocal

  if (!open && !signInOpen && !signUpOpen) return null

  function handleSignedIn(user: { id: number; username: string; reputation?: number }) {
    if (signedInProp === undefined) setSignedInLocal(true)
    setSessionUsername(user.username)
    onSignIn?.(user)
    setSignInOpen(false)
  }

  function handleSignedUp(credentials: SignUpCredentials) {
    if (signedInProp === undefined) setSignedInLocal(true)
    setSessionUsername(credentials.username || username)
    onSignUp?.(credentials)
    setSignUpOpen(false)
  }

  function handleSignOut() {
    if (signedInProp === undefined) setSignedInLocal(false)
    onSignOut?.()
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-16 pb-8 sm:pt-24"
          role="presentation"
          onClick={onClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-moda-title"
            className="mb-8 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
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
                    <p className="font-semibold text-zinc-900">@{sessionUsername}</p>
                    <p className="text-sm text-zinc-500">Signed in</p>
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
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">
                  Sign in or create an account with a username to see your profile and
                  total likes.
                </p>
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpOpen(true)}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Sign up
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
      <SignUpModa
        open={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSignUp={handleSignedUp}
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
