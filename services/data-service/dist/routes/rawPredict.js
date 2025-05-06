"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/rawPredict.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
// POST /data/raw-predict
// Body: { plateId: string, rawPredict: any }
router.post('/', async (req, res, next) => {
    try {
        const { plateId, rawPredict } = req.body;
        // 1) insert into prediction_run
        const { rows: prRows } = await db_1.pool.query(`INSERT INTO microplates.prediction_run(sample_no, status)
       VALUES ($1, 'pending')
       RETURNING id, sample_no, predict_at, status`, [plateId]);
        const run = prRows[0];
        // 2) insert into row_counts
        await db_1.pool.query(`INSERT INTO microplates.row_counts(run_id, counts)
       VALUES ($1, $2)`, [run.id, rawPredict]);
        res.status(201).json({ id: run.id, success: true });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/raw-predict
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db_1.pool.query(`SELECT * FROM microplates.prediction_run
       ORDER BY predict_at DESC`);
        res.json({ items: rows });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/raw-predict/:id
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        // fetch prediction_run
        const { rows: prRows } = await db_1.pool.query(`SELECT * FROM microplates.prediction_run WHERE id = $1`, [id]);
        if (!prRows.length) {
            return res.status(404).json({ error: 'Not found' });
        }
        const run = prRows[0];
        // fetch the latest row_counts for this run
        const { rows: rcRows } = await db_1.pool.query(`SELECT counts FROM microplates.row_counts
       WHERE run_id = $1
       ORDER BY created_at DESC
       LIMIT 1`, [id]);
        const rawPredict = rcRows[0]?.counts ?? null;
        res.json({
            id: run.id,
            plateId: run.sample_no,
            rawPredict,
            status: run.status,
            predictAt: run.predict_at,
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /data/raw-predict/:id
// Body: { rawPredict: any }
router.put('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { rawPredict } = req.body;
        // update the existing row_counts (or insert a new one—you can choose)
        await db_1.pool.query(`UPDATE microplates.row_counts
         SET counts = $1, created_at = NOW()
       WHERE run_id = $2`, [rawPredict, id]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /data/raw-predict/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        // cascade delete prediction_run (row_counts will be removed via ON DELETE CASCADE)
        await db_1.pool.query(`DELETE FROM microplates.prediction_run WHERE id = $1`, [id]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
