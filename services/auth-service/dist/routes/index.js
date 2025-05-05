"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/auth-service/src/routes/index.ts
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const router = (0, express_1.Router)();
// Mount auth routes
router.use('/api/v1/auth', authRoutes_1.default);
exports.default = router;
