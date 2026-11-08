import { Router, Request, Response } from 'express';
import { pool } from '../db';
const router = Router();

router.post('/meal-plans', async (req, res) => {
	const { 
		budget, 
		dietary_restrictions, 
		target_protein,
		target_carbs,
		target_fats,
		target_calories, 
		target_sodium, 
		target_sugar,
		target_fiber 
	} = req.body;

	try {
		// Only fetch active deals
		let queryText = `
		SELECT id, item_name, price, macros, deal_score 
		FROM Deals 
		WHERE start_date <= NOW() AND expired_at >= NOW()
		`;

		// Exclude keywords based on dietary restrictions
		if (dietary_restrictions === 'vegetarian') {
			queryText += ` 
			AND item_name NOT ILIKE '%chicken%' 
			AND item_name NOT ILIKE '%beef%' 
			AND item_name NOT ILIKE '%salmon%' 
			AND item_name NOT ILIKE '%tuna%'
			AND item_name NOT ILIKE '%pork%'
			`;
		} else if (dietary_restrictions === 'vegan') {
			queryText += ` 
			AND item_name NOT ILIKE '%chicken%' 
			AND item_name NOT ILIKE '%beef%' 
			AND item_name NOT ILIKE '%salmon%' 
			AND item_name NOT ILIKE '%tuna%'
			AND item_name NOT ILIKE '%pork%'
			AND item_name NOT ILIKE '%cheese%'
			AND item_name NOT ILIKE '%yogurt%'
			AND item_name NOT ILIKE '%eggs%'
			`;
		}

		// Execute query
		const result = await pool.query(queryText);
		const activeDeals = result.rows;

		const constraints = {
			budget,
			dietary_restrictions,
			targets: {
				calories: target_calories,
				protein: target_protein,
				carbs: target_carbs,
				fats: target_fats,
				sodium: target_sodium,
				sugar: target_sugar,
				fiber: target_fiber
			}
		};

		res.json({
			status: 'success',
			dealsFound: activeDeals.length,
			constraints,
			deals: activeDeals
		});

	} catch (err) {
		console.error('Error generating plan:', err);
		res.status(500).json({ error: 'Failed to fetch valid deals for meal plan' });
	}
});
