import { useEffect, useState } from 'react'
import { BRAND } from '../brand.ts'
import type { Deal } from './deal_card'
import { API_URL } from '../api'

export type DealMacros = {
	kcal?: number
	protein_g?: number
	fat_g?: number
	carbs_g?: number
	sugar_g?: number
	sodium_mg?: number
	fiber_g?: number
	serving?: string
}

export type MacroModaProps = {
	deal: Deal
	open: boolean
	onClose: () => void
}

function formatValidity(deal: Deal) {
	if (deal.valid_days?.length) return deal.valid_days.join(', ')

	if (!deal.start_date && !deal.expired_at) return 'Not specified'
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
	const start = deal.start_date ? new Date(deal.start_date) : null
	const end = deal.expired_at ? new Date(deal.expired_at) : null
	const startLabel =
		start && !Number.isNaN(start.getTime()) ? dateFormatter.format(start) : null
	const endLabel = end && !Number.isNaN(end.getTime()) ? dateFormatter.format(end) : null

	if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
	return startLabel ?? endLabel ?? 'Not specified'
}

function formatValidityTime(deal: Deal) {
	if (!deal.start_date && !deal.expired_at) return null
	const formatter = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit',
	})
	const start = deal.start_date ? new Date(deal.start_date) : null
	const end = deal.expired_at ? new Date(deal.expired_at) : null
	const startLabel =
		start && !Number.isNaN(start.getTime()) ? formatter.format(start) : null
	const endLabel = end && !Number.isNaN(end.getTime()) ? formatter.format(end) : null

	if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
	return startLabel ?? endLabel
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function readNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && value.trim() !== '') {
		const amount = Number(value)
		if (Number.isFinite(amount)) return amount
	}
	return undefined
}

function firstNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
	for (const key of keys) {
		const amount = readNumber(record[key])
		if (amount !== undefined) return amount
	}
	return undefined
}

function readMacros(macros: unknown): DealMacros {
	if (!isRecord(macros)) return {}
	return {
		kcal: firstNumber(macros, ['calories', 'kcal']),
		protein_g: firstNumber(macros, ['protein', 'protein_g']),
		fat_g: firstNumber(macros, ['fats', 'fat', 'fat_g']),
		carbs_g: firstNumber(macros, ['carbs', 'carbs_g']),
		sugar_g: firstNumber(macros, ['sugar_g', 'sugar']),
		sodium_mg: firstNumber(macros, ['sodium_mg', 'sodium']),
		fiber_g: firstNumber(macros, ['fiber_g', 'fiber']),
		serving: typeof macros.serving === 'string' ? macros.serving : undefined,
	}
}

export function MacroModa({ deal, open, onClose }: MacroModaProps) {
	const [macros, setMacros] = useState<DealMacros>(() => readMacros(deal.macros))
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return

		const controller = new AbortController()
		setMacros(readMacros(deal.macros))
		setLoading(true)
		setError(null)

		async function loadDeal() {
			try {
				const response = await fetch(`${API_URL}/deals/${deal.id}`, {
					signal: controller.signal,
				})
				const payload: unknown = await response.json()
				if (!response.ok) {
					const message =
						isRecord(payload) && typeof payload.error === 'string'
							? payload.error
							: 'Could not load macro data.'
					throw new Error(message)
				}
				setMacros(readMacros(isRecord(payload) ? payload.macros : undefined))
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') return
				setError(err instanceof Error ? err.message : 'Could not load macro data.')
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}

		void loadDeal()
		return () => controller.abort()
	}, [open, deal.id, deal.macros])

	if (!open) return null

		const validityTime = formatValidityTime(deal)
		const rows = [
			{ label: 'Calories', key: 'kcal', value: macros.kcal, unit: 'kcal' },
			{ label: 'Protein', key: 'protein_g', value: macros.protein_g, unit: 'g' },
			{ label: 'Fat', key: 'fat_g', value: macros.fat_g, unit: 'g' },
			{ label: 'Carbs', key: 'carbs_g', value: macros.carbs_g, unit: 'g' },
			{ label: 'Sugar', key: 'sugar_g', value: macros.sugar_g, unit: 'g' },
			{ label: 'Sodium', key: 'sodium_mg', value: macros.sodium_mg, unit: 'mg' },
			{ label: 'Fiber', key: 'fiber_g', value: macros.fiber_g, unit: 'g' },
		] as const

		return (
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
				role="presentation"
				onClick={onClose}
			>
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby="macro-moda-title"
					className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="mb-4 flex items-start justify-between gap-3">
						<div>
							<p className="text-sm font-semibold" style={{ color: BRAND }}>
								Deal details
							</p>
							<h2 id="macro-moda-title" className="text-lg font-bold text-zinc-900">
								{deal.item_name}
							</h2>
							<p className="text-sm text-zinc-500">
								{deal.merchant ?? 'Placeholder merchant'}
							</p>
							{deal.description ? (
								<p className="mt-2 text-sm text-zinc-700">{deal.description}</p>
							) : null}
							<dl className="mt-4 space-y-2 rounded-lg bg-zinc-50 p-3 text-sm">
								<div>
									<dt className="font-semibold text-zinc-700">Location</dt>
									<dd className="text-zinc-600">
										{deal.location?.trim() || 'Not specified'}
									</dd>
								</div>
								<div>
									<dt className="font-semibold text-zinc-700">Valid days</dt>
									<dd className="text-zinc-600">{formatValidity(deal)}</dd>
								</div>
								{validityTime ? (
									<div>
										<dt className="font-semibold text-zinc-700">Valid time</dt>
										<dd className="text-zinc-600">{validityTime}</dd>
									</div>
								) : null}
							</dl>
							{deal.deal_url ? (
								<a
									href={deal.deal_url}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 inline-block text-sm font-semibold underline"
									style={{ color: BRAND }}
								>
									Visit deal
								</a>
							) : null}
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
							>
								✕
						</button>
					</div>

					<div className="mb-4 rounded-lg bg-zinc-50 p-3">
						<p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
							Macros
						</p>
						{macros.serving ? (
							<p className="mt-1 text-xs text-zinc-500">Serving: {macros.serving}</p>
						) : null}
						{loading ? (
							<p className="mt-2 text-sm text-zinc-500">Loading macro data…</p>
						) : null}
						{error ? (
							<p role="alert" className="mt-2 text-sm text-red-600">
								{error}
							</p>
						) : null}
						<ul className="mt-2 space-y-2">
							{rows.map((row) => (
							<li
								key={row.key}
								className="flex items-center justify-between text-sm text-zinc-800"
								>
									<span>{row.label}</span>
									<span className="font-semibold">
										{row.value == null ? '—' : `${row.value} ${row.unit}`}
									</span>
							</li>
							))}
						</ul>
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
							style={{ backgroundColor: BRAND }}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		)
}
