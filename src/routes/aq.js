import express from 'express';
import { getAQData } from '../services/aqService.js';

const router = express.Router();

router.get('/:city', async (req, res) => {
  try {
    const data = await getAQData(req.params.city);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;