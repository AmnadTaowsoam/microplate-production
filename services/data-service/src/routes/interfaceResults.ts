// services/data-service/src/routes/interfaceResults.ts
import { Router } from 'express';
import { pool } from '../utils/db';
import { InterfaceResult } from '../models';

const router = Router();

// POST /data/interface-results
router.post('/', async (req, res, next) => {
  try {
    const { runId, sampleNo, interfaceResult } = req.body as {
      runId?: number;
      sampleNo?: string;
      interfaceResult: any;
    };

    let actualRunId: number;

    if (runId) {
      actualRunId = runId;
    } else if (sampleNo) {
      const { rows: runRows } = await pool.query<{ id: number }>(
        `SELECT id FROM microplates.prediction_run WHERE sample_no = $1 ORDER BY predict_at DESC LIMIT 1`,
        [sampleNo]
      );
      if (!runRows.length) {
        return res.status(404).json({ error: 'No prediction_run found for that sampleNo' });
      }
      actualRunId = runRows[0].id;
    } else {
      res.status(400).json({ error: 'Either runId or sampleNo must be provided' });
      return;
    }

    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO microplates.interface_results (run_id, results)
       VALUES ($1, $2)
       RETURNING id`,
      [actualRunId, interfaceResult]
    );

    res.json({ id: rows[0].id, success: true });
  } catch (err) {
    next(err);
  }
});

// GET /data/interface-results
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<InterfaceResult>(
      `SELECT * FROM microplates.interface_results ORDER BY created_at DESC`
    );
    const items = await Promise.all(
      rows.map(async (r) => {
        const { rows: prRows } = await pool.query<{ sample_no: string }>(
          `SELECT sample_no FROM microplates.prediction_run WHERE id = $1`,
          [r.run_id]
        );
        return {
          id: r.id,
          sampleNo: prRows[0]?.sample_no,
          results: r.results,
          created_at: r.created_at,
        };
      })
    );
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /data/interface-results/:sample_no
// Fetch all interface_results for a given sample_no
router.get('/:sample_no', async (req, res, next) => {
  try {
    const sampleNo = req.params.sample_no;
    // join interface_results with prediction_run by sample_no
    const { rows } = await pool.query<InterfaceResult & { sample_no: string }>(
      `SELECT ir.id, ir.run_id, ir.results, ir.created_at, pr.sample_no
         FROM microplates.interface_results ir
         JOIN microplates.prediction_run pr
           ON pr.id = ir.run_id
        WHERE pr.sample_no = $1
        ORDER BY ir.created_at DESC`,
      [sampleNo]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'No interface results found for that sampleNo' });
    }

    const items = rows.map(r => ({
      id: r.id,
      run_id: r.run_id,
      sampleNo: r.sample_no,
      results: r.results,
      created_at: r.created_at,
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// PUT /data/interface-results/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { interfaceResult } = req.body as { interfaceResult: any };

    await pool.query(
      `UPDATE microplates.interface_results SET results = $1 WHERE id = $2`,
      [interfaceResult, id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /data/interface-results/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await pool.query(
      `DELETE FROM microplates.interface_results WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

