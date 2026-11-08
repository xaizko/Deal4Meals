import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import { PostDealModa } from './post_deal_moda'
import { ProfileModa } from './profile_moda'

export type HeaderProps = {
  onSearch?: (query: string) => void
}

export function Header({ onSearch }: HeaderProps = {}) {
  const [postOpen, setPostOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    onSearch?.(query.trim())
  }

  return (
    <>
      <header className="w-full text-white" style={{ backgroundColor: BRAND }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="shrink-0 font-['Arial',Helvetica,sans-serif] text-xl tracking-wide text-white no-underline sm:text-2xl"
            >
              DEALS4MEALS
            </Link>

            <form
              onSubmit={handleSearch}
              className="relative min-w-0 max-w-md flex-1"
              role="search"
            >
              <label htmlFor="header-search" className="sr-only">
                Search deals
              </label>
              <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400">
                <SearchIcon className="h-3.5 w-3.5" />
              </span>
              <input
                id="header-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search deals…"
                className="h-7 w-full rounded-md border-0 bg-white py-1 pr-3 pl-8 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/60"
              />
            </form>
          </div>

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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
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
