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
  { name: 'Grilled Chicken Burrito Bowl', merchant: 'Chipotle', category: 'Mexican', location: 'Rochester, NY', image_url: '/icons/mexican.svg', price: 8.99, orig: 12.50, score: 92, macros: { protein: 42, carbs: 58, fats: 18, calories: 620 } },
  { name: 'Spicy Tuna Roll Combo', merchant: 'Sakura Bowl', category: 'Sushi', location: 'Rochester, NY', image_url: '/icons/sushi.svg', price: 11.50, orig: 18.00, score: 88, macros: { protein: 32, carbs: 64, fats: 14, calories: 540 } },
  { name: 'Turkey & Avocado Wrap', merchant: 'Green Leaf Cafe', category: 'Healthy', location: 'Rochester, NY', image_url: '/icons/healthy.svg', price: 7.25, orig: 10.50, score: 85, macros: { protein: 28, carbs: 42, fats: 16, calories: 450 } },
  { name: 'Margherita Personal Pizza', merchant: 'Slice Works', category: 'Pizza', location: 'Rochester, NY', image_url: '/icons/pizza.svg', price: 9.99, orig: 14.99, score: 80, macros: { protein: 24, carbs: 78, fats: 22, calories: 680 } },
  { name: 'Street Taco Trio', merchant: 'Casa Verde', category: 'Mexican', location: 'Rochester, NY', image_url: '/icons/mexican.svg', price: 6.50, orig: 11.00, score: 90, macros: { protein: 26, carbs: 38, fats: 20, calories: 480 } },
  { name: 'Egg & Cheese Breakfast Sandwich', merchant: 'Morning Rise', category: 'Breakfast', location: 'Rochester, NY', image_url: '/icons/breakfast.svg', price: 4.75, orig: 7.50, score: 78, macros: { protein: 22, carbs: 36, fats: 18, calories: 420 } },
  { name: 'Chicken Alfredo Pasta', merchant: 'Nonna Table', category: 'Italian', location: 'Rochester, NY', image_url: '/icons/italian.svg', price: 10.99, orig: 16.99, score: 84, macros: { protein: 34, carbs: 72, fats: 28, calories: 740 } },
  { name: 'Teriyaki Salmon Bowl', merchant: 'Fresh Fuel', category: 'Bowls', location: 'Rochester, NY', image_url: '/icons/bowls.svg', price: 12.25, orig: 17.50, score: 91, macros: { protein: 38, carbs: 54, fats: 16, calories: 560 } },
  { name: 'Buffalo Wings Basket (8pc)', merchant: 'Hot Spot', category: 'Wings', location: 'Rochester, NY', image_url: '/icons/wings.svg', price: 9.50, orig: 14.00, score: 82, macros: { protein: 46, carbs: 12, fats: 38, calories: 620 } },
  { name: 'Chickpea Curry with Rice', merchant: 'Spice Route', category: 'Vegan', location: 'Rochester, NY', image_url: '/icons/vegan.svg', price: 8.75, orig: 13.25, score: 87, macros: { protein: 18, carbs: 68, fats: 14, calories: 520 } },
  { name: 'Italian Deli Sandwich', merchant: 'Corner Stack', category: 'Sandwiches', location: 'Rochester, NY', image_url: '/icons/sandwich.svg', price: 7.99, orig: 12.49, score: 79, macros: { protein: 32, carbs: 48, fats: 24, calories: 580 } },
  { name: 'Tonkotsu Ramen', merchant: 'Noodle Lab', category: 'Ramen', location: 'Rochester, NY', image_url: '/icons/ramen.svg', price: 12.00, orig: 18.00, score: 93, macros: { protein: 28, carbs: 62, fats: 22, calories: 640 } },
  { name: 'Greek Chicken Salad', merchant: 'Green Leaf Cafe', category: 'Healthy', location: 'Rochester, NY', image_url: '/icons/healthy.svg', price: 8.50, orig: 12.00, score: 86, macros: { protein: 36, carbs: 18, fats: 20, calories: 420 } },
  { name: 'BBQ Pulled Pork Sandwich', merchant: 'Smokehouse', category: 'BBQ', location: 'Rochester, NY', image_url: '/icons/bbq.svg', price: 9.25, orig: 14.50, score: 83, macros: { protein: 34, carbs: 46, fats: 22, calories: 560 } },
  { name: 'Veggie Burger Combo', merchant: 'Plant Power', category: 'Vegan', location: 'Rochester, NY', image_url: '/icons/vegan.svg', price: 8.99, orig: 13.99, score: 81, macros: { protein: 22, carbs: 58, fats: 18, calories: 520 } },
  { name: 'Shrimp Pad Thai', merchant: 'Thai Orchid', category: 'Thai', location: 'Rochester, NY', image_url: '/icons/thai.svg', price: 11.75, orig: 16.50, score: 89, macros: { protein: 26, carbs: 64, fats: 16, calories: 540 } },
  { name: 'Breakfast Burrito', merchant: 'Morning Rise', category: 'Breakfast', location: 'Rochester, NY', image_url: '/icons/breakfast.svg', price: 6.99, orig: 10.50, score: 84, macros: { protein: 28, carbs: 44, fats: 20, calories: 510 } },
  { name: 'Pepperoni Pizza Slice + Drink', merchant: 'Slice Works', category: 'Pizza', location: 'Rochester, NY', image_url: '/icons/pizza.svg', price: 5.50, orig: 8.50, score: 76, macros: { protein: 18, carbs: 52, fats: 20, calories: 480 } },
  { name: 'Chicken Caesar Wrap', merchant: 'Corner Stack', category: 'Sandwiches', location: 'Rochester, NY', image_url: '/icons/sandwich.svg', price: 7.75, orig: 11.25, score: 80, macros: { protein: 34, carbs: 38, fats: 18, calories: 490 } },
  { name: 'Beef Pho Bowl', merchant: 'Noodle Lab', category: 'Vietnamese', location: 'Rochester, NY', image_url: '/icons/ramen.svg', price: 10.50, orig: 15.00, score: 90, macros: { protein: 32, carbs: 48, fats: 12, calories: 460 } },
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
