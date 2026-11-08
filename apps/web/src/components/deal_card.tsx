import { useState } from 'react'
import { MacroModa } from './macro_moda'

const BRAND = '#066E14'

/** Matches the Deals table in apps/api/src/db-setup.ts */
export type Deal = {
  id: number
  user_id?: number | null
  item_name: string
  price: number
  original_price: number
  macros?: unknown
  deal_score?: number | null
  created_at?: string
  start_date?: string
  expired_at?: string
  // UI-only fields until the schema grows
  merchant?: string
  category?: string
  location?: string
  distance_mi?: number
  rating?: string
  image_url?: string
}

export type DealCardProps = {
  deal: Deal
  onViewDetails?: (deal: Deal) => void
  onLike?: (deal: Deal) => void
  onDislike?: (deal: Deal) => void
}

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`
}

function formatDaysTime(deal: Deal) {
  if (!deal.start_date && !deal.expired_at) return 'Days: — · Time: —'
  const start = deal.start_date ? new Date(deal.start_date) : null
  const end = deal.expired_at ? new Date(deal.expired_at) : null
  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const days =
    start && end ? `${dayFmt.format(start)}–${dayFmt.format(end)}` : '—'
  const time = start ? timeFmt.format(start) : '—'
  return `Days: ${days} · Time: ${time}`
}

function formatLocation(deal: Deal) {
  const place = deal.location ?? 'Placeholder location'
  if (deal.distance_mi == null) return place
  return `${place} • ${deal.distance_mi.toFixed(1)} mi`
}

export function DealCard({ deal, onViewDetails, onLike, onDislike }: DealCardProps) {
  const [macroOpen, setMacroOpen] = useState(false)
  const saved = Math.max(0, deal.original_price - deal.price)

  function handleViewDetails() {
    setMacroOpen(true)
    onViewDetails?.(deal)
  }

  return (
    <>
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-zinc-200 text-sm text-zinc-500 sm:h-44">
        {deal.image_url ? (
          <img src={deal.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          'Image placeholder'
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: BRAND }}>
              {deal.category ?? 'Placeholder'}
            </p>
            <h3 className="truncate text-base font-bold text-zinc-900">
              {deal.item_name}
            </h3>
            <p className="truncate text-sm text-zinc-500">
              {deal.merchant ?? 'Placeholder merchant'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-zinc-500">Deal price</p>
            <p className="text-2xl font-bold leading-none" style={{ color: BRAND }}>
              {formatMoney(deal.price)}
            </p>
            <div className="mt-1 flex flex-col items-end gap-1">
              <p className="text-xs font-semibold text-amber-600">
                Saved {formatMoney(saved)}
              </p>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-zinc-900">
                <BookmarkIcon className="h-3 w-3" />
                Saved
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
            {formatDaysTime(deal)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            {formatLocation(deal)}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleViewDetails}
            className="rounded-md px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            View deal details
          </button>

          <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
            <StarIcon className="h-3.5 w-3.5" />
            {deal.rating ?? 'Placeholder rating'}
          </span>

          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => onLike?.(deal)}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Like
            </button>
            <button
              type="button"
              onClick={() => onDislike?.(deal)}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Dislike
            </button>
          </div>
        </div>
      </div>
    </article>

    <MacroModa
      deal={deal}
      open={macroOpen}
      onClose={() => setMacroOpen(false)}
    />
    </>
  )
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-6-3-6 3V4z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.1 1.11-6.47-4.7-4.58 6.49-.94L12 3z"
      />
    </svg>
  )
}
