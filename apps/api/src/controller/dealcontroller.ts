import { Router } from 'express';

const router = Router();

router.get('/deals', (req, res) => {
  res.json({ status: 'ok', message: '67 diddy mustard'});
});

export default router;