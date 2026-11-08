import { useState } from 'react'

const BRAND = '#066E14'

const DIETARY_OPTIONS = [
  'Any diet',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Halal',
  'Kosher',
] as const

export function Header() {
  const [diet, setDiet] = useState<string>('')

  return (
    <header className="w-full text-white" style={{ backgroundColor: BRAND }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
        {/* Left: logo + dietary dropdown */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <a
            href="/"
            className="shrink-0 font-['Caveat_Brush',cursive] text-xl tracking-wide text-white no-underline sm:text-2xl"
          >
            DEALS4MEALS
          </a>

          <label
            className="relative inline-flex h-7 w-36 shrink-0 items-center rounded-md bg-white sm:w-40"
            style={{ color: BRAND }}
          >
            <span className="pointer-events-none absolute left-2">
              <LeafIcon className="h-3.5 w-3.5" />
            </span>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              aria-label="Select dietary preference"
              className="h-full w-full appearance-none rounded-md bg-transparent py-1 pr-2 pl-7 text-xs font-medium outline-none"
              style={{ color: BRAND }}
            >
              <option value="" disabled>
                Select diet
              </option>
              {DIETARY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Right: actions */}
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

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.67l1.06.33C6.85 17 9 12 17 10v2c0 1.1.9 2 2 2h2V8h-4z" />
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
