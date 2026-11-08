import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND } from '../brand'
import { PostDealModa, macrosFromManual, type PostDealForm } from './post_deal_moda'
import type { Deal } from './deal_card'
import { ProfileModa } from './profile_moda'

export type HeaderProps = {
	onSearch: (query: string) => void
	onDealCreated: (deal: Deal) => void
}

const API_URL = 'http://localhost:3000'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

export function Header({ onSearch, onDealCreated }: HeaderProps) {
	const navigate = useNavigate()
	const [postOpen, setPostOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [query, setQuery] = useState('')

	function handleSearch(e: FormEvent) {
		e.preventDefault()
		onSearch?.(query.trim())
		navigate('/')
	}

	async function submitDeal(form: PostDealForm) {
		const price = Number(form.price)
		const originalPrice = Number(form.originalPrice)
		const response = await fetch(`${API_URL}/deals`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				item_name: form.title.trim(),
				merchant: form.merchant.trim(),
				category: form.category.trim(),
				location: form.location.trim(),
				price,
				original_price: originalPrice,
				description: form.description.trim(),
				deal_url: form.dealUrl.trim() || null,
				valid_days: form.validDays,
				dietary_restrictions: form.dietary,
				macros: form.nutrition
					? {
							protein: form.nutrition.serving.protein_g,
							carbs: form.nutrition.serving.carbs_g,
							fats: form.nutrition.serving.fat_g,
							calories: form.nutrition.serving.kcal,
							fdcId: form.nutrition.fdcId,
							description: form.nutrition.description,
							serving: form.nutrition.serving.label,
							gramWeight: form.nutrition.serving.gramWeight,
						}
					: macrosFromManual(form.manualMacros),
				start_date: `${form.validFrom}T${form.startTime}:00`,
				expired_at: `${form.validUntil}T${form.endTime}:00`,
			}),
		})
		const payload: unknown = await response.json()

		if (!response.ok) {
			const message =
				isRecord(payload) && typeof payload.error === 'string'
					? payload.error
					: `Failed to submit deal (HTTP ${response.status}).`
					throw new Error(message)
		}

		if (
			!isRecord(payload) ||
			typeof payload.id !== 'number' ||
			typeof payload.item_name !== 'string' ||
			typeof payload.price !== 'number' ||
			typeof payload.original_price !== 'number'
		) {
			throw new Error('The server returned an invalid deal.')
		}

		onDealCreated({
			id: payload.id,
			item_name: payload.item_name,
			price: payload.price,
			original_price: payload.original_price,
			user_id:
				typeof payload.user_id === 'number' || payload.user_id === null
					? payload.user_id
					: undefined,
					merchant: typeof payload.merchant === 'string' ? payload.merchant : undefined,
					category: typeof payload.category === 'string' ? payload.category : undefined,
					location: typeof payload.location === 'string' ? payload.location : undefined,
					image_url: typeof payload.image_url === 'string' ? payload.image_url : undefined,
					deal_url: typeof payload.deal_url === 'string' ? payload.deal_url : undefined,
					description:
						typeof payload.description === 'string' ? payload.description : undefined,
					valid_days: Array.isArray(payload.valid_days)
						? payload.valid_days.filter((day): day is string => typeof day === 'string')
						: undefined,
						dietary_restrictions: Array.isArray(payload.dietary_restrictions)
							? payload.dietary_restrictions.filter(
								(restriction): restriction is string => typeof restriction === 'string',
							)
								: undefined,
								start_date: typeof payload.start_date === 'string' ? payload.start_date : undefined,
								expired_at: typeof payload.expired_at === 'string' ? payload.expired_at : undefined,
		})
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
						<button
							type="submit"
							aria-label="Search deals"
							className="absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
						>
							<SearchIcon className="h-3.5 w-3.5" />
						</button>
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

		<PostDealModa
			open={postOpen}
			onClose={() => setPostOpen(false)}
			onSubmit={submitDeal}
		/>
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
