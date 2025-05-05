##services/auth/Dockerfile.dev (multi-stage)
# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
# Copy package and lock files
COPY package.json tsconfig.json ./
# Install dependencies and build
RUN npm install --production=false
COPY src ./src
RUN npm run build

# Stage 2: production runtime
FROM node:18-alpine
WORKDIR /usr/src/app
# Install only production deps
COPY package.json ./
RUN npm install --production=true
# Copy built files
COPY --from=builder /usr/src/app/dist ./dist
# Copy environment file if needed
COPY .env.auth ./
# Expose port
EXPOSE 3101
# Run the server
CMD ["node", "dist/server.js"]