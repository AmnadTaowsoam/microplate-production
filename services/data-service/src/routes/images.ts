// services/data-service/src/routes/images.ts
import { Router } from 'express';
import { pool } from '../utils/db';
import { ImageFile } from '../models';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /data/images
// Body: { plateId: string, imageBase64: string }
router.post('/', async (req, res, next) => {
  try {
    const { plateId, imageBase64, fileType } = req.body as {
      plateId: string;
      imageBase64: string;
      fileType?: 'raw' | 'annotated';
    };

    const buffer = Buffer.from(imageBase64, 'base64');
    const filename = `${uuidv4()}.png`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // save file
    await fs.promises.writeFile(filepath, buffer);

    // insert metadata into DB
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO microplates.image_file
         (run_id, sample_no, file_type, path)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        /* run_id */ null,      // or map plateId → existing run_id if appropriate
        plateId,
        fileType ?? 'raw',
        filepath
      ]
    );

    res.json({ id: rows[0].id, success: true });
  } catch (err) {
    next(err);
  }
});

// GET /data/images
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<ImageFile>(
      `SELECT * FROM microplates.image_file ORDER BY created_at DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

// GET /data/images/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query<ImageFile>(
      `SELECT * FROM microplates.image_file WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    const img = rows[0];
    res.json({
      id: img.id,
      plateId: img.sample_no,
      imageUrl: `/uploads/${path.basename(img.path)}`
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /data/images/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // first fetch path to delete file
    const { rows } = await pool.query<ImageFile>(
      `SELECT path FROM microplates.image_file WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    const filepath = rows[0].path;
    // delete DB record
    await pool.query(`DELETE FROM microplates.image_file WHERE id = $1`, [id]);
    // delete file
    await fs.promises.unlink(filepath).catch(() => { /* ignore if missing */ });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
