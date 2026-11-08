import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiModel = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

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
		// Fetch filtered deals from Tiger Data
		let queryText = `
		SELECT id, item_name, merchant, category, image_url, price, macros, deal_score 
		FROM Deals 
		WHERE start_date <= NOW() AND expired_at >= NOW()
		`;

		if (dietary_restrictions === 'vegetarian') {
			queryText += ` AND item_name NOT ILIKE '%chicken%' AND item_name NOT ILIKE '%beef%' AND item_name NOT ILIKE '%salmon%' AND item_name NOT ILIKE '%tuna%' AND item_name NOT ILIKE '%pork%'`;
		} else if (dietary_restrictions === 'vegan') {
			queryText += ` AND item_name NOT ILIKE '%chicken%' AND item_name NOT ILIKE '%beef%' AND item_name NOT ILIKE '%salmon%' AND item_name NOT ILIKE '%tuna%' AND item_name NOT ILIKE '%pork%' AND item_name NOT ILIKE '%cheese%' AND item_name NOT ILIKE '%yogurt%' AND item_name NOT ILIKE '%eggs%'`;
		}

		const dbResult = await pool.query(queryText);
		const activeDeals = dbResult.rows;

		if (activeDeals.length === 0) {
			return res.status(400).json({ error: 'No active deals found matching your restrictions.' });
		}

		// Construct the Prompt for Gemini
		const prompt = `
		You are an AI meal planner. I will provide a JSON array of active food deals. 
			Construct a 7-day meal plan that stays under a total weekly budget of $${budget}.
			Target these DAILY nutritional goals as closely as possible:
			Calories: ${target_calories}, Protein: ${target_protein}g, Carbs: ${target_carbs}g, Fats: ${target_fats}g, Fiber: ${target_fiber}g, Sodium: ${target_sodium}mg, Sugar: ${target_sugar}.

			Choose the cheapest combinations possible utilizing the deal_score.

			ACTIVE DEALS DATA:
			${JSON.stringify(activeDeals)}

		Return ONLY a JSON object structured exactly like this schema:
			{
			"plan": [
				{
					"day": 1,
					"meals": [
						{ 
							"deal_id": number, 
							"item_name": "string", 
							"merchant": "string", 
							"image_url": "string",
							"cost": number, 
							"macros": { "protein": number, "carbs": number, "fats": number, "calories": number } 
						}
					],
					"daily_totals": { "cost": number, "protein": number, "carbs": number, "fats": number, "calories": number }
				}
			],
			"weekly_total_cost": number
		}
		`;

		// Call Gemini API with JSON enforcement
		const result = await aiModel.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }]}],
			generationConfig: {
				responseMimeType: "application/json",
			}
		});

		const generatedPlanText = result.response.text();
		const generatedPlan = JSON.parse(generatedPlanText);

		// Return the AI-generated plan to the frontend
		res.json({
			status: 'success',
			dealsAnalyzed: activeDeals.length,
			mealPlan: generatedPlan
		});

	} catch (err) {
		console.error('Error generating AI plan:', err);
		res.status(500).json({ error: 'Failed to generate meal plan' });
	}
});

export default router;
