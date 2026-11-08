import {
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import { BRAND } from '../brand'

const REGIONS = ['Downtown', 'Campus', 'Midtown', 'North Side', 'South Side'] as const
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
  onSubmit?: (payload: PostDealForm) => void
}

export type PostDealForm = {
  title: string
  merchant: string
  region: string
  price: string
  location: string
  description: string
  validFrom: string
  validUntil: string
  validDays: string[]
  startTime: string
  endTime: string
  dietary: string[]
  imageName?: string
}

const emptyForm: PostDealForm = {
  title: '',
  merchant: '',
  region: '',
  price: '',
  location: '',
  description: '',
  validFrom: '',
  validUntil: '',
  validDays: [],
  startTime: '',
  endTime: '',
  dietary: [],
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#066E14] focus:ring-1 focus:ring-[#066E14]'

export function PostDealModa({ open, onClose, onSubmit }: PostDealModaProps) {
  const [form, setForm] = useState<PostDealForm>(emptyForm)

  if (!open) return null

  function update<K extends keyof PostDealForm>(key: K, value: PostDealForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
    setForm(emptyForm)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-deal-title"
        className="my-4 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
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
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Deal title">
            <input
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Placeholder deal title"
              className={inputClass}
            />
          </Field>

          <Field label="Merchant">
            <input
              required
              value={form.merchant}
              onChange={(e) => update('merchant', e.target.value)}
              placeholder="Placeholder merchant"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Region">
              <div className="relative">
                <select
                  required
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="" disabled>
                    Select a region
                  </option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <ChevronIcon
                  className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: BRAND }}
                />
              </div>
            </Field>

            <Field label="Price">
              <input
                required
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="$X.XX"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Placeholder address or area"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the deal and any conditions"
              className={`${inputClass} resize-y`}
            />
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
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                placeholder="HH:MM"
                className={inputClass}
              />
            </Field>
            <Field label="End time">
              <input
                required
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                placeholder="HH:MM"
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
              Deal image <span className="font-normal text-zinc-500">(optional)</span>
            </p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-slate-100 px-4 py-4">
              <ImageIcon className="h-8 w-8 shrink-0" style={{ color: BRAND }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800">
                  {form.imageName ?? 'Image upload placeholder'}
                </p>
                <p className="text-xs text-zinc-500">JPG or PNG · Up to 5 MB</p>
              </div>
              <span className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800">
                Choose file
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(e) =>
                  update('imageName', e.target.files?.[0]?.name ?? undefined)
                }
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Submit deal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-zinc-900">{label}</span>
      {children}
    </label>
  )
}

function ChevronIcon({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
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
