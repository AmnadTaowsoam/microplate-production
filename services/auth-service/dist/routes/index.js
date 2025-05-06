"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = void 0;
// services/auth-service/src/routes/index.ts
const express_1 = require("express");
const authRoutes_1 = require("./authRoutes");
function createApiRouter(dataSource) {
    const mainRouter = (0, express_1.Router)();
    const authRouterInstance = (0, authRoutes_1.createAuthRouter)(dataSource);
    mainRouter.use('/api/v1/auth', authRouterInstance);
    return mainRouter;
}
exports.createApiRouter = createApiRouter;
