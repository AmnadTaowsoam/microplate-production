"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/images.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// POST /data/images
// Body: { plateId: string, imageBase64: string }
router.post('/', async (req, res, next) => {
    try {
        const { plateId, imageBase64, fileType } = req.body;
        const buffer = Buffer.from(imageBase64, 'base64');
        const filename = `${(0, uuid_1.v4)()}.png`;
        const filepath = path.join(UPLOAD_DIR, filename);
        // save file
        await fs.promises.writeFile(filepath, buffer);
        // insert metadata into DB
        const { rows } = await db_1.pool.query(`INSERT INTO microplates.image_file
         (run_id, sample_no, file_type, path)
       VALUES ($1, $2, $3, $4)
       RETURNING id`, [
            /* run_id */ null,
            plateId,
            fileType ?? 'raw',
            filepath
        ]);
        res.json({ id: rows[0].id, success: true });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/images
router.get('/', async (_req, res, next) => {
    try {
        const { rows } = await db_1.pool.query(`SELECT * FROM microplates.image_file ORDER BY created_at DESC`);
        res.json({ items: rows });
    }
    catch (err) {
        next(err);
    }
});
// GET /data/images/:id
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await db_1.pool.query(`SELECT * FROM microplates.image_file WHERE id = $1`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        const img = rows[0];
        res.json({
            id: img.id,
            plateId: img.sample_no,
            imageUrl: `/uploads/${path.basename(img.path)}`
        });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /data/images/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        // first fetch path to delete file
        const { rows } = await db_1.pool.query(`SELECT path FROM microplates.image_file WHERE id = $1`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        const filepath = rows[0].path;
        // delete DB record
        await db_1.pool.query(`DELETE FROM microplates.image_file WHERE id = $1`, [id]);
        // delete file
        await fs.promises.unlink(filepath).catch(() => { });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
