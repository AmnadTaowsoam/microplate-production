// services/data-service/src/utils/db.ts
import { Pool } from 'pg';
import { DATABASE_URL } from '../configs/config';

export const pool = new Pool({ connectionString: DATABASE_URL });

pool.on('error', (err: Error) => {
  console.error('Unexpected PG error', err);
  process.exit(-1);
});