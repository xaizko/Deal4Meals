import type { Deal } from './deal_card'

const BRAND = '#066E14'

export type MacroModaProps = {
  deal: Deal
  open: boolean
  onClose: () => void
}

type MacroValues = {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

function readMacros(macros: unknown): MacroValues {
  if (!macros || typeof macros !== 'object') return {}
  const m = macros as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
  return {
    calories: num(m.calories),
    protein: num(m.protein),
    carbs: num(m.carbs),
    fat: num(m.fat),
  }
}

export function MacroModa({ deal, open, onClose }: MacroModaProps) {
  if (!open) return null

  const macros = readMacros(deal.macros)
  const rows = [
    { label: 'Calories', value: macros.calories, unit: 'kcal' },
    { label: 'Protein', value: macros.protein, unit: 'g' },
    { label: 'Carbs', value: macros.carbs, unit: 'g' },
    { label: 'Fat', value: macros.fat, unit: 'g' },
  ]

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
          <ul className="mt-2 space-y-2">
            {rows.map((row) => (
              <li
                key={row.label}
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
