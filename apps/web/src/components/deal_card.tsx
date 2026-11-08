import { useEffect, useState } from 'react'
import { BRAND } from '../brand'
import { MacroModa } from './macro_moda'
import { API_URL } from '../api'

// Deals table in apps/api/src/db-setup.ts
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
	merchant?: string
	category?: string
	location?: string
	description?: string
	deal_url?: string
	valid_days?: string[]
	dietary_restrictions?: string[]
	distance_mi?: number
	rating?: string
	net_likes?: number
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

function readRating(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && value.trim() !== '') {
		const amount = Number(value)
		if (Number.isFinite(amount)) return amount
	}
	return 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function errorFrom(payload: unknown, fallback: string): string {
	return isRecord(payload) && typeof payload.error === 'string' ? payload.error : fallback
}

async function adjustPosterReputation(userId: number, delta: number) {
	const currentResponse = await fetch(`${API_URL}/user/${userId}`)
	const currentPayload: unknown = await currentResponse.json()
	if (!currentResponse.ok) {
		throw new Error(errorFrom(currentPayload, 'Could not load the poster’s reputation.'))
	}
	const current = isRecord(currentPayload) ? readRating(currentPayload.reputation) : 0

	const updateResponse = await fetch(`${API_URL}/user/${userId}/reputation`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ reputation: current + delta }),
	})
	const updatePayload: unknown = await updateResponse.json()
	if (!updateResponse.ok) {
		throw new Error(errorFrom(updatePayload, 'Could not update the poster’s reputation.'))
	}
}

function voteDelta(
	current: 'like' | 'dislike' | null,
	next: 'like' | 'dislike',
): { value: number; reaction: 'like' | 'dislike' | null } {
	if (next === 'like') {
		if (current === 'like') return { value: -1, reaction: null }
		if (current === 'dislike') return { value: 2, reaction: 'like' }
		return { value: 1, reaction: 'like' }
	}
	if (current === 'dislike') return { value: 1, reaction: null }
	if (current === 'like') return { value: -2, reaction: 'dislike' }
	return { value: -1, reaction: 'dislike' }
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
	return deal.location ?? 'Placeholder location'
}

function DealExpiry({ expiredAt }: { expiredAt?: string }) {
	if (!expiredAt) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
			<ClockIcon className="h-3.5 w-3.5 shrink-0" />
			Expiry unknown
			</span>
		)
	}

	const end = new Date(expiredAt)
	if (Number.isNaN(end.getTime())) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
			<ClockIcon className="h-3.5 w-3.5 shrink-0" />
			Expiry unknown
			</span>
		)
	}

	const now = Date.now()
	const diffMs = end.getTime() - now
	const dateLabel = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(end)

	if (diffMs <= 0) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
			<ClockIcon className="h-3.5 w-3.5 shrink-0" />
			Expired {dateLabel}
			</span>
		)
	}

	const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
	const relative =
		diffHours < 24
			? `Expires in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
			: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`

			return (
				<span
				className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
				style={{ backgroundColor: BRAND }}
				title={dateLabel}
				>
				<ClockIcon className="h-3.5 w-3.5 shrink-0" />
				{relative}
				</span>
			)
}

export function DealCard({ deal, onViewDetails, onLike, onDislike }: DealCardProps) {
	const [macroOpen, setMacroOpen] = useState(false)
	const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null)
	const [rating, setRating] = useState(() => readRating(deal.net_likes))
	const [voting, setVoting] = useState(false)
	const saved = Math.max(0, deal.original_price - deal.price)

	useEffect(() => {
		setRating(readRating(deal.net_likes))
	}, [deal.id, deal.net_likes])

	function handleViewDetails() {
		setMacroOpen(true)
		onViewDetails?.(deal)
	}

	async function castVote(next: 'like' | 'dislike') {
		if (voting) return
		const { value, reaction: nextReaction } = voteDelta(reaction, next)
		setVoting(true)
		try {
			const response = await fetch(`${API_URL}/deals/${deal.id}/net_likes/${value}`, {
				method: 'PATCH',
			})
			const payload: unknown = await response.json()
			if (!response.ok) {
				throw new Error(errorFrom(payload, 'Could not update the rating.'))
			}
			const posterId =
				isRecord(payload) && typeof payload.user_id === 'number'
					? payload.user_id
					: deal.user_id
			const nextRating = isRecord(payload) ? readRating(payload.net_likes) : rating + value
			setRating(nextRating)
			setReaction(nextReaction)
			if (typeof posterId === 'number') {
				await adjustPosterReputation(posterId, value)
			}
			const updated = { ...deal, net_likes: nextRating }
			if (next === 'like') onLike?.(updated)
			else onDislike?.(updated)
		} catch (err) {
			console.error(err)
		} finally {
			setVoting(false)
		}
	}

	return (
		<>
		<article className="flex flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm">
			<div className="flex h-40 items-center justify-center bg-zinc-200 text-sm text-zinc-500 sm:h-44">
				{deal.image_url ? (
				<img src={deal.image_url} alt="" className="h-full w-full object-cover" />) 
					: ('Image placeholder')}
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
						{deal.original_price > deal.price ? (
							<p className="text-xs text-zinc-500 line-through">
								Was {formatMoney(deal.original_price)}
							</p>
						) : null}
						<p className="text-2xl font-bold leading-none" style={{ color: BRAND }}>
							{formatMoney(deal.price)}
						</p>
						{saved > 0 ? (
							<p className="mt-1 text-xs font-semibold text-amber-600">
								Saved {formatMoney(saved)}
							</p>
						) : null}
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
					<DealExpiry expiredAt={deal.expired_at} />
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

					<span
						className={`inline-flex items-center gap-1 text-xs font-semibold ${
							rating < 0 ? 'text-red-600' : 'text-zinc-700'
						}`}
					>
						<ThumbsUpIcon className="h-3.5 w-3.5" />
						{rating}
					</span>

					<div className="ml-auto flex gap-1.5">
						<button
							type="button"
							onClick={() => void castVote('like')}
							disabled={voting}
							aria-pressed={reaction === 'like'}
							className={`rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
								reaction === 'like'
									? 'border-transparent text-white'
									: 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
							}`}
							style={
								reaction === 'like' ? { backgroundColor: BRAND } : undefined
							}
							>
								Like
						</button>

						<button
							type="button"
							onClick={() => void castVote('dislike')}
							disabled={voting}
							aria-pressed={reaction === 'dislike'}
							className={`rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
								reaction === 'dislike'
									? 'border-red-600 bg-red-600 text-white'
									: 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
							}`}
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

function ThumbsUpIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
		<path
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M7 11v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3zm0 0l3.2-6.2A2 2 0 0112 3.8V8h6.2a2 2 0 011.9 2.6l-1.4 6.2A2 2 0 0116.8 18H7"
		/>
		</svg>
	)
}
