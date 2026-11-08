import { Link } from 'react-router-dom'
import { BRAND } from '../brand.ts'

export function Footer() {
  return (
    <footer className="mt-auto w-full text-white" style={{ backgroundColor: BRAND }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <Link
            to="/"
            className="font-['Arial',Helvetica,sans-serif] text-2xl tracking-wide text-white no-underline"
          >
            DEALS4MEALS
          </Link>
          <p className="mt-1 text-sm text-white/80">
            Weekly meal deals and local savings
          </p>
        </div>

        <nav className="flex gap-6 text-sm font-medium" aria-label="Footer">
          <Link to="/" className="text-white no-underline hover:underline">
            Home
          </Link>
          <Link to="/weekly" className="text-white no-underline hover:underline">
            Weekly Plan
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-4 text-xs leading-relaxed text-white/75 sm:px-6">
        Nutrition data sourced from USDA FoodData Central: U.S. Department of Agriculture,
        Agricultural Research Service. FoodData Central, 2019.{' '}
        <a
          href="https://fdc.nal.usda.gov"
          className="text-white/90 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          fdc.nal.usda.gov
        </a>
      </p>
    </footer>
  )
}
