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
	photos?: Array<{
		file_name: string;
		content_type: string;
		data: string;
	}>;
	deal_score?: number | null;
	start_date: string;
	expired_at: string;
}

const DEAL_COLUMNS = `id, user_id, item_name, merchant, category, location,
	description, deal_url, valid_days, dietary_restrictions, image_url,
price, original_price, macros, deal_score, net_likes, created_at,
start_date, expired_at`;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS_PER_DEAL = 5;

function isValidPhotoContent(data: Buffer, contentType: string) {
	if (contentType === 'image/png') {
		return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
	}
	if (contentType === 'image/jpeg') {
		return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
	}
	return false
}

router.get('/deals/:dealId/photos/:photoId', async (req, res) => {
	const dealId = Number(req.params.dealId)
	const photoId = Number(req.params.photoId)
	if (!Number.isInteger(dealId) || dealId <= 0 || !Number.isInteger(photoId) || photoId <= 0) {
		return res.status(400).json({ error: 'Invalid deal or photo id' })
	}

	try {
		const result = await pool.query(
			`SELECT content_type, image_data
			 FROM deal_photos
			 WHERE deal_id = $1 AND id = $2`,
			[dealId, photoId],
		)
		if (result.rows.length === 0) return res.status(404).json({ error: 'Deal photo not found' })

		res.setHeader('Content-Type', result.rows[0].content_type)
		res.setHeader('Cache-Control', 'public, max-age=86400')
		return res.send(result.rows[0].image_data)
	} catch (error) {
		console.error('Error fetching deal photo:', error)
		return res.status(500).json({ error: 'Failed to fetch deal photo' })
	}
})

router.get('/deals/:dealId/photos', async (req, res) => {
	const dealId = Number(req.params.dealId)
	if (!Number.isInteger(dealId) || dealId <= 0) {
		return res.status(400).json({ error: 'Invalid deal id' })
	}

	try {
		const result = await pool.query(
			`SELECT id FROM deal_photos WHERE deal_id = $1 ORDER BY id`,
			[dealId],
		)
		return res.json(
			result.rows.map((row) => ({
				url: `/deals/${dealId}/photos/${row.id}`,
			})),
		)
	} catch (error) {
		console.error('Error listing deal photos:', error)
		return res.status(500).json({ error: 'Failed to list deal photos' })
	}
})

router.post('/deals/:id/like', async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const userId = req.body.user_id;
  if (isNaN(dealId) || !userId) {
    return res.status(400).json({ error: 'deal id and user_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove opposite vote if it exists
    const removedDislike = await client.query(
      `DELETE FROM deal_dislikes WHERE user_id = $1 AND deal_id = $2 RETURNING *`,
      [userId, dealId]
    );

    // Insert the like
    const insert = await client.query(
      `INSERT INTO deal_likes (user_id, deal_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, dealId]
    );

    if (insert.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Already liked' });
    }

    // +1 for the like, extra +1 if we removed a dislike
    const delta = removedDislike.rows.length > 0 ? 2 : 1;

    const result = await client.query(
      `UPDATE deals SET net_likes = net_likes + $1 WHERE id = $2 RETURNING id, net_likes`,
      [delta, dealId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to like deal' });
  } finally {
    client.release();
  }
});
router.delete('/deals/:id/like', async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const userId = req.body.user_id;

  if (isNaN(dealId) || !userId) {
    return res.status(400).json({ error: 'deal id and user_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const del = await client.query(
      `DELETE FROM deal_likes
       WHERE user_id = $1 AND deal_id = $2
       RETURNING *`,
      [userId, dealId]
    );

    if (del.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Like not found' });
    }

    const result = await client.query(
      `UPDATE deals
      SET net_likes = (
        SELECT COUNT(*) FROM deal_likes WHERE deal_id = $1
      ) - (
        SELECT COUNT(*) FROM deal_dislikes WHERE deal_id = $1
      )
      WHERE id = $1
      RETURNING id, net_likes`,
      [dealId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to unlike deal' });
  } finally {
    client.release();
  }
});

router.get('/deals/search', async (req, res) => {
  const name = req.query.name as string | undefined;
  const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  const result = await pool.query(
    `SELECT d.*,
            (dl.user_id IS NOT NULL) AS liked_by_me,
            (dd.user_id IS NOT NULL) AS disliked_by_me
     FROM deals d
     LEFT JOIN deal_likes dl ON dl.deal_id = d.id AND dl.user_id = $2
     LEFT JOIN deal_dislikes dd ON dd.deal_id = d.id AND dd.user_id = $2
     WHERE d.item_name ILIKE $1
     ORDER BY d.created_at DESC`,
    [`%${name}%`, userId]
  );

  res.json(result.rows.map((row) => ({
    ...row,
    price: parseFloat(row.price),
    original_price: parseFloat(row.original_price),
  })));
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
		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Deal not found' });
		}
		const photos = await pool.query(
			`SELECT id FROM deal_photos WHERE deal_id = $1 ORDER BY id`,
			[id],
		);
		res.json({
			...result.rows[0],
			photos: photos.rows.map((photo) => `/deals/${id}/photos/${photo.id}`),
		});
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
  const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;

  const result = await pool.query(
    `SELECT d.*,
            (dl.user_id IS NOT NULL) AS liked_by_me,
            (dd.user_id IS NOT NULL) AS disliked_by_me
     FROM deals d
     LEFT JOIN deal_likes dl
       ON dl.deal_id = d.id AND dl.user_id = $1
     LEFT JOIN deal_dislikes dd
       ON dd.deal_id = d.id AND dd.user_id = $1
     ORDER BY d.created_at DESC`,
    [userId]
  );

  res.json(result.rows);
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
	if (
		body.photos !== undefined &&
		(!Array.isArray(body.photos) ||
			body.photos.length > MAX_PHOTOS_PER_DEAL ||
			!body.photos.every((photo) =>
				photo !== null &&
				typeof photo === 'object' &&
				typeof photo.file_name === 'string' &&
				typeof photo.content_type === 'string' &&
				typeof photo.data === 'string'
			))
	) {
		return res.status(400).json({ error: `photos must contain at most ${MAX_PHOTOS_PER_DEAL} valid image uploads` });
	}

	const photos: Array<{ fileName: string; contentType: string; data: Buffer }> = [];
	let totalPhotoBytes = 0;
	for (const photo of body.photos ?? []) {
		if (!photo.file_name.trim() || photo.file_name.length > 255) {
			return res.status(400).json({ error: 'Each photo needs a valid file name' });
		}
		if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(photo.data)) {
			return res.status(400).json({ error: 'A photo contains invalid base64 data' });
		}
		const data = Buffer.from(photo.data, 'base64');
		if (data.toString('base64') !== photo.data) {
			return res.status(400).json({ error: 'A photo contains invalid base64 data' });
		}
		if (!isValidPhotoContent(data, photo.content_type)) {
			return res.status(400).json({ error: 'Only valid JPEG and PNG photos are supported' });
		}
		totalPhotoBytes += data.length;
		if (totalPhotoBytes > MAX_PHOTO_BYTES) {
			return res.status(400).json({ error: 'Photos may not exceed 5 MB combined' });
		}
		photos.push({
			fileName: photo.file_name.trim(),
			contentType: photo.content_type,
			data,
		});
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

	const client = await pool.connect().catch((error: unknown) => {
		console.error('Error connecting to create deal:', error);
		return null;
	});
	if (!client) {
		return res.status(500).json({ error: 'Failed to create deal' });
	}

	let transactionStarted = false;
	try {
		await client.query('BEGIN');
		transactionStarted = true;
		const result = await client.query(
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

		const storedPhotos: Array<{ id: number; url: string }> = [];
		for (const photo of photos) {
			const photoResult = await client.query(
				`INSERT INTO deal_photos (deal_id, file_name, content_type, image_data)
				 VALUES ($1, $2, $3, $4)
				 RETURNING id`,
				[deal.id, photo.fileName, photo.contentType, photo.data],
			)
			const id = photoResult.rows[0].id as number
			storedPhotos.push({ id, url: `/deals/${deal.id}/photos/${id}` })
		}

		if (storedPhotos[0]) {
			deal.image_url = storedPhotos[0].url
			await client.query(
				'UPDATE deals SET image_url = $1 WHERE id = $2',
				[deal.image_url, deal.id],
			);
		}
		await client.query('COMMIT')
		transactionStarted = false;
		return res.status(201).json({ ...deal, photos: storedPhotos.map(({ url }) => url) })
	} catch (err) {
		if (client && transactionStarted) await client.query('ROLLBACK')
		console.error('Error creating deal:', err);
		return res.status(500).json({ error: 'Failed to create deal' });
	} finally {
		client?.release()
	}
});

// Dislike
router.post('/deals/:id/dislike', async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const userId = req.body.user_id;

  if (isNaN(dealId) || !userId) {
    return res.status(400).json({ error: 'deal id and user_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove any existing like from this user (switching vote)
    const removedLike = await client.query(
      `DELETE FROM deal_likes WHERE user_id = $1 AND deal_id = $2 RETURNING *`,
      [userId, dealId]
    );

    // Insert the dislike
    const insert = await client.query(
      `INSERT INTO deal_dislikes (user_id, deal_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, dealId]
    );

    if (insert.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Already disliked' });
    }

    // -1 for the dislike, extra -1 if we also removed a like
    const delta = removedLike.rows.length > 0 ? -2 : -1;

    const result = await client.query(
      `UPDATE deals
       SET net_likes = net_likes + $1
       WHERE id = $2
       RETURNING id, net_likes`,
      [delta, dealId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to dislike deal' });
  } finally {
    client.release();
  }
});

// Remove a dislike
router.delete('/deals/:id/dislike', async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const userId = req.body.user_id;

  if (isNaN(dealId) || !userId) {
    return res.status(400).json({ error: 'deal id and user_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const del = await client.query(
      `DELETE FROM deal_dislikes WHERE user_id = $1 AND deal_id = $2 RETURNING *`,
      [userId, dealId]
    );

    if (del.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Dislike not found' });
    }

    const result = await client.query(
      `UPDATE deals SET net_likes = net_likes + 1 WHERE id = $1 RETURNING id, net_likes`,
      [dealId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to remove dislike' });
  } finally {
    client.release();
  }
});

export default router;
