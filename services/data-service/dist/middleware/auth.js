"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../configs/config");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header missing' });
        return;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        res
            .status(401)
            .json({ message: 'Malformed authorization header. Expected Bearer <token>' });
        return;
    }
    jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET, { algorithms: [config_1.ALGORITHM] }, (err, payload) => {
        if (err) {
            console.error('JWT error:', err);
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token has expired' });
            }
            else {
                res.status(403).json({ message: 'Invalid token: ' + err.message });
            }
            return;
        }
        req.user = payload;
        next();
    });
};
exports.authenticateToken = authenticateToken;
