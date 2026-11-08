import { useEffect, useMemo, useState } from 'react'
import {
  WeeklyPlanBox,
  type WeeklyOption,
} from '../components/weekly_plan_box'

export type WeeklyDayPlan = {
  day: string
  options: WeeklyOption[]
}

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

/**
 * Placeholder loader until Gemini API wiring is ready.
 * Replace the body of this function with your Gemini fetch.
 */
export async function fetchWeeklyPlanFromGemini(): Promise<WeeklyDayPlan[]> {
  // TODO: call Gemini API and map results into WeeklyDayPlan[]
  return buildPlaceholderPlan()
}

function buildPlaceholderPlan(): WeeklyDayPlan[] {
  return WEEK_DAYS.map((day, dayIndex) => ({
    day,
    options: [1, 2].map((optionNumber) => ({
      id: `${day}-${optionNumber}`,
      optionNumber,
      item_name: `Placeholder meal ${optionNumber}`,
      location: 'Placeholder location',
      rating: 'Placeholder rating',
      price: 8.5 + dayIndex * 0.25 + optionNumber,
      original_price: 14 + dayIndex * 0.5 + optionNumber,
      dietary: 'not specified',
    })),
  }))
}

export function WeeklyPage() {
  const [plan, setPlan] = useState<WeeklyDayPlan[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWeeklyPlanFromGemini()
        if (!cancelled) setPlan(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load weekly plan')
          setPlan(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const totalOptions = useMemo(
    () => plan?.reduce((sum, day) => sum + day.options.length, 0) ?? 0,
    [plan],
  )

  const daysCount = plan?.length ?? 0
  const perDay =
    daysCount > 0 && totalOptions > 0
      ? Math.round(totalOptions / daysCount)
      : 0

  return (
    <main className="flex-1 bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Weekly Plan
            <span className="font-bold text-zinc-900">
              {' '}
              · {loading ? '…' : `${totalOptions} options`}
            </span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">
            {loading
              ? 'Loading your plan…'
              : `${daysCount} days · ${perDay} options per day`}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading && !plan ? (
          <p className="text-sm text-zinc-500">Fetching weekly options…</p>
        ) : null}

        <div className="space-y-8">
          {(plan ?? []).map((dayPlan) => (
            <section key={dayPlan.day} aria-labelledby={`day-${dayPlan.day}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2
                  id={`day-${dayPlan.day}`}
                  className="text-xl font-bold text-zinc-900"
                >
                  {dayPlan.day}
                </h2>
                <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-semibold text-zinc-900">
                  {dayPlan.options.length} options
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {dayPlan.options.map((option) => (
                  <WeeklyPlanBox key={option.id} option={option} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
