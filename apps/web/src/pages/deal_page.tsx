import { useMemo, useState } from 'react'
import { DealCard, type Deal } from '../components/deal_card'

const PAGE_SIZE = 4

const SAMPLE_DEALS: Deal[] = [
  {
    id: 1,
    item_name: '2-for-1 Campus Burgers',
    merchant: 'Grill House',
    category: 'Burgers',
    price: 8.99,
    original_price: 14.99,
    location: 'Downtown',
    distance_mi: 0.8,
    rating: '4.6',
    start_date: '2026-11-10T11:00:00',
    expired_at: '2026-11-14T14:00:00',
    macros: { kcal: 720, protein_g: 34, fat_g: 32, carbs_g: 58, sugar_g: 17, sodium_g: 1.7, fiber_g: 6 },
  },
  {
    id: 2,
    item_name: 'Half-off Sushi Combo',
    merchant: 'Sakura Bowl',
    category: 'Sushi',
    price: 11.5,
    original_price: 23.0,
    location: 'University Ave',
    distance_mi: 1.2,
    rating: '4.8',
    start_date: '2026-11-09T17:00:00',
    expired_at: '2026-11-16T21:00:00',
    macros: { kcal: 540, protein_g: 28, fat_g: 16, carbs_g: 62, sugar_g: 19, sodium_g: 1.4, fiber_g: 6 },
  },
  {
    id: 3,
    item_name: 'Free Drink with Wrap',
    merchant: 'Green Leaf Cafe',
    category: 'Healthy',
    price: 7.25,
    original_price: 10.25,
    location: 'Midtown',
    distance_mi: 2.1,
    rating: '4.3',
    start_date: '2026-11-08T10:00:00',
    expired_at: '2026-11-20T18:00:00',
    macros: { kcal: 410, protein_g: 22, fat_g: 14, carbs_g: 40, sugar_g: 12, sodium_g: 1.1, fiber_g: 4 },
  },
  {
    id: 4,
    item_name: 'Family Pizza Night',
    merchant: 'Slice Works',
    category: 'Pizza',
    price: 15.99,
    original_price: 24.99,
    location: 'West End',
    distance_mi: 3.4,
    rating: '4.5',
    start_date: '2026-11-11T16:00:00',
    expired_at: '2026-11-18T22:00:00',
    macros: { kcal: 890, protein_g: 36, fat_g: 38, carbs_g: 98, sugar_g: 29, sodium_g: 1.8, fiber_g: 10 },
  },
  {
    id: 5,
    item_name: 'Taco Tuesday Trio',
    merchant: 'Casa Verde',
    category: 'Mexican',
    price: 6.5,
    original_price: 11.0,
    location: 'South Side',
    distance_mi: 1.7,
    rating: '4.4',
    start_date: '2026-11-11T11:00:00',
    expired_at: '2026-11-11T21:00:00',
    macros: { kcal: 610, protein_g: 26, fat_g: 28, carbs_g: 54, sugar_g: 16, sodium_g: 1.3, fiber_g: 5 },
  },
  {
    id: 6,
    item_name: 'Breakfast Bagel Box',
    merchant: 'Morning Rise',
    category: 'Breakfast',
    price: 5.75,
    original_price: 9.5,
    location: 'Campus Center',
    distance_mi: 0.4,
    rating: '4.2',
    start_date: '2026-11-07T07:00:00',
    expired_at: '2026-11-21T11:00:00',
    macros: { kcal: 480, protein_g: 18, fat_g: 20, carbs_g: 52, sugar_g: 16, sodium_g: 0.9, fiber_g: 5 },
  },
  {
    id: 7,
    item_name: 'Student Pasta Special',
    merchant: 'Nonna Table',
    category: 'Italian',
    price: 9.99,
    original_price: 16.99,
    location: 'Arts District',
    distance_mi: 2.6,
    rating: '4.7',
    start_date: '2026-11-12T12:00:00',
    expired_at: '2026-11-19T21:00:00',
    macros: { kcal: 760, protein_g: 30, fat_g: 24, carbs_g: 88, sugar_g: 26, sodium_g: 1.5, fiber_g: 9 },
  },
  {
    id: 8,
    item_name: 'Bowl + Smoothie Deal',
    merchant: 'Fresh Fuel',
    category: 'Bowls',
    price: 10.25,
    original_price: 15.5,
    location: 'North Campus',
    distance_mi: 1.1,
    rating: '4.5',
    start_date: '2026-11-08T09:00:00',
    expired_at: '2026-11-22T17:00:00',
    macros: { kcal: 520, protein_g: 29, fat_g: 15, carbs_g: 61, sugar_g: 18, sodium_g: 1.5, fiber_g: 6 },
  },
  {
    id: 9,
    item_name: 'Late Night Wings',
    merchant: 'Hot Spot',
    category: 'Wings',
    price: 9.5,
    original_price: 14.0,
    location: 'Downtown',
    distance_mi: 0.9,
    rating: '4.1',
    start_date: '2026-11-07T20:00:00',
    expired_at: '2026-11-30T02:00:00',
    macros: { kcal: 830, protein_g: 42, fat_g: 58, carbs_g: 18, sugar_g: 5, sodium_g: 2.1, fiber_g: 2 },
  },
  {
    id: 10,
    item_name: 'Vegan Curry Plate',
    merchant: 'Spice Route',
    category: 'Vegan',
    price: 8.75,
    original_price: 13.25,
    location: 'East Village',
    distance_mi: 2.9,
    rating: '4.9',
    start_date: '2026-11-09T11:30:00',
    expired_at: '2026-11-23T20:00:00',
    macros: { kcal: 560, protein_g: 20, fat_g: 18, carbs_g: 70, sugar_g: 21, sodium_g: 1, fiber_g: 7 },
  },
  {
    id: 11,
    item_name: 'Deli Sandwich Combo',
    merchant: 'Corner Stack',
    category: 'Sandwiches',
    price: 7.99,
    original_price: 12.49,
    location: 'Library Row',
    distance_mi: 0.6,
    rating: '4.0',
    start_date: '2026-11-10T10:00:00',
    expired_at: '2026-11-17T16:00:00',
    macros: { kcal: 650, protein_g: 31, fat_g: 29, carbs_g: 55, sugar_g: 17, sodium_g: 1.6, fiber_g: 6 },
  },
  {
    id: 12,
    item_name: 'Ramen Refill Night',
    merchant: 'Noodle Lab',
    category: 'Ramen',
    price: 12.0,
    original_price: 18.0,
    location: 'Market Street',
    distance_mi: 1.5,
    rating: '4.6',
    start_date: '2026-11-13T17:00:00',
    expired_at: '2026-11-13T22:00:00',
    macros: { kcal: 690, protein_g: 33, fat_g: 22, carbs_g: 74, sugar_g: 22, sodium_g: 1.7, fiber_g: 7 },
  },
]

export function DealPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleDeals = useMemo(
    () => SAMPLE_DEALS.slice(0, visibleCount),
    [visibleCount],
  )

  const hasMore = visibleCount < SAMPLE_DEALS.length

  return (
    <main className="flex-1 bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
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
                  Math.min(count + PAGE_SIZE, SAMPLE_DEALS.length),
                )
              }
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              See more
            </button>
          ) : (
            <p className="text-sm text-zinc-500">You&apos;re caught up on deals</p>
          )}
        </div>
      </div>
    </main>
  )
}
