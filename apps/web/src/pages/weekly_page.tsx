import { useMemo, useState, type FormEvent } from 'react'
import {
	WeeklyPlanBox,
	type WeeklyMacros,
	type WeeklyOption,
} from '../components/weekly_plan_box'
import './weekly_page.css'

export type WeeklyDayPlan = {
	day: string
	options: WeeklyOption[]
	dailyTotals?: WeeklyMacros & { cost?: number }
}

type MealPlanParameters = {
	budget: string
	dietary_restrictions: string
	target_calories: string
	target_protein: string
	target_carbs: string
	target_fats: string
	target_fiber: string
	target_sodium: string
	target_sugar: string
}

type WeeklyPlanResponse = {
	plan: WeeklyDayPlan[]
	weeklyTotalCost?: number
	dealsAnalyzed?: number
}

const INITIAL_PARAMETERS: MealPlanParameters = {
	budget: '0',
	dietary_restrictions: 'none',
	target_calories: '0',
	target_protein: '0',
	target_carbs: '0',
	target_fats: '0',
	target_fiber: '0',
	target_sodium: '0',
	target_sugar: '0',
}

const API_URL = 'http://localhost:3000'

// Type guard to check if a value is a non-null object
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

// Helper function to ensure a value is a finite number
function finiteNumber(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
	return value
}

// Helper function to read macros from an unknown value
function readMacros(value: unknown): WeeklyMacros | undefined {
	if (!isRecord(value)) return undefined

		const macros: WeeklyMacros = {}
		for (const key of ['protein', 'carbs', 'fats', 'calories'] as const) {
			const amount = finiteNumber(value[key])
			if (amount !== undefined) macros[key] = amount
		}
	return Object.keys(macros).length > 0 ? macros : undefined
}

// Parses the response from the meal planner API and returns a structured WeeklyPlanResponse
function parseWeeklyPlan(payload: unknown): WeeklyPlanResponse {
	if (!isRecord(payload) || payload.status !== 'success' || !isRecord(payload.mealPlan)) {
		throw new Error('The meal planner returned an invalid response.')
	}

	const rawPlan = payload.mealPlan.plan
	if (!Array.isArray(rawPlan) || rawPlan.length === 0) {
		throw new Error('The meal planner did not return any days.')
	}

	const plan = rawPlan.map((rawDay, dayIndex): WeeklyDayPlan => {
		if (!isRecord(rawDay) || !Array.isArray(rawDay.meals)) {
			throw new Error('The meal planner returned an invalid day.')
		}

		const rawDayNumber = rawDay.day
		const day =
			typeof rawDayNumber === 'number' && Number.isInteger(rawDayNumber)
				? `Day ${rawDayNumber}`
				: typeof rawDayNumber === 'string'
					? rawDayNumber
					: `Day ${dayIndex + 1}`

					const options = rawDay.meals.map((rawMeal, mealIndex): WeeklyOption => {
						if (!isRecord(rawMeal)) {
							throw new Error(`The meal planner returned an invalid meal for ${day}.`)
						}

						const price = finiteNumber(rawMeal.cost)

						if (
							(typeof rawMeal.deal_id !== 'string' && typeof rawMeal.deal_id !== 'number') ||
							typeof rawMeal.item_name !== 'string' ||
						price === undefined
						) {
							throw new Error(`The meal planner returned incomplete meal details for ${day}.`)
						}

						return {
							id: rawMeal.deal_id,
							optionNumber: mealIndex + 1,
							item_name: rawMeal.item_name,
							merchant: typeof rawMeal.merchant === 'string' ? rawMeal.merchant : undefined,
							location: typeof rawMeal.merchant === 'string' ? rawMeal.merchant : '',
							price,
							image_url: typeof rawMeal.image_url === 'string' ? rawMeal.image_url : undefined,
							macros: readMacros(rawMeal.macros),
						}
					})

					const totals = isRecord(rawDay.daily_totals) ? rawDay.daily_totals : undefined

					const dailyTotals = totals
						? {
							...readMacros(totals),
							cost: finiteNumber(totals.cost),
						}
							: undefined

							return { day, options, dailyTotals }
	})

	return {
		plan,
		weeklyTotalCost: finiteNumber(payload.mealPlan.weekly_total_cost),
		dealsAnalyzed: finiteNumber(payload.dealsAnalyzed),
	}
}

// Define the numeric fields for the meal plan parameters
const numericFields: Array<{
	key: Exclude<keyof MealPlanParameters, 'dietary_restrictions'>
	label: string
	unit: string
}> = [
	{ key: 'budget', label: 'Weekly budget', unit: '$' },
	{ key: 'target_calories', label: 'Calories', unit: 'kcal/day' },
	{ key: 'target_protein', label: 'Protein', unit: 'g/day' },
	{ key: 'target_carbs', label: 'Carbohydrates', unit: 'g/day' },
	{ key: 'target_fats', label: 'Fat', unit: 'g/day' },
	{ key: 'target_fiber', label: 'Fiber', unit: 'g/day' },
	{ key: 'target_sodium', label: 'Sodium', unit: 'mg/day' },
	{ key: 'target_sugar', label: 'Sugar', unit: 'g/day' },
]

// The main component for the Weekly Plan page
export function WeeklyPage() {
	const [parameters, setParameters] = useState(INITIAL_PARAMETERS)
	const [result, setResult] = useState<WeeklyPlanResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function generatePlan(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setLoading(true)
		setError(null)

		try {
			// Body for target parameters
			const body = {
				...parameters,
				budget: Number(parameters.budget),
				target_calories: Number(parameters.target_calories),
				target_protein: Number(parameters.target_protein),
				target_carbs: Number(parameters.target_carbs),
				target_fats: Number(parameters.target_fats),
				target_fiber: Number(parameters.target_fiber),
				target_sodium: Number(parameters.target_sodium),
				target_sugar: Number(parameters.target_sugar),
			}

			const response = await fetch(`${API_URL}/meal-plans`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			const payload: unknown = await response.json()

			if (!response.ok) {
				const message =
					isRecord(payload) && typeof payload.error === 'string'
						? payload.error
						: `Failed to generate meal plan (HTTP ${response.status}).`
						throw new Error(message)
			}

			setResult(parseWeeklyPlan(payload))
		} catch (err) {
			setResult(null)
			setError(err instanceof Error ? err.message : 'Failed to generate meal plan.')
		} finally {
			setLoading(false)
		}
	}

// Calculate the total number of meals in the week
const totalMeals = useMemo(() => result?.plan.reduce((sum, day) => sum + day.options.length, 0) ?? 0, [result],)

// Update a specific parameter in the meal plan parameters
function updateParameter(key: keyof MealPlanParameters, value: string) {
	setParameters((current) => ({ ...current, [key]: value }))
}

return (
	<main className="weekly-page">
		<div className="weekly-page__container">
			<header className="weekly-page__header">
				<h1 className="weekly-page__title">
					Weekly Plan
				</h1>
				<p className="weekly-page__intro">
					Set your budget and daily nutrition goals to generate a personalized plan.
				</p>
			</header>

			<form
				onSubmit={generatePlan}
				className="weekly-form"
			>
				<h2 className="weekly-form__title">Your plan preferences</h2>

				<p className="weekly-form__description">
					Nutrition goals are daily targets. All amounts must be zero or greater.
				</p>

				<div className="weekly-form__fields">
					{numericFields.map(({ key, label, unit }) => (
						<label key={key} className="weekly-form__label">
							{label}
							<span className="weekly-form__input-wrap">
								<input
									type="number"
									min="0"
									step="any"
									required
									value={parameters[key]}
									onChange={(event) => updateParameter(key, event.target.value)}
									className="weekly-form__input"
								/>
							</span>
							<span className="weekly-form__unit">
								{unit}
							</span>
						</label>
					))}

					<label className="weekly-form__label">
						Dietary preference
						<select
							value={parameters.dietary_restrictions}
							onChange={(event) =>
								updateParameter('dietary_restrictions', event.target.value)
							}
							className="weekly-form__select"
						>
							<option value="none">No restriction</option>
							<option value="vegetarian">Vegetarian</option>
							<option value="vegan">Vegan</option>
						</select>
					</label>
				</div>

				<div className="weekly-form__actions">
					<button
						type="submit"
						disabled={loading}
						className="weekly-form__submit"
					>
						{loading ? 'Generating plan…' : 'Generate weekly plan'}
					</button>
						{loading ? (
						<span role="status" className="weekly-form__status">
							Finding active deals and building your plan…
						</span>
					) : null}
				</div>
			</form>

		{error ? (
			<p
			role="alert"
			className="weekly-page__error"
			>
			{error}
			</p>
		) : null}

		{result ? (
			<>
			<div className="weekly-results__header">
				<div>
					<h2 className="weekly-results__title">
						Your meal plan
					</h2>
					<p className="weekly-results__summary">
						{result.plan.length} days · {totalMeals} meals
						{result.dealsAnalyzed !== undefined
							? ` · Based on ${result.dealsAnalyzed} active deals`
						: ''}
					</p>
				</div>
				{result.weeklyTotalCost !== undefined ? (
					<p className="weekly-results__total">
					Weekly total:{' '}
					<span>
					${result.weeklyTotalCost.toFixed(2)}
					</span>
					</p>
				) : null}
			</div>
	
			<div className="weekly-results__days">
				{result.plan.map((dayPlan) => (
					<section key={dayPlan.day} aria-labelledby={`day-${dayPlan.day}`}>
						<div className="weekly-day__header">
							<h3
								id={`day-${dayPlan.day}`}
								className="weekly-day__title"
							>
								{dayPlan.day}
							</h3>
							<div className="weekly-day__badges">
								{dayPlan.dailyTotals?.cost !== undefined ? (
									<span className="weekly-day__cost">
									${dayPlan.dailyTotals.cost.toFixed(2)} daily total
									</span>
								) : null}
								<span className="weekly-day__meal-count">
									{dayPlan.options.length} meals
								</span>
							</div>
						</div>
	
						{dayPlan.dailyTotals ? (
							<p className="weekly-day__nutrition">
								Daily nutrition —{' '}
								{[
									['Calories', dayPlan.dailyTotals.calories, 'kcal'],
									['Protein', dayPlan.dailyTotals.protein, 'g'],
									['Carbs', dayPlan.dailyTotals.carbs, 'g'],
									['Fat', dayPlan.dailyTotals.fats, 'g'],
								]
								.filter(([, amount]) => amount !== undefined)
								.map(([label, amount, unit]) => `${label}: ${amount}${unit}`)
								.join(' · ')}
							</p>
						) : null}
	
						{dayPlan.options.length > 0 ? (
							<div className="weekly-day__meals">
							{dayPlan.options.map((option) => (
								<WeeklyPlanBox
								key={`${dayPlan.day}-${option.id}`}
								option={option}
								/>
							))}
							</div>
						) : (
							<p className="weekly-day__empty">
								No meals were returned for this day.
							</p>
						)}
					</section>
				))}
				</div>
			</>
		) : null}
		</div>
	</main>
	)
}
