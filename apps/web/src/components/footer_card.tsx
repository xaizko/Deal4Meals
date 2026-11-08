const BRAND = '#066E14'

export function Footer() {
  return (
    <footer className="mt-auto w-full text-white" style={{ backgroundColor: BRAND }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <a
            href="/"
            className="font-['Caveat_Brush',cursive] text-2xl tracking-wide text-white no-underline"
          >
            DEALS4MEALS
          </a>
          <p className="mt-1 text-sm text-lime-200">
            Weekly meal deals and local savings
          </p>
        </div>

        <nav className="flex gap-6 text-sm font-medium" aria-label="Footer">
          <a href="/" className="text-white no-underline hover:underline">
            Home
          </a>
          <a href="#weekly-plan" className="text-white no-underline hover:underline">
            Weekly Plan
          </a>
        </nav>
      </div>
    </footer>
  )
}
