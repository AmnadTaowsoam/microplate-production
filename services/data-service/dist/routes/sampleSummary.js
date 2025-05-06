"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/sampleSummary.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
// GET /data/sample-summary
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db_1.pool.query('SELECT * FROM microplates.sample_summary');
        res.json({ items: rows });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/sample-summary/:sample_no
router.get('/:sample_no', async (req, res, next) => {
    try {
        const sampleNo = req.params.sample_no;
        const { rows } = await db_1.pool.query('SELECT * FROM microplates.sample_summary WHERE sample_no = $1', [sampleNo]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sample summary not found' });
        }
        const summaryRow = rows[0];
        res.json({ sampleNo: summaryRow.sample_no, summary: summaryRow.summary });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
