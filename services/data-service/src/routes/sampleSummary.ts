// services/data-service/src/routes/sampleSummary.ts
import { Router } from 'express';
import { pool } from '../utils/db';
import { SampleSummary } from '../models';

const router = Router();

// GET /data/sample-summary
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<SampleSummary>(
      'SELECT * FROM microplates.sample_summary'
    );
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

// GET /data/sample-summary/by-sample/:sample_no
router.get('/by-sample/:sample_no', async (req, res, next) => {
  try {
    const sampleNo = req.params.sample_no;

    // ดึงสรุปจาก sample_summary โดยตรง
    const { rows } = await pool.query<SampleSummary>(
      `SELECT sample_no, summary
         FROM microplates.sample_summary
        WHERE sample_no = $1`,
      [sampleNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sample summary not found' });
    }

    const summaryRow = rows[0];
    res.json({ sampleNo: summaryRow.sample_no, summary: summaryRow.summary });
  } catch (err) {
    next(err);
  }
});

export default router;
