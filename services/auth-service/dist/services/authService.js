"use strict";
// services/auth-service/src/services/authService.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hash_1 = require("../utils/hash");
const config_1 = require("../configs/config");
class AuthService {
    constructor(userRepo, tokenRepo) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
    }
    signup(email, name, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.userRepo.findOne({ where: { email } });
            if (exists)
                throw new Error('Email already in use');
            const passwordHash = yield (0, hash_1.hashPassword)(password);
            const user = this.userRepo.create({ email, name, passwordHash });
            yield this.userRepo.save(user);
            return this.createTokenPair(user);
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findOne({ where: { email } });
            if (!user)
                throw new Error('Invalid credentials');
            const valid = yield (0, hash_1.comparePassword)(password, user.passwordHash);
            if (!valid)
                throw new Error('Invalid credentials');
            return this.createTokenPair(user);
        });
    }
    refresh(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const stored = yield this.tokenRepo.findOne({
                where: { token: refreshToken, revoked: false },
                relations: ['user'],
            });
            if (!stored)
                throw new Error('Invalid refresh token');
            // Verify and restrict to our algorithm
            jsonwebtoken_1.default.verify(refreshToken, config_1.JWT_SECRET, { algorithms: [config_1.ALGORITHM] }, (err) => {
                if (err)
                    throw new Error('Invalid or expired refresh token');
            });
            // Revoke old token
            stored.revoked = true;
            yield this.tokenRepo.save(stored);
            // Issue new access token
            const { accessToken } = this.generateAccessToken(stored.user.id);
            return { accessToken };
        });
    }
    createTokenPair(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure 'sub' is a string
            const subject = String(user.id);
            const payload = { sub: subject };
            const accessToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, {
                expiresIn: `${config_1.ACCESS_TOKEN_EXPIRE_MINUTES}m`,
                algorithm: config_1.ALGORITHM,
            });
            const expiresIn = config_1.ACCESS_TOKEN_EXPIRE_MINUTES * 60;
            const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, {
                expiresIn: `${config_1.REFRESH_TOKEN_EXPIRE_DAYS}d`,
                algorithm: config_1.ALGORITHM,
            });
            const expiresAt = new Date(Date.now() + config_1.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000);
            const tokenEntity = this.tokenRepo.create({
                user,
                token: refreshToken,
                expiresAt,
            });
            yield this.tokenRepo.save(tokenEntity);
            return { accessToken, expiresIn, refreshToken };
        });
    }
    generateAccessToken(userId) {
        // Ensure 'sub' is a string
        const payload = { sub: String(userId) };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, {
            expiresIn: `${config_1.ACCESS_TOKEN_EXPIRE_MINUTES}m`,
            algorithm: config_1.ALGORITHM,
        });
        return { accessToken, expiresIn: config_1.ACCESS_TOKEN_EXPIRE_MINUTES * 60 };
    }
}
exports.AuthService = AuthService;
