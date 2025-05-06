# ---------- Stage 1 : build ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package.json tsconfig.json ./
    RUN npm install
    COPY src ./src
    RUN npm run build
    
    # ---------- Stage 2 : runtime ----------
    FROM node:18-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=builder /app/package.json ./
    RUN npm install --omit=dev --ignore-scripts
    COPY --from=builder /app/dist ./dist
    COPY .env.gateway ./
    EXPOSE 3100
    CMD ["node", "dist/server.js"]
    