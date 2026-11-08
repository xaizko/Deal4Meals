import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
	connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
	await client.connect();
	console.log('Connected to database');

	await client.query('BEGIN');
	try {
		await client.query('DROP TABLE IF EXISTS mealplans, deals, users CASCADE');

		await client.query(`
				   CREATE TABLE users (
					   id SERIAL PRIMARY KEY,
					   username VARCHAR(50) UNIQUE NOT NULL,
					   password VARCHAR(255) NOT NULL,
					   reputation INTEGER DEFAULT 0,
					   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				   )
				   `);

		await client.query(`
			CREATE TABLE deals (
				id SERIAL PRIMARY KEY,
				user_id INTEGER REFERENCES users(id),
				item_name VARCHAR(255) NOT NULL,
				merchant VARCHAR(255) NOT NULL,
				category VARCHAR(100) NOT NULL,
				location VARCHAR(255) NOT NULL,
				image_url TEXT,
				price DECIMAL(10, 2) NOT NULL,
				original_price DECIMAL(10, 2) NOT NULL,
				description TEXT,
				deal_url TEXT,
				valid_days TEXT[] NOT NULL DEFAULT '{}',
				dietary_restrictions TEXT[] NOT NULL DEFAULT '{}',
				macros JSONB,
				deal_score INTEGER,
				net_likes INTEGER DEFAULT 0,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				start_date TIMESTAMP NOT NULL,
				expired_at TIMESTAMP NOT NULL
			)
		`);

		await client.query(`
			 CREATE TABLE mealplans (
				 id SERIAL PRIMARY KEY,
				 user_id INTEGER REFERENCES users(id),
				 plan_data JSONB NOT NULL,
				 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			 )
		`);

		await client.query('COMMIT');
			console.log('Database schema recreated successfully');
		} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	}
}

setupDatabase()
.catch((error: unknown) => {
	console.error('Database setup failed:', error);
	process.exitCode = 1;
}).finally(() => client.end());
