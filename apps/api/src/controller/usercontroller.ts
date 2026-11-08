import { Router } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';


const saltRounds = 10;
const router = Router();

interface User{
	id: number;
	username: string;
	password: string;
	reputation: number;
	created_at: Date | string;
}

interface CreateUserBody{
	username: string;
	password: string;
}

router.get('/user/:id', async (req, res) => {
	const id = parseInt(req.params.id, 10);

	if (isNaN(id)) {
		return res.status(400).json({ error: 'Invalid user id' });
	}

	try {
		const result = await pool.query(
			`SELECT id, username, reputation, created_at
			FROM users
			WHERE id = $1`,
				[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Don't send the password hash back
		res.json(result.rows[0]);
	} catch (err) {
		console.error('Error fetching user:', err);
		res.status(500).json({ error: 'Failed to fetch user' });
	}
});

router.get('/user', async (req, res) => {
	try{
		const result = await pool.query(
			`SELECT username, password, reputation
			FROM Users
			ORDER BY created_at DESC`
		);

		const users: User[] = result.rows.map((row) => ({
			...row
		}));
		res.json(users);
	}
	catch(err){
		console.error('Error fetching deals:', err);
		res.status(500).json({error: 'Failed to fetch users'});
	}
});

router.post('/login', async (req, res) => {
	const { username, password } = req.body;

	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: 'username is required' });
	}
	if (!password || typeof password !== 'string') {
		return res.status(400).json({ error: 'password is required' });
	}

	try {
		const result = await pool.query(
			`SELECT id, username, password, reputation, created_at
			FROM users
			WHERE username = $1`,
				[username]
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		const user = result.rows[0];
		if (typeof user.password !== 'string') {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		// Don't send the hash back
		const safeUser = { ...user };
		delete safeUser.password;
		return res.json(safeUser);
	} catch (err) {
		console.error('Error logging in:', err);
		return res.status(500).json({ error: 'Failed to log in' });
	}
});

router.post('/user', async (req, res) =>{
	const body = req.body as CreateUserBody;

	if (!body.username || typeof body.username !== 'string') {
		return res.status(400).json({ error: 'username is required' });
	}
	if (!body.password || typeof body.password !== 'string') {
		return res.status(400).json({ error: 'password is required' });
	}

	try {const hash = await bcrypt.hash(body.password, saltRounds);

		const result = await pool.query(
			`INSERT INTO users (username, password, reputation)
			VALUES ($1, $2, 0)
			ON CONFLICT (username) DO UPDATE
			SET password = EXCLUDED.password
			RETURNING id`,
			[body.username, hash]
		);

		const user = result.rows[0];
		return res.status(201).json(user);
	}
	catch(err){
		console.error('Error creating user: ', err);
		return res.status(500).json({error: 'Failed to create user'});
	}
});

router.patch('/user/:id/reputation', async (req, res) => {
	const id = parseInt(req.params.id, 10);
	const { reputation } = req.body;

	if (isNaN(id)) {
		return res.status(400).json({ error: 'Invalid user id' });
	}
	if (typeof reputation !== 'number') {
		return res.status(400).json({ error: 'reputation must be a number'});
	}

	try {
		const result = await pool.query(
			`UPDATE users
			SET reputation = $1
			WHERE id = $2
			RETURNING id, username, reputation, created_at`,
			[reputation, id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(result.rows[0]);
	} catch (err) {
		console.error('Error updating reputation:', err);
		res.status(500).json({ error: 'Failed to update reputation' });
	}
});

export default router;
