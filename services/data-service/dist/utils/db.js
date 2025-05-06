"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// services/data-service/src/utils/db.ts
const pg_1 = require("pg");
const config_1 = require("../configs/config");
exports.pool = new pg_1.Pool({ connectionString: config_1.DATABASE_URL });
exports.pool.on('error', (err) => {
    console.error('Unexpected PG error', err);
    process.exit(-1);
});
