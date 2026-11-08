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

router.post('/user', async (req, res) =>{
    const body = req.body as CreateUserBody;

    if (!body.username || typeof body.username !== 'string') {
        return res.status(400).json({ error: 'username is required' });
    }
    if (!body.password || typeof body.password !== 'string') {
        return res.status(400).json({ error: 'password is required' });
    }

    try {const result = await pool.query(
        `INSERT INTO Users (
          username, password
        )
        VALUES ($1, $2)
        RETURNING *`,
        [
            body.username,
            await bcrypt.hash(body.password, saltRounds)
        ]
    );
    const user = result.rows[0];
    return res.status(201).json(user);
    }
    catch(err){
        console.error('Error creating user: ', err);
        return res.status(500).json({error: 'Failed to create user'});
    }
    });

export default router;
