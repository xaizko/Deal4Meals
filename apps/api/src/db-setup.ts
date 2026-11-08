import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
	connectionString: process.env.DATABASE_URL,
});

async function createSchemas() {
	await client.connect();
	console.log('Connected to Tiger Data');

	const query = `
        CREATE TABLE IF NOT EXISTS Users (
          id SERIAL PRIMARY KEY,
		  username VARCHAR(50) UNIQUE NOT NULL,
		  password VARCHAR(255) NOT NULL,
		  reputation INTEGER DEFAULT 0,
		  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        DROP TABLE IF EXISTS Deals CASCADE;
        
        CREATE TABLE Deals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES Users(id),
          item_name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          original_price DECIMAL(10, 2) NOT NULL,
          macros JSONB,
          deal_score INTEGER,
		  net_likes INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          start_date TIMESTAMP NOT NULL,
          expired_at TIMESTAMP NOT NULL
        );

        CREATE TABLE IF NOT EXISTS MealPlans (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES Users(id),
          plan_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;	

	await client.query(query);
	console.log('Schemas created successfully');
	await client.end();
}

createSchemas().catch(console.error);
