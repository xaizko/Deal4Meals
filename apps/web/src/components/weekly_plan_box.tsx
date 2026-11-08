import type { CSSProperties } from 'react'
import { BRAND } from '../brand'

/** One meal option in a weekly plan day — filled later by Gemini / API */
export type WeeklyOption = {
  id: string | number
  optionNumber: number
  /** Address only (no distance) */
  location: string
  rating?: string
  /** Cost of the special */
  price: number
  /** Original price before the special, used for Saved */
  original_price?: number
  dietary?: string
  item_name?: string
  merchant?: string
}

export type WeeklyPlanBoxProps = {
  option: WeeklyOption
  onSelect?: (option: WeeklyOption) => void
}

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`
}

export function WeeklyPlanBox({ option, onSelect }: WeeklyPlanBoxProps) {
  const saved =
    option.original_price != null
      ? Math.max(0, option.original_price - option.price)
      : null

  return (
    <article
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm transition hover:shadow-md"
      onClick={() => onSelect?.(option)}
    >
      <div
        className="px-3 py-2 text-center text-sm font-semibold text-white"
        style={{ backgroundColor: BRAND }}
      >
        Option {option.optionNumber}
      </div>

      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-2">
          {option.item_name ? (
            <p className="truncate text-sm font-semibold text-zinc-900">
              {option.item_name}
            </p>
          ) : null}
          <p className="flex items-center gap-1.5 text-sm text-zinc-600">
            <PinIcon className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
            <span className="truncate">{option.location || 'Placeholder location'}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-zinc-600">
            <StarIcon className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
            <span>{option.rating ?? 'Placeholder rating'}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs text-zinc-500">Price</p>
          <p className="text-2xl font-bold leading-none" style={{ color: BRAND }}>
            {formatMoney(option.price)}
          </p>
          {saved != null && saved > 0 ? (
            <div className="mt-1 flex flex-col items-end gap-1">
              <p className="text-xs font-semibold text-amber-600">
                Saved {formatMoney(saved)}
              </p>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-zinc-900">
                <BookmarkIcon className="h-3 w-3" />
                Saved
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-zinc-100 px-4 py-2 text-xs text-zinc-600">
        Dietary: {option.dietary?.trim() ? option.dietary : 'not specified'}
      </div>
    </article>
  )
}

function PinIcon({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
    </svg>
  )
}

function StarIcon({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.1 1.11-6.47-4.7-4.58 6.49-.94L12 3z"
      />
    </svg>
  )
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-6-3-6 3V4z" />
    </svg>
  )
}
