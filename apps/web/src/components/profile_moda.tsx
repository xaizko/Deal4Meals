import type { CSSProperties, ReactNode } from 'react'
import { BRAND } from '../brand'

export type SavedDealPreview = {
  id: string | number
  title: string
  merchant: string
  price: number
}

export type ProfileModaProps = {
  open: boolean
  onClose: () => void
  name?: string
  email?: string
  savedDeals?: SavedDealPreview[]
  onViewAllSaved?: () => void
  onEditProfile?: () => void
  onMySubmissions?: () => void
  onNotificationPreferences?: () => void
  onAccountSettings?: () => void
  onSignOut?: () => void
}

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`
}

const DEFAULT_SAVED: SavedDealPreview[] = [
  {
    id: 1,
    title: 'Placeholder deal title',
    merchant: 'Placeholder merchant',
    price: 0,
  },
  {
    id: 2,
    title: 'Placeholder deal title',
    merchant: 'Placeholder merchant',
    price: 0,
  },
]

export function ProfileModa({
  open,
  onClose,
  name = 'Placeholder name',
  email = 'name@example.com',
  savedDeals = DEFAULT_SAVED,
  onViewAllSaved,
  onEditProfile,
  onMySubmissions,
  onNotificationPreferences,
  onAccountSettings,
  onSignOut,
}: ProfileModaProps) {
  if (!open) return null

  return (
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

        <div className="mb-4 flex items-center gap-3 border-b border-zinc-200 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
            <UserOutlineIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{name}</p>
            <p className="text-sm text-zinc-500">{email}</p>
          </div>
        </div>

        <div className="mb-4 border-b border-zinc-200 pb-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-semibold text-zinc-900">Saved deals</p>
            <p className="text-xs text-zinc-500">{savedDeals.length} saved</p>
          </div>

          <ul className="space-y-3">
            {savedDeals.map((deal) => (
              <li key={deal.id} className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-500">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {deal.title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{deal.merchant}</p>
                  <p className="text-sm font-bold" style={{ color: BRAND }}>
                    {deal.price > 0 ? formatMoney(deal.price) : '$X.XX'}
                  </p>
                </div>
                <BookmarkIcon className="h-5 w-5 shrink-0" style={{ color: BRAND }} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onViewAllSaved}
            className="mt-3 text-sm font-medium text-amber-700 hover:underline"
          >
            View all saved deals
          </button>
        </div>

        <nav className="mb-4 space-y-1">
          <MenuRow
            label="Edit profile"
            icon={<UserOutlineIcon className="h-5 w-5" style={{ color: BRAND }} />}
            onClick={onEditProfile}
          />
          <MenuRow
            label="My submissions"
            icon={<DocIcon className="h-5 w-5" style={{ color: BRAND }} />}
            onClick={onMySubmissions}
          />
          <MenuRow
            label="Notification preferences"
            icon={<BellIcon className="h-5 w-5" style={{ color: BRAND }} />}
            onClick={onNotificationPreferences}
          />
          <MenuRow
            label="Account settings"
            icon={<GearIcon className="h-5 w-5" style={{ color: BRAND }} />}
            onClick={onAccountSettings}
          />
        </nav>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function MenuRow({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left hover:bg-zinc-50"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium text-zinc-900">{label}</span>
      <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
    </button>
  )
}

function UserOutlineIcon({
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
      strokeWidth="1.8"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-8 8" />
    </svg>
  )
}

function BookmarkIcon({
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
      <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-6-3-6 3V4z" />
    </svg>
  )
}

function DocIcon({
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
      strokeWidth="1.8"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v6h6" />
    </svg>
  )
}

function BellIcon({
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
      strokeWidth="1.8"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M6 9a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  )
}

function GearIcon({
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
      strokeWidth="1.8"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.21 5.23a.75.75 0 011.06.02l4.25 4.5a.75.75 0 010 1.04l-4.25 4.5a.75.75 0 11-1.08-1.04L10.17 10 7.23 6.29a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}
