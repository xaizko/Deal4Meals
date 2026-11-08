import { useState } from 'react'

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
    <header className="w-full bg-[#0b5c3b] text-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: logo + dietary dropdown */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <a
            href="/"
            className="shrink-0 font-['Caveat_Brush',cursive] text-2xl tracking-wide text-white no-underline sm:text-3xl"
          >
            DEALS4MEALS
          </a>

          <label className="relative inline-flex h-9 w-[10.5rem] shrink-0 items-center rounded-md bg-white text-[#0b5c3b] sm:w-44">
            <span className="pointer-events-none absolute left-2.5">
              <LeafIcon className="h-4 w-4" />
            </span>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              aria-label="Select dietary preference"
              className="h-full w-full appearance-none rounded-md bg-transparent py-1.5 pr-8 pl-8 text-sm font-medium text-[#0b5c3b] outline-none"
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
            <span className="pointer-events-none absolute right-2.5">
              <ChevronDownIcon className="h-4 w-4" />
            </span>
          </label>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="h-9 rounded-md bg-white px-3 text-sm font-semibold text-[#0b5c3b] hover:bg-green-50 sm:px-4"
          >
            Weekly Plan
          </button>

          <button
            type="button"
            aria-label="Add"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b5c3b] hover:bg-green-50"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b5c3b] hover:bg-green-50"
          >
            <UserIcon className="h-5 w-5" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}