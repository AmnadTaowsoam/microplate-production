"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/interfaceResults.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
// POST /data/interface-results
// Body: { runId?: number, sampleNo?: string, interfaceResult: any }
router.post('/', async (req, res, next) => {
    try {
        const { runId, sampleNo, interfaceResult } = req.body;
        let actualRunId;
        if (runId) {
            actualRunId = runId;
        }
        else if (sampleNo) {
            // Look up the most recent run for this sample
            const { rows: runRows } = await db_1.pool.query(`SELECT id
           FROM microplates.prediction_run
          WHERE sample_no = $1
          ORDER BY predict_at DESC
          LIMIT 1`, [sampleNo]);
            if (!runRows.length) {
                return res.status(404).json({ error: 'No prediction_run found for that sampleNo' });
            }
            actualRunId = runRows[0].id;
        }
        else {
            return res.status(400).json({ error: 'Either runId or sampleNo must be provided' });
        }
        const { rows } = await db_1.pool.query(`INSERT INTO microplates.interface_results (run_id, results)
       VALUES ($1, $2)
       RETURNING id`, [actualRunId, interfaceResult]);
        res.json({ id: rows[0].id, success: true });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/interface-results
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db_1.pool.query(`SELECT * FROM microplates.interface_results
       ORDER BY created_at DESC`);
        // Optionally include sampleNo in the response
        const items = await Promise.all(rows.map(async (r) => {
            const { rows: prRows } = await db_1.pool.query(`SELECT sample_no
             FROM microplates.prediction_run
            WHERE id = $1`, [r.run_id]);
            return {
                id: r.id,
                sampleNo: prRows[0]?.sample_no,
                interfaceResult: r.results,
                created_at: r.created_at,
            };
        }));
        res.json({ items });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/interface-results/:id
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await db_1.pool.query(`SELECT * FROM microplates.interface_results WHERE id = $1`, [id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'InterfaceResult not found' });
        }
        const result = rows[0];
        const { rows: prRows } = await db_1.pool.query(`SELECT sample_no FROM microplates.prediction_run WHERE id = $1`, [result.run_id]);
        res.json({
            id: result.id,
            sampleNo: prRows[0]?.sample_no,
            interfaceResult: result.results,
            created_at: result.created_at,
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /data/interface-results/:id
router.put('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { interfaceResult } = req.body;
        await db_1.pool.query(`UPDATE microplates.interface_results
          SET results = $1
        WHERE id = $2`, [interfaceResult, id]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /data/interface-results/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await db_1.pool.query(`DELETE FROM microplates.interface_results WHERE id = $1`, [id]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
