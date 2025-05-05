"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/auth-service/src/routes/authRoutes.ts
const express_1 = require("express");
const server_1 = require("../server");
const authService_1 = require("../services/authService");
const user_model_1 = require("../models/user.model");
const refreshToken_model_1 = require("../models/refreshToken.model");
const router = (0, express_1.Router)();
const userRepo = server_1.AppDataSource.getRepository(user_model_1.User);
const tokenRepo = server_1.AppDataSource.getRepository(refreshToken_model_1.RefreshToken);
const authService = new authService_1.AuthService(userRepo, tokenRepo);
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    try {
        const result = yield authService.signup(email, name, password);
        res.status(201).json({ accessToken: result.accessToken, expiresIn: result.expiresIn });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const result = yield authService.login(email, password);
        res.json(result);
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
}));
router.post('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        const result = yield authService.refresh(refreshToken);
        res.json(result);
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
}));
exports.default = router;
