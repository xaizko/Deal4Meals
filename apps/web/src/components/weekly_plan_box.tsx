import './weekly_plan_box.css'
import { PinIcon } from '../components/assets/PinIcon';
import { StarIcon } from '../components/assets/StarIcon';

// One meal option filled later by Gemini
export type WeeklyOption = {
	id: string | number
	optionNumber: number
	location: string
	rating?: string
	price: number
	original_price?: number
	dietary?: string
	item_name?: string
	merchant?: string
	image_url?: string
	macros?: WeeklyMacros
}

export type WeeklyMacros = {
	protein?: number
	carbs?: number
	fats?: number
	calories?: number
}

export type WeeklyPlanBoxProps = {
	option: WeeklyOption
	onSelect?: (option: WeeklyOption) => void
}

function formatMoney(amount: number) {
	return `$${amount.toFixed(2)}`
}

export function WeeklyPlanBox({ option, onSelect }: WeeklyPlanBoxProps) {
	const saved =
		option.original_price != null
			? Math.max(0, option.original_price - option.price)
			: null

			return (
				<article
					className="weekly-plan-box"
					onClick={() => onSelect?.(option)}
				>
					{option.image_url ? (
						<img
							src={option.image_url}
							alt=""
							className="weekly-plan-box__image"
							/>
					) : null}

					<div className="weekly-plan-box__option">
						Option {option.optionNumber}
					</div>

					<div className="weekly-plan-box__content">
						<div className="weekly-plan-box__details">
							{option.item_name ? (
								<p className="weekly-plan-box__name">
									{option.item_name}
								</p>
							) : null}
							<p className="weekly-plan-box__merchant">
								<PinIcon />
								<span>
									{option.merchant || option.location || 'Merchant not provided'}
								</span>
							</p>
							{option.rating ? (
								<p className="weekly-plan-box__rating">
									<StarIcon />
									<span>{option.rating}</span>
								</p>
							) : null}
						</div>

						<div className="weekly-plan-box__price">
							<p className="weekly-plan-box__price-label">Price</p>
							<p className="weekly-plan-box__price-amount">
								{formatMoney(option.price)}
							</p>
							{saved != null && saved > 0 ? (
								<p className="weekly-plan-box__saved">
								Saved {formatMoney(saved)}
								</p>
							) : null}
						</div>
					</div>

						{option.macros && Object.values(option.macros).some((amount) => amount !== undefined) ? (
							<div className="weekly-plan-box__nutrition">
								Nutrition:{' '}
								{[
									['Calories', option.macros.calories, ' kcal'],
									['Protein', option.macros.protein, 'g'],
									['Carbs', option.macros.carbs, 'g'],
									['Fat', option.macros.fats, 'g'],
								]
								.filter(([, amount]) => amount !== undefined)
								.map(([label, amount, unit]) => `${label} ${amount}${unit}`)
								.join(' · ')}
							</div>
						) : null}
				</article>
			)
}
