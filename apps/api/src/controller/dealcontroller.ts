import { Router } from 'express';
import { pool } from '../db';
const router = Router();

interface Deal{
	id: number;
	user_id: number | null;
	item_name: string;
	merchant: string;
	category: string;
	location: string;
	description: string | null;
	deal_url: string | null;
	valid_days: string[];
	dietary_restrictions: string[];
	price: number;
	original_price: number;
	macros: unknown;
	deal_score: number | null;
	created_at: Date | string;
}

interface CreateDealBody {
	user_id?: number | null;
	item_name: string;
	merchant: string;
	category: string;
	location: string;
	image_url?: string | null;
	price: number;
	original_price: number;
	description?: string | null;
	deal_url?: string | null;
	valid_days?: string[];
	dietary_restrictions?: string[];
	macros?: unknown;
	deal_score?: number | null;
	start_date: string;
	expired_at: string;
}

const DEAL_COLUMNS = `id, user_id, item_name, merchant, category, location,
	description, deal_url, valid_days, dietary_restrictions, image_url,
price, original_price, macros, deal_score, net_likes, created_at,
start_date, expired_at`;

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
			RETURNING ${DEAL_COLUMNS}`,
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
			`SELECT ${DEAL_COLUMNS}
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
			`SELECT ${DEAL_COLUMNS}
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
			`SELECT ${DEAL_COLUMNS}
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
			`SELECT ${DEAL_COLUMNS}
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
	const body = req.body as Partial<CreateDealBody>;

	if (typeof body.item_name !== 'string' || body.item_name.trim() === '') {
		return res.status(400).json({ error: 'item_name is required' });
	}
	if (typeof body.merchant !== 'string' || body.merchant.trim() === '') {
		return res.status(400).json({ error: 'merchant is required' });
	}
	if (typeof body.category !== 'string' || body.category.trim() === '') {
		return res.status(400).json({ error: 'category is required' });
	}
	if (typeof body.location !== 'string' || body.location.trim() === '') {
		return res.status(400).json({ error: 'location is required' });
	}
	if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
		return res.status(400).json({ error: 'price must be a non-negative number' });
	}
	if (
		typeof body.original_price !== 'number' ||
		!Number.isFinite(body.original_price) ||
	body.original_price < body.price
	) {
		return res.status(400).json({ error: 'original_price must be a number greater than or equal to price' });
	}
	if (
		typeof body.start_date !== 'string' ||
		Number.isNaN(Date.parse(body.start_date)) ||
	typeof body.expired_at !== 'string' ||
Number.isNaN(Date.parse(body.expired_at)) ||
Date.parse(body.expired_at) < Date.parse(body.start_date)
	) {
		return res.status(400).json({ error: 'start_date and expired_at are required' });
	}
	if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') {
		return res.status(400).json({ error: 'description must be a string' });
	}
	if (body.deal_url !== undefined && body.deal_url !== null && typeof body.deal_url !== 'string') {
		return res.status(400).json({ error: 'deal_url must be a string' });
	}
	if (body.valid_days !== undefined && (!Array.isArray(body.valid_days) || !body.valid_days.every((day) => typeof day === 'string'))) {
		return res.status(400).json({ error: 'valid_days must be an array of strings' });
	}
	if (
		body.dietary_restrictions !== undefined &&
		(!Array.isArray(body.dietary_restrictions) ||
		 !body.dietary_restrictions.every((restriction) => typeof restriction === 'string'))
	) {
		return res.status(400).json({ error: 'dietary_restrictions must be an array of strings' });
	}

	let dealUrl: string | null = null;
	if (typeof body.deal_url === 'string' && body.deal_url.trim() !== '') {
		try {
			const parsedUrl = new URL(body.deal_url);
			if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
				return res.status(400).json({ error: 'deal_url must use HTTP or HTTPS' });
			}
			dealUrl = parsedUrl.toString();
		} catch {
			return res.status(400).json({ error: 'deal_url must be a valid URL' });
		}
	}

	try {
		const result = await pool.query(
			`INSERT INTO deals (
				user_id, item_name, merchant, category, location, image_url,
				price, original_price, description, deal_url, valid_days,
				dietary_restrictions, macros, deal_score, start_date, expired_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
			RETURNING *`,
			[
				body.user_id ?? null,
				body.item_name.trim(),
				body.merchant.trim(),
				body.category.trim(),
				body.location.trim(),
				body.image_url ?? null,
				body.price,
				body.original_price,
				body.description?.trim() || null,
				dealUrl,
				body.valid_days ?? [],
				body.dietary_restrictions ?? [],
				body.macros ?? null,
				body.deal_score ?? null,
				body.start_date,
				body.expired_at,
			]
		);

		const deal = result.rows[0];
		deal.price = parseFloat(deal.price);
		deal.original_price = parseFloat(deal.original_price);

		return res.status(201).json(deal);
	} catch (err) {
		console.error('Error creating deal:', err);
		return res.status(500).json({ error: 'Failed to create deal' });
	}
});

export default router;
