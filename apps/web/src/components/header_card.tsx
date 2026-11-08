const BRAND = '#066E14'

export function Header() {
  return (
    <header className="w-full text-white" style={{ backgroundColor: BRAND }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
        <a
          href="/"
          className="shrink-0 font-['Caveat_Brush',cursive] text-xl tracking-wide text-white no-underline sm:text-2xl"
        >
          DEALS4MEALS
        </a>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="h-7 rounded-md bg-white px-3 text-xs font-semibold hover:bg-green-50"
            style={{ color: BRAND }}
          >
            Weekly Plan
          </button>

          <button
            type="button"
            aria-label="Add"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-green-50"
            style={{ color: BRAND }}
          >
            <PlusIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white hover:bg-green-50"
            style={{ color: BRAND }}
          >
            <UserIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
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
