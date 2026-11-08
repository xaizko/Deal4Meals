import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import { PostDealModa } from './post_deal_moda'
import { ProfileModa } from './profile_moda'

export function Header() {
  const [postOpen, setPostOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <header className="w-full text-white" style={{ backgroundColor: BRAND }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <Link
            to="/"
            className="shrink-0 font-['Caveat_Brush',cursive] text-xl tracking-wide text-white no-underline sm:text-2xl"
          >
            DEALS4MEALS
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/weekly"
              className="inline-flex h-7 items-center rounded-md bg-white px-3 text-xs font-semibold no-underline hover:bg-zinc-100"
              style={{ color: BRAND }}
            >
              Weekly Plan
            </Link>

            <button
              type="button"
              aria-label="Post a deal"
              onClick={() => setPostOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-zinc-100"
              style={{ color: BRAND }}
            >
              <PlusIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Profile"
              onClick={() => setProfileOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-zinc-100"
              style={{ color: BRAND }}
            >
              <UserIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <PostDealModa open={postOpen} onClose={() => setPostOpen(false)} />
      <ProfileModa open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
