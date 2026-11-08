import dotenv from 'dotenv';

dotenv.config();

import { Pool, types } from 'pg';

// Preserve timezone-less database timestamps as local wall-clock values.
types.setTypeParser(1114, (value) => value.replace(' ', 'T'));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// optional: test the connection on startup
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(1);
});
