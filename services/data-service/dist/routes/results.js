"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/results.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
/**
 * POST /data/results
 * Body: { plateId: string, results: Array<{ label: string; class: string; confidence: number; bbox: { x1:number; y1:number; x2:number; y2:number } }> }
 */
router.post('/', async (req, res, next) => {
    try {
        const { plateId, results } = req.body;
        // 1) Find the most recent prediction_run for this plateId
        const { rows: prRows } = await db_1.pool.query(`
        SELECT id
          FROM microplates.prediction_run
         WHERE sample_no = $1
         ORDER BY predict_at DESC
         LIMIT 1
      `, [plateId]);
        if (prRows.length === 0) {
            return res.status(404).json({ error: 'No prediction_run found for that plateId' });
        }
        const runId = prRows[0].id;
        // 2) Bulk-insert each well prediction
        await Promise.all(results.map(r => db_1.pool.query(`
            INSERT INTO microplates.well_prediction
              (run_id, label, class, confidence, bbox)
            VALUES ($1, $2, $3, $4, $5)
          `, [runId, r.label, r.class, r.confidence, r.bbox])));
        res.status(201).json({ id: runId, success: true });
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /data/results
 * List all runs that have well_prediction entries
 */
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db_1.pool.query(`
        SELECT DISTINCT wp.run_id, pr.sample_no
          FROM microplates.well_prediction wp
          JOIN microplates.prediction_run pr
            ON pr.id = wp.run_id
      `);
        const items = rows.map((r) => ({
            id: r.run_id,
            plateId: r.sample_no
        }));
        res.json({ items });
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /data/results/:id
 * Return all well predictions for a given run (id = run_id)
 */
router.get('/:id', async (req, res, next) => {
    try {
        const runId = Number(req.params.id);
        // Validate run exists
        const { rows: prRows } = await db_1.pool.query(`SELECT sample_no FROM microplates.prediction_run WHERE id = $1`, [runId]);
        if (prRows.length === 0) {
            return res.status(404).json({ error: 'Run not found' });
        }
        const plateId = prRows[0].sample_no;
        // Fetch all well_prediction rows
        const { rows } = await db_1.pool.query(`
        SELECT label, class, confidence, bbox
          FROM microplates.well_prediction
         WHERE run_id = $1
      `, [runId]);
        const results = rows.map(r => ({
            label: r.label,
            class: r.class,
            confidence: r.confidence,
            bbox: r.bbox
        }));
        res.json({ id: runId, plateId, results });
    }
    catch (err) {
        next(err);
    }
});
/**
 * PUT /data/results/:id
 * Replace all well predictions for a given run
 * Body: { results: [...] }
 */
router.put('/:id', async (req, res, next) => {
    try {
        const runId = Number(req.params.id);
        const { results } = req.body;
        // Delete existing entries
        await db_1.pool.query(`DELETE FROM microplates.well_prediction WHERE run_id = $1`, [runId]);
        // Insert updated entries
        await Promise.all(results.map(r => db_1.pool.query(`
            INSERT INTO microplates.well_prediction
              (run_id, label, class, confidence, bbox)
            VALUES ($1, $2, $3, $4, $5)
          `, [runId, r.label, r.class, r.confidence, r.bbox])));
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
/**
 * DELETE /data/results/:id
 * Remove all predictions for a given run
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const runId = Number(req.params.id);
        await db_1.pool.query(`DELETE FROM microplates.well_prediction WHERE run_id = $1`, [runId]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
