import { Router } from 'express';
import { pool } from '../db';
const router = Router();
interface Deal{
    id: number;
    user_id: number | null;
    item_name: string;
    price: number;
    original_price: number;
    macros: Record<string, any> | null; //expected shape if I know that I can change it ig thanks grok
    deal_score: number | null;
    created_at: Date | string;
}
interface CreateDealBody{
  user_id?: number | null;
  item_name: string;
  price: number;
  original_price: number;
  macros?: Record<string, any> | null;
  deal_score?: number | null;
  start_date: string;   
  expired_at: string;   
}

router.patch('/deals/:id/net_likes/:value', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const value = parseInt(req.params.value, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid deal id' });
  }
  if (isNaN(value)) {
    return res.status(400).json({ error: 'Invalid modification value' });
  }

  try {
    const result = await pool.query(
      `UPDATE deals
       SET net_likes = net_likes + $1
       WHERE id = $2
       RETURNING id, user_id, item_name, price, original_price,
                 macros, deal_score, net_likes, created_at, start_date, expired_at`,
      [value, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating net likes:', err);
    res.status(500).json({ error: 'Failed to update net likes' });
  }
});

router.get('/deals/search', async (req, res) => {
  const name = req.query.name as string | undefined;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, item_name, price, original_price,
              macros, deal_score, net_likes, created_at, start_date, expired_at
       FROM deals
       WHERE item_name ILIKE $1
       ORDER BY created_at DESC`,
      [`%${name}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error searching deals by name:', err);
    res.status(500).json({ error: 'Failed to search deals' });
  }
});

router.get('/deals/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(isNaN(id)){
        return res.status(400).json({error: 'Invalid user id'});
    }

    try{
        const result = await pool.query(
            `SELECT id, user_id, item_name, price, original_price,
              macros, deal_score, net_likes, created_at, start_date, expired_at
            FROM deals
            WHERE id = $1
            ORDER BY created_at DESC`,
            [id]
        );
        res.json(result.rows[0]);
    }
    catch(err){
        console.error('Error fetching deal by id', err);
        res.status(500).json({error: 'Failed to fetch deal by id'});
    }
});

router.get('/deals/user/:id', async (req, res) => {
    const user_id = parseInt(req.params.id, 10);
    if(isNaN(user_id)){
        return res.status(400).json({error: 'Invalid user id'});
    }

    try{
        const result = await pool.query(
            `SELECT id, user_id, item_name, price, original_price,
              macros, deal_score, net_likes, created_at, start_date, expired_at
            FROM deals
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [user_id]
        );
        res.json(result.rows[0]);
    }
    catch(err){
        console.error('Error fetching deals by user id', err);
        res.status(500).json({error: 'Failed to fetch deals by user id'});
    }
});

router.get('/deals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, item_name, price, original_price,
              macros, deal_score, net_likes, created_at, start_date, expired_at
       FROM deals
       ORDER BY created_at DESC`
    );

    // pg returns numeric columns as strings by default — convert if you want numbers
    const deals: Deal[] = result.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      original_price: parseFloat(row.original_price),
    }));

    res.json(deals);
  } catch (err) {
    console.error('Error fetching deals:', err);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

router.post('/deals', async (req, res) => {
  const body = req.body as CreateDealBody;

  // Basic validation
  if (!body.item_name || typeof body.item_name !== 'string') {
    return res.status(400).json({ error: 'item_name is required' });
  }
  if (typeof body.price !== 'number' || body.price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }
  if (typeof body.original_price !== 'number' || body.original_price < 0) {
    return res.status(400).json({ error: 'original_price must be a non-negative number' });
  }
  if (!body.start_date || !body.expired_at) {
    return res.status(400).json({ error: 'start_date and expired_at are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO deals (
         user_id, item_name, price, original_price,
         macros, deal_score, start_date, expired_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        body.user_id ?? null,
        body.item_name,
        body.price,
        body.original_price,
        body.macros ?? null,
        body.deal_score ?? null,
        body.start_date,
        body.expired_at,
      ]
    );

    const deal = result.rows[0];
    // convert decimals to numbers
    deal.price = parseFloat(deal.price);
    deal.original_price = parseFloat(deal.original_price);

    return res.status(201).json(deal);
  } catch (err) {
    console.error('Error creating deal:', err);
    return res.status(500).json({ error: 'Failed to create deal' });
  }
});





export default router;