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
exports.ALGORITHM = exports.REFRESH_TOKEN_EXPIRE_DAYS = exports.ACCESS_TOKEN_EXPIRE_MINUTES = exports.JWT_SECRET = exports.PORT = exports.DATABASE_URL = exports.DB_PASSWORD = exports.DB_USER = exports.DB_NAME = exports.DB_PORT = exports.DB_HOST = void 0;
// services/data-service/src/configs/config.ts
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
// โหลดค่าจากไฟล์ .env.common (อยู่ที่ services/.env.common)
dotenv.config({
    path: (0, path_1.join)(__dirname, '../../../.env.common'),
});
// โหลดค่าจากไฟล์ .env.auth (อยู่ที่ services/auth-service/.env.auth)
dotenv.config({
    path: (0, path_1.join)(__dirname, '../../.env.datas'),
});
// 4) Database settings
exports.DB_HOST = process.env.DB_HOST;
exports.DB_PORT = Number(process.env.DB_PORT) || 5432;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DATABASE_URL = process.env.DATABASE_URL ||
    `postgresql://${exports.DB_USER}:${exports.DB_PASSWORD}@${exports.DB_HOST}:${exports.DB_PORT}/${exports.DB_NAME}`;
// 5) Server port
exports.PORT = Number(process.env.PORT) || 3105;
// 6) JWT settings
const secret = process.env.JWT_SECRET_KEY;
if (!secret) {
    console.error('❌ Missing JWT_SECRET_KEY! Check your .env files and paths.');
    process.exit(1);
}
exports.JWT_SECRET = process.env.JWT_SECRET_KEY;
exports.ACCESS_TOKEN_EXPIRE_MINUTES = Number(process.env.TOKEN_EXPIRATION_MINUTES) || 1440;
exports.REFRESH_TOKEN_EXPIRE_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7;
// 7) Algorithm (fixed syntax)
exports.ALGORITHM = process.env.ALGORITHM || 'HS256';
