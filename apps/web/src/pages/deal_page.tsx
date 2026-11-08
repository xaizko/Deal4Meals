import { useEffect, useMemo, useState } from 'react'
import { DealCard, type Deal } from '../components/deal_card'

function getPageSize(width: number) {
  if (width < 640) return 6
  if (width < 1024) return 4
  return 6
}

export function DealPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageSize, setPageSize] = useState(() =>
    typeof window === 'undefined' ? 6 : getPageSize(window.innerWidth),
  )
  const [visibleCount, setVisibleCount] = useState(pageSize)

  // Fetch deals once on mount
  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('http://localhost:3000/deals')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Deal[] = await res.json()
        setDeals(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load deals')
      } finally {
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  // Responsive page size
  useEffect(() => {
    function syncPageSize() {
      const next = getPageSize(window.innerWidth)
      setPageSize((prev) => {
        if (prev !== next) {
          setVisibleCount((count) => (count <= prev ? next : Math.max(count, next)))
        }
        return next
      })
    }
    syncPageSize()
    window.addEventListener('resize', syncPageSize)
    return () => window.removeEventListener('resize', syncPageSize)
  }, [])

  const visibleDeals = useMemo(
    () => deals.slice(0, visibleCount),
    [deals, visibleCount],
  )

  const hasMore = visibleCount < deals.length

  if (loading) {
    return (
      <main className="flex-1 bg-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-zinc-500">Loading deals…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 bg-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {deals.length === 0 ? (
          <p className="text-zinc-500">No deals available right now.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {visibleDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) =>
                      Math.min(count + pageSize, deals.length),
                    )
                  }
                  className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  See more
                </button>
              ) : (
                <p className="text-sm text-zinc-500">You're caught up on deals</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}