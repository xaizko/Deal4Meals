import {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type FormEvent,
	type ReactNode,
} from 'react'
import { API_URL } from '../api'
import { BRAND } from '../brand.ts'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const DIETARY = [
	'Vegetarian',
	'Vegan',
	'Gluten-free',
	'Dairy-free',
	'Halal',
	'Not specified',
] as const

export type PostDealModaProps = {
	open: boolean
	onClose: () => void
	onSubmit: (payload: PostDealForm) => Promise<void>
}

export type NutritionServing = {
	label: string
	gramWeight: number
	kcal: number | null
	protein_g: number | null
	carbs_g: number | null
	fat_g: number | null
	sugar_g: number | null
	fiber_g: number | null
	sodium_mg: number | null
}

export type FoodMatch = {
	fdcId: number
	description: string
	dataType: string
}

export type SelectedNutrition = {
	fdcId: number
	description: string
	serving: NutritionServing
}

export type ManualMacros = {
	calories: string
	protein: string
	carbs: string
	fats: string
}

const emptyManualMacros: ManualMacros = {
	calories: '',
	protein: '',
	carbs: '',
	fats: '',
}

export type PostDealForm = {
	title: string
	merchant: string
	category: string
	price: string
	originalPrice: string
	location: string
	description: string
	dealUrl: string
	validFrom: string
	validUntil: string
	validDays: string[]
	startTime: string
	endTime: string
	dietary: string[]
	photos: File[]
	nutrition: SelectedNutrition | null
	manualMacros: ManualMacros
}

const emptyForm: PostDealForm = {
	title: '',
	merchant: '',
	category: '',
	price: '',
	originalPrice: '',
	location: '',
	description: '',
	dealUrl: '',
	validFrom: '',
	validUntil: '',
	validDays: [],
	startTime: '',
	endTime: '',
	dietary: [],
	photos: [],
	nutrition: null,
	manualMacros: emptyManualMacros,
}

const inputClass =
	'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#066E14] focus:ring-1 focus:ring-[#066E14]'
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_PHOTOS = 5

export function PostDealModa({ open, onClose, onSubmit }: PostDealModaProps) {
	const [form, setForm] = useState<PostDealForm>(emptyForm)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [foods, setFoods] = useState<FoodMatch[]>([])
	const [foodsLoading, setFoodsLoading] = useState(false)
	const [foodsError, setFoodsError] = useState<string | null>(null)
	const [servings, setServings] = useState<NutritionServing[]>([])
	const [servingsLoading, setServingsLoading] = useState(false)
	const [servingsError, setServingsError] = useState<string | null>(null)
	const nutritionRequest = useRef(0)

	useEffect(() => {
		if (!open) return

		const name = form.title.trim()
		if (name.length < 2) {
			setFoods([])
			setFoodsError(null)
			setFoodsLoading(false)
			return
		}

		const controller = new AbortController()
		const timer = window.setTimeout(async () => {
			setFoodsLoading(true)
			setFoodsError(null)
			try {
				const response = await fetch(
					`${API_URL}/foods/search?name=${encodeURIComponent(name)}`,
					{ signal: controller.signal },
				)
				const payload: unknown = await response.json()
				if (!response.ok) {
					throw new Error(errorMessage(payload, 'Could not look up nutrition matches.'))
				}
				setFoods(parseFoods(payload))
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') return
				setFoods([])
				setFoodsError(err instanceof Error ? err.message : 'Could not look up nutrition matches.')
			} finally {
				if (!controller.signal.aborted) setFoodsLoading(false)
			}
		}, 400)

		return () => {
			controller.abort()
			window.clearTimeout(timer)
		}
	}, [open, form.title])

	if (!open) return null

		function update<K extends keyof PostDealForm>(key: K, value: PostDealForm[K]) {
			setForm((prev) => ({ ...prev, [key]: value }))
		}

		function updateTitle(value: string) {
			nutritionRequest.current += 1
			setForm((prev) => ({
				...prev,
				title: value,
				nutrition: null,
				manualMacros: emptyManualMacros,
			}))
			setFoods([])
			setFoodsError(null)
			setFoodsLoading(value.trim().length >= 2)
			setServings([])
			setServingsError(null)
			setServingsLoading(false)
		}

		async function selectFood(fdcIdValue: string) {
			const fdcId = Number(fdcIdValue)
			const food = foods.find((match) => match.fdcId === fdcId)
			if (!food) {
				nutritionRequest.current += 1
				update('nutrition', null)
				setServings([])
				setServingsError(null)
				setServingsLoading(false)
				return
			}

			const request = ++nutritionRequest.current
			setServingsLoading(true)
			setServingsError(null)
			setServings([])
			update('nutrition', null)
			try {
				const response = await fetch(`${API_URL}/foods/${food.fdcId}`)
				const payload: unknown = await response.json()
				if (request !== nutritionRequest.current) return
				if (!response.ok) {
					throw new Error(errorMessage(payload, 'Could not load nutrition options.'))
				}
				const nextServings = parseServings(payload)
				setServings(nextServings)
				const serving = nextServings[0]
				if (serving) {
					update('nutrition', {
						fdcId: food.fdcId,
						description: food.description,
						serving,
					})
				}
			} catch (err) {
				if (request !== nutritionRequest.current) return
				setServingsError(
					err instanceof Error ? err.message : 'Could not load nutrition options.',
				)
			} finally {
				if (request === nutritionRequest.current) setServingsLoading(false)
			}
		}

		function selectServing(indexValue: string) {
			const serving = servings[Number(indexValue)]
			if (!serving || !form.nutrition) return
			update('nutrition', { ...form.nutrition, serving })
		}

		function updateManualMacro(key: keyof ManualMacros, value: string) {
			setForm((prev) => ({
				...prev,
				manualMacros: { ...prev.manualMacros, [key]: value },
			}))
		}

		function toggleDay(day: string) {
			setForm((prev) => ({
				...prev,
				validDays: prev.validDays.includes(day)
					? prev.validDays.filter((d) => d !== day)
					: [...prev.validDays, day],
			}))
		}

		function toggleDietary(tag: string) {
			setForm((prev) => ({
				...prev,
				dietary: prev.dietary.includes(tag)
					? prev.dietary.filter((d) => d !== tag)
					: [...prev.dietary, tag],
			}))
		}

		async function handleSubmit(e: FormEvent) {
			e.preventDefault()
			setSubmitting(true)
			setError(null)
			if (foodsLoading || servingsLoading) {
				setError('Still looking up nutrition options.')
				setSubmitting(false)
				return
			}
			if (foods.length > 0 && !form.nutrition) {
				setError('Select a nutrition option for this deal.')
				setSubmitting(false)
				return
			}
			if (foods.length === 0 && !manualMacrosAreValid(form.manualMacros)) {
				setError('Macro values must be zero or greater, or left blank.')
				setSubmitting(false)
				return
			}
			try {
				await onSubmit(form)
				setForm(emptyForm)
				setFoods([])
				setServings([])
				setFoodsError(null)
				setServingsError(null)
				onClose()
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to submit deal.')
			} finally {
				setSubmitting(false)
			}
		}

		const noFoodMatches =
			!foodsLoading && form.title.trim().length >= 2 && foods.length === 0

		return (
			<div
				className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-16 pb-8 sm:pt-24"
				role="presentation"
				onClick={() => {
					if (!submitting) onClose()
				}}
			>
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby="post-deal-title"
					className="mb-8 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="mb-4 flex items-start justify-between gap-3">
						<div>
							<h2 id="post-deal-title" className="text-xl font-bold text-zinc-900">
								Post a deal
							</h2>
							<p className="mt-1 text-sm text-zinc-500">
								Add the details below. All fields are required unless marked optional.
							</p>
						</div>
						<button
							type="button"
							disabled={submitting}
							onClick={onClose}
							aria-label="Close"
							className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
						>
							✕
						</button>
					</div>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<Field label="Deal title">
							<input
								required
								value={form.title}
								onChange={(e) => updateTitle(e.target.value)}
								placeholder="Placeholder deal title"
								className={inputClass}
							/>
						</Field>

						<div>
							<p className="text-sm font-semibold text-zinc-900">Nutrition</p>
							<p className="mb-2 text-xs text-zinc-500">
								{noFoodMatches
									? 'No nutrition matches for this title. Enter macros yourself, or leave them blank.'
									: 'Matches come from the deal title. Pick the closest food, then the serving size.'}
							</p>
							<select
								value={form.nutrition?.fdcId ?? ''}
								onChange={(e) => void selectFood(e.target.value)}
								disabled={foodsLoading || foods.length === 0}
								className={inputClass}
								aria-label="Nutrition food match"
							>
								<option value="">
									{foodsLoading
										? 'Looking up foods…'
										: noFoodMatches
											? 'No nutrition matches'
											: foods.length === 0
												? 'Type a deal title to see nutrition matches'
												: 'Select a food match'}
								</option>
								{foods.map((food) => (
									<option key={food.fdcId} value={food.fdcId}>
										{food.description}
									</option>
								))}
							</select>
							{foodsError ? (
								<p role="alert" className="mt-1 text-xs text-red-600">
									{foodsError}
								</p>
							) : null}

							{noFoodMatches ? (
								<div className="mt-2 grid grid-cols-2 gap-3">
									<Field label="Calories (optional)">
										<input
											type="number"
											min="0"
											step="1"
											value={form.manualMacros.calories}
											onChange={(e) => updateManualMacro('calories', e.target.value)}
											placeholder="kcal"
											className={inputClass}
										/>
									</Field>
									<Field label="Protein (optional)">
										<input
											type="number"
											min="0"
											step="0.1"
											value={form.manualMacros.protein}
											onChange={(e) => updateManualMacro('protein', e.target.value)}
											placeholder="g"
											className={inputClass}
										/>
									</Field>
									<Field label="Carbs (optional)">
										<input
											type="number"
											min="0"
											step="0.1"
											value={form.manualMacros.carbs}
											onChange={(e) => updateManualMacro('carbs', e.target.value)}
											placeholder="g"
											className={inputClass}
										/>
									</Field>
									<Field label="Fat (optional)">
										<input
											type="number"
											min="0"
											step="0.1"
											value={form.manualMacros.fats}
											onChange={(e) => updateManualMacro('fats', e.target.value)}
											placeholder="g"
											className={inputClass}
										/>
									</Field>
								</div>
							) : (
								<>
									<select
										value={servingIndex(servings, form.nutrition?.serving)}
										onChange={(e) => selectServing(e.target.value)}
										disabled={servingsLoading || servings.length === 0}
										className={`${inputClass} mt-2`}
										aria-label="Nutrition serving"
										required={foods.length > 0}
									>
										<option value="">
											{servingsLoading
												? 'Loading nutrition options…'
												: 'Select a nutrition option'}
										</option>
										{servings.map((serving, index) => (
											<option key={`${serving.label}-${serving.gramWeight}`} value={index}>
												{formatServing(serving)}
											</option>
										))}
									</select>
									{servingsError ? (
										<p role="alert" className="mt-1 text-xs text-red-600">
											{servingsError}
										</p>
									) : null}
								</>
							)}
						</div>

						<Field label="Merchant">
							<input
								required
								value={form.merchant}
								onChange={(e) => update('merchant', e.target.value)}
								placeholder="Placeholder merchant"
								className={inputClass}
							/>
						</Field>

						<Field label="Category (required)">
							<input
								required
								value={form.category}
								onChange={(e) => update('category', e.target.value)}
								placeholder="e.g. Mexican, Pizza, Vegan"
								className={inputClass}
							/>
						</Field>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<Field label="Price">
								<input
									required
									type="number"
									min="0"
									step="0.01"
									value={form.price}
									onChange={(e) => update('price', e.target.value)}
									placeholder="0.00"
									className={inputClass}
								/>
							</Field>
							
							<Field label="Original price">
								<input
									required
									type="number"
									min={form.price || '0'}
									step="0.01"
									value={form.originalPrice}
									onChange={(e) => update('originalPrice', e.target.value)}
									placeholder="0.00"
									className={inputClass}
								/>
							</Field>
							
							<Field label="Location">
								<input
									required
									value={form.location}
									onChange={(e) => update('location', e.target.value)}
									placeholder="Address or area"
									className={inputClass}
								/>
							</Field>
						</div>

						<Field label="Deal link (optional)">
							<input
								type="url"
								value={form.dealUrl}
								onChange={(e) => update('dealUrl', e.target.value)}
								placeholder="https://example.com/deal"
								className={inputClass}
							/>
						</Field>

						<Field label="Description">
							<textarea
								required
								rows={3}
								maxLength={500}
								value={form.description}
								onChange={(e) => update('description', e.target.value)}
								placeholder="Describe the deal and any conditions"
								className={`${inputClass} h-24 resize-none overflow-y-auto`}
							/>
							<span className="mt-1 block text-right text-xs text-zinc-500">
								{form.description.length}/500
							</span>
						</Field>

						<div>
							<p className="mb-2 text-sm font-semibold text-zinc-900">Validity</p>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<Field label="Valid from">
									<div className="relative">
										<input
											required
											type="date"
											value={form.validFrom}
											onChange={(e) => update('validFrom', e.target.value)}
											className={`${inputClass} pr-9`}
										/>
										<CalendarIcon
											className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
											style={{ color: BRAND }}
										/>
									</div>
								</Field>
								<Field label="Valid until">
									<div className="relative">
										<input
											required
											type="date"
											value={form.validUntil}
											onChange={(e) => update('validUntil', e.target.value)}
											className={`${inputClass} pr-9`}
										/>
										<CalendarIcon
											className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
											style={{ color: BRAND }}
										/>
									</div>
								</Field>
							</div>
						</div>

						<div>
							<p className="text-sm font-semibold text-zinc-900">Valid days</p>
							<p className="mb-2 text-xs text-zinc-500">Choose all applicable days</p>
							<div className="flex flex-wrap gap-2">
								{DAYS.map((day) => {
									const active = form.validDays.includes(day)
									return (
										<button
											key={day}
											type="button"
											onClick={() => toggleDay(day)}
											className={`rounded-md px-3 py-1.5 text-xs font-medium ${
												active
													? 'text-white'
													: 'border border-zinc-300 bg-zinc-100 text-zinc-800'
											}`}
											style={active ? { backgroundColor: BRAND } : undefined}
										>
											{day}
										</button>
									)
								})}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<Field label="Start time">
								<input
									required
									type="time"
									value={form.startTime}
									onChange={(e) => update('startTime', e.target.value)}
									className={inputClass}
								/>
							</Field>
							<Field label="End time">
								<input
									required
									type="time"
									value={form.endTime}
									onChange={(e) => update('endTime', e.target.value)}
									className={inputClass}
								/>
							</Field>
						</div>

						<div>
							<p className="text-sm font-semibold text-zinc-900">Dietary restrictions</p>
							<p className="mb-2 text-xs text-zinc-500">
								Merchant-provided tags · Select all that apply
							</p>
							<div className="flex flex-wrap gap-2">
								{DIETARY.map((tag) => {
									const active = form.dietary.includes(tag)
									return (
										<button
											key={tag}
											type="button"
											onClick={() => toggleDietary(tag)}
											className={`rounded-md px-3 py-1.5 text-xs font-medium ${
												active
													? 'text-white'
													: 'border border-zinc-300 bg-zinc-100 text-zinc-800'
											}`}
											style={active ? { backgroundColor: BRAND } : undefined}
										>
											{tag}
										</button>
									)
								})}
							</div>
						</div>
				
						<div>
							<p className="mb-2 text-sm font-semibold text-zinc-900">
								Deal photos <span className="font-normal text-zinc-500">(optional)</span>
							</p>
							<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-slate-100 px-4 py-4">
								<ImageIcon className="h-8 w-8 shrink-0" style={{ color: BRAND }} />
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-zinc-800">
										{form.photos.length
											? `${form.photos.length} photo${form.photos.length === 1 ? '' : 's'} selected`
											: 'Choose photos to attach'}
									</p>
									<p className="text-xs text-zinc-500">
										JPG or PNG · Up to {MAX_PHOTOS} photos, {MAX_PHOTO_BYTES / 1024 / 1024} MB combined
									</p>
								</div>
								<span className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800">
									Choose photos
								</span>
								<input
									type="file"
									accept="image/png,image/jpeg"
									multiple
									className="sr-only"
									onChange={(e) => {
										const photos = Array.from(e.target.files ?? [])
										const validTypes = photos.every(
											(photo) => photo.type === 'image/png' || photo.type === 'image/jpeg',
										)
										const totalBytes = photos.reduce((total, photo) => total + photo.size, 0)
										if (photos.length > MAX_PHOTOS) {
											setError(`Choose no more than ${MAX_PHOTOS} photos.`)
										} else if (!validTypes) {
											setError('Only JPEG and PNG photos are supported.')
										} else if (totalBytes > MAX_PHOTO_BYTES) {
											setError('Selected photos may not exceed 5 MB combined.')
										} else {
											setError(null)
											update('photos', photos)
										}
										e.target.value = ''
									}}
								/>
							</label>
							{form.photos.length > 0 ? (
								<ul className="mt-2 space-y-1 text-xs text-zinc-600">
									{form.photos.map((photo, index) => (
										<li
											key={`${photo.name}-${photo.lastModified}`}
											className="flex items-center justify-between gap-2"
										>
											<span className="truncate">{photo.name}</span>
											<button
												type="button"
												disabled={submitting}
												onClick={() =>
													update(
														'photos',
														form.photos.filter((_, photoIndex) => photoIndex !== index),
													)
												}
												className="shrink-0 text-red-700 underline disabled:opacity-50"
											>
												Remove
											</button>
										</li>
									))}
								</ul>
							) : null}
						</div>

						{error ? (
							<p role="alert" className="text-sm text-red-600">
							{error}
							</p>
						) : null}

						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								disabled={submitting}
								onClick={onClose}
								className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
								>
								Cancel
							</button>
							<button
								type="submit"
								disabled={submitting}
								className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
								style={{ backgroundColor: BRAND }}
								>
									{submitting ? 'Reviewing and submitting…' : 'Submit deal'}
							</button>
						</div>
					</form>
				</div>
			</div>
		)
}

function errorMessage(payload: unknown, fallback: string): string {
	if (
		typeof payload === 'object' &&
		payload !== null &&
		'error' in payload &&
		typeof payload.error === 'string'
	) {
		return payload.error
	}
	return fallback
}

function parseFoods(payload: unknown): FoodMatch[] {
	if (typeof payload !== 'object' || payload === null || !('foods' in payload)) return []
	const { foods } = payload
	if (!Array.isArray(foods)) return []
	return foods.flatMap((food) => {
		if (
			typeof food !== 'object' ||
			food === null ||
			typeof food.fdcId !== 'number' ||
			typeof food.description !== 'string'
		) {
			return []
		}
		return [
			{
				fdcId: food.fdcId,
				description: food.description,
				dataType: typeof food.dataType === 'string' ? food.dataType : '',
			},
		]
	})
}

function parseServings(payload: unknown): NutritionServing[] {
	if (typeof payload !== 'object' || payload === null || !('servings' in payload)) return []
	const { servings } = payload
	if (!Array.isArray(servings)) return []
	return servings.flatMap((serving) => {
		if (
			typeof serving !== 'object' ||
			serving === null ||
			typeof serving.label !== 'string' ||
			typeof serving.gramWeight !== 'number'
		) {
			return []
		}
		return [
			{
				label: serving.label,
				gramWeight: serving.gramWeight,
				kcal: numberOrNull(serving.kcal),
				protein_g: numberOrNull(serving.protein_g),
				carbs_g: numberOrNull(serving.carbs_g),
				fat_g: numberOrNull(serving.fat_g),
				sugar_g: numberOrNull(serving.sugar_g),
				fiber_g: numberOrNull(serving.fiber_g),
				sodium_mg: numberOrNull(serving.sodium_mg),
			},
		]
	})
}

function manualMacrosAreValid(macros: ManualMacros): boolean {
	return Object.values(macros).every((value) => {
		const trimmed = value.trim()
		if (!trimmed) return true
		const amount = Number(trimmed)
		return Number.isFinite(amount) && amount >= 0
	})
}

export function macrosFromManual(macros: ManualMacros): {
	calories: number | null
	protein: number | null
	carbs: number | null
	fats: number | null
} | null {
	const calories = optionalMacro(macros.calories)
	const protein = optionalMacro(macros.protein)
	const carbs = optionalMacro(macros.carbs)
	const fats = optionalMacro(macros.fats)
	if (calories == null && protein == null && carbs == null && fats == null) return null
	return { calories, protein, carbs, fats }
}

function optionalMacro(value: string): number | null {
	const trimmed = value.trim()
	if (!trimmed) return null
	const amount = Number(trimmed)
	return Number.isFinite(amount) ? amount : null
}

function numberOrNull(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function servingIndex(servings: NutritionServing[], selected: NutritionServing | undefined): string {
	if (!selected) return ''
	const index = servings.findIndex(
		(serving) => serving.label === selected.label && serving.gramWeight === selected.gramWeight,
	)
	return index >= 0 ? String(index) : ''
}

function formatAmount(value: number | null, unit: string): string {
	return value == null ? `— ${unit}` : `${value}${unit}`
}

function formatServing(serving: NutritionServing): string {
	return `${serving.label} · ${formatAmount(serving.kcal, ' kcal')} · ${formatAmount(serving.protein_g, 'g protein')} · ${formatAmount(serving.carbs_g, 'g carbs')} · ${formatAmount(serving.fat_g, 'g fat')}`
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="mb-1 block text-sm font-semibold text-zinc-900">{label}</span>
			{children}
		</label>
	)
}

function CalendarIcon({
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
		<rect x="3" y="5" width="18" height="16" rx="2" />
		<path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
		</svg>
	)
}

function ImageIcon({
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
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<circle cx="9" cy="10" r="1.5" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-8 8" />
		</svg>
	)
}
