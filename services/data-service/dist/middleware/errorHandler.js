"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    if (res.headersSent)
        return next(err);
    console.error('🚨 Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message });
}
exports.errorHandler = errorHandler;
