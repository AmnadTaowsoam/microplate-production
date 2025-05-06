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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// services/auth-service/src/configs/config.ts
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
dotenv.config({ path: (0, path_1.join)(__dirname, '../../../.env.common') });
dotenv.config({ path: (0, path_1.join)(__dirname, '../../.env.gateway') });
function required(key) {
    const v = process.env[key];
    if (!v)
        throw new Error(`Missing env var ${key}`);
    return v;
}
exports.default = {
    PORT: Number(process.env.PORT) || 3100,
    API_BASE_URL: required('API_BASE_URL'),
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    JWT_SECRET: required('JWT_SECRET_KEY'),
    AUTH_SERVICE_URL: required('AUTH_SERVICE_URL'),
    COBOT_SERVICE_URL: required('COBOT_SERVICE_URL'),
    CAMERA_SERVICE_URL: required('CAMERA_SERVICE_URL'),
    PREDICTOR_SERVICE_URL: required('PREDICTOR_SERVICE_URL'),
    DATA_SERVICE_URL: required('DATA_SERVICE_URL'),
    INTERFACE_SERVICE_URL: required('INTERFACE_SERVICE_URL')
};
