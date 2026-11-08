import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const client = new Client({
	connectionString: process.env.DATABASE_URL,
});
const saltRounds = 10;
const activeStartDate = new Date();
const activeExpiredAt = new Date(activeStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); 

const mockUsers = [
  { username: 'meal_planner_tester', password: 'password123', reputation: 50 },
  { username: 'chicken_lover', password: 'burritos67', reputation: 120 },
  { username: 'budget_eater', password: 'savemoney', reputation: 30 },
  { username: 'gym_bro', password: 'proteinmax', reputation: 200 },
  { username: 'student_chef', password: 'ramenlife', reputation: 75 },
];

const mockDeals = [
	{ name: 'Boneless Skinless Chicken Breast (1lb)', merchant: 'Wegmans', category: 'Meat', location: 'Rochester, NY', image_url: '/icons/meat.svg', price: 2.99, orig: 5.99, score: 95, macros: { protein: 140, carbs: 0, fats: 16, calories: 740 } },
	{ name: 'Brown Rice (2lb bag)', merchant: 'Aldi', category: 'Grains', location: 'Rochester, NY', image_url: '/icons/grains.svg', price: 1.50, orig: 3.00, score: 80, macros: { protein: 24, carbs: 232, fats: 8, calories: 1080 } },
	{ name: 'Extra Firm Tofu (14oz)', merchant: 'Trader Joe\'s', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 1.99, orig: 3.49, score: 85, macros: { protein: 40, carbs: 12, fats: 20, calories: 360 } },
	{ name: 'Broccoli Crowns (1lb)', merchant: 'Wegmans', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 1.20, orig: 2.50, score: 70, macros: { protein: 12, carbs: 24, fats: 1, calories: 150 } },
	{ name: 'Wild Caught Salmon (1lb)', merchant: 'Tops', category: 'Meat', location: 'Rochester, NY', image_url: '/icons/meat.svg', price: 7.99, orig: 12.99, score: 88, macros: { protein: 90, carbs: 0, fats: 60, calories: 940 } },
	{ name: 'Whole Wheat Pasta (1lb)', merchant: 'Aldi', category: 'Grains', location: 'Rochester, NY', image_url: '/icons/grains.svg', price: 1.00, orig: 2.29, score: 75, macros: { protein: 32, carbs: 168, fats: 4, calories: 840 } },
	{ name: 'Large Grade A Eggs (1 Dozen)', merchant: 'Wegmans', category: 'Dairy', location: 'Rochester, NY', image_url: '/icons/dairy.svg', price: 2.49, orig: 4.50, score: 90, macros: { protein: 72, carbs: 4, fats: 60, calories: 840 } },
	{ name: 'Plain Greek Yogurt (32oz)', merchant: 'Aldi', category: 'Dairy', location: 'Rochester, NY', image_url: '/icons/dairy.svg', price: 3.99, orig: 6.49, score: 92, macros: { protein: 90, carbs: 36, fats: 0, calories: 540 } },
	{ name: 'Fresh Spinach (10oz bag)', merchant: 'Trader Joe\'s', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 1.50, orig: 3.00, score: 65, macros: { protein: 8, carbs: 10, fats: 1, calories: 65 } },
	{ name: 'Creamy Peanut Butter (16oz)', merchant: 'Tops', category: 'Pantry', location: 'Rochester, NY', image_url: '/icons/pantry.svg', price: 2.00, orig: 4.29, score: 82, macros: { protein: 112, carbs: 98, fats: 224, calories: 2660 } },
	{ name: 'Rolled Oats (18oz)', merchant: 'Aldi', category: 'Grains', location: 'Rochester, NY', image_url: '/icons/grains.svg', price: 1.75, orig: 3.50, score: 78, macros: { protein: 33, carbs: 162, fats: 15, calories: 870 } },
	{ name: 'Lean Ground Beef 93/7 (1lb)', merchant: 'Wegmans', category: 'Meat', location: 'Rochester, NY', image_url: '/icons/meat.svg', price: 4.99, orig: 7.99, score: 85, macros: { protein: 96, carbs: 0, fats: 32, calories: 680 } },
	{ name: 'Sweet Potatoes (3lb bag)', merchant: 'Trader Joe\'s', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 2.99, orig: 5.00, score: 74, macros: { protein: 24, carbs: 270, fats: 2, calories: 1150 } },
	{ name: 'Gala Apples (3lb bag)', merchant: 'Aldi', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 3.50, orig: 5.99, score: 68, macros: { protein: 3, carbs: 190, fats: 2, calories: 750 } },
	{ name: 'Bananas (1lb)', merchant: 'Wegmans', category: 'Produce', location: 'Rochester, NY', image_url: '/icons/produce.svg', price: 0.49, orig: 0.79, score: 70, macros: { protein: 5, carbs: 105, fats: 1, calories: 400 } },
	{ name: 'Cheddar Cheese Block (8oz)', merchant: 'Tops', category: 'Dairy', location: 'Rochester, NY', image_url: '/icons/dairy.svg', price: 2.00, orig: 3.99, score: 81, macros: { protein: 56, carbs: 4, fats: 76, calories: 920 } },
	{ name: 'Raw Almonds (12oz)', merchant: 'Trader Joe\'s', category: 'Pantry', location: 'Rochester, NY', image_url: '/icons/pantry.svg', price: 4.99, orig: 8.99, score: 77, macros: { protein: 72, carbs: 72, fats: 168, calories: 1920 } },
	{ name: 'Canned Tuna in Water (5oz)', merchant: 'Aldi', category: 'Meat', location: 'Rochester, NY', image_url: '/icons/meat.svg', price: 0.89, orig: 1.59, score: 94, macros: { protein: 22, carbs: 0, fats: 1, calories: 100 } },
	{ name: 'Quinoa (16oz)', merchant: 'Wegmans', category: 'Grains', location: 'Rochester, NY', image_url: '/icons/grains.svg', price: 3.49, orig: 6.00, score: 79, macros: { protein: 64, carbs: 292, fats: 28, calories: 1720 } },
	{ name: 'Black Beans Canned (15oz)', merchant: 'Aldi', category: 'Pantry', location: 'Rochester, NY', image_url: '/icons/pantry.svg', price: 0.79, orig: 1.49, score: 86, macros: { protein: 21, carbs: 63, fats: 1, calories: 350 } }
];

async function seedDatabase() {
	try {
		await client.connect();
		console.log('Connected to Tiger Data');

		const userIds: number[] = [];

		for (const user of mockUsers) {
		const hash = await bcrypt.hash(user.password, saltRounds);
		console.log('Inserting', user.username, 'hash length:', hash.length);

		const result = await client.query(
			`INSERT INTO users (username, password, reputation)
			VALUES ($1, $2, $3)
			ON CONFLICT (username) DO UPDATE
			SET password = EXCLUDED.password,
				reputation = EXCLUDED.reputation
			RETURNING id`,
			[user.username, hash, user.reputation]
		);

		userIds.push(result.rows[0].id);
		}

		console.log(`Seeded ${userIds.length} users`);

		// then use userIds[0] (or whichever you want) for the deals
const primaryUserId = userIds[0];

						      for (const deal of mockDeals) {
							      await client.query(
								      `INSERT INTO Deals (
									      user_id, item_name, merchant, category, location, image_url, 
									      price, original_price, macros, deal_score, start_date, expired_at
								      )
								      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
								      [
									      userIds[0], 
									      deal.name,
									      deal.merchant,
									      deal.category,
									      deal.location,
									      deal.image_url,
									      deal.price,
									      deal.orig,
									      deal.macros,
									      deal.score,
									      activeStartDate,
									      activeExpiredAt,
								      ]
							      );
						      }
						      console.log(`Successfully inserted ${mockDeals.length} deals!`);
	} catch (error) {
		console.error('Error seeding database', error);
	} finally {
		await client.end();
	}
}

seedDatabase();
