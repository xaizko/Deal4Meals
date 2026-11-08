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
		await client.query('DROP TABLE IF EXISTS deal_photos, mealplans, deals, users CASCADE');

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
			CREATE TABLE deal_photos (
				id SERIAL PRIMARY KEY,
				deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
				file_name VARCHAR(255) NOT NULL,
				content_type VARCHAR(50) NOT NULL,
				image_data BYTEA NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

		await client.query(`
			CREATE TABLE IF NOT EXISTS deal_likes (
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, deal_id)
			);
			`)

		await client.query(`
			CREATE TABLE IF NOT EXISTS deal_dislikes (
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, deal_id)
			);
			`)

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
