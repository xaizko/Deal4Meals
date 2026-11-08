import { Router, Request, Response } from 'express';
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

router.get('/deals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, item_name, price, original_price,
              macros, deal_score, created_at, start_date, expired_at
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