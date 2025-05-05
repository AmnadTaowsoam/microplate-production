

# Dockerfile.dev
# Development build for API Gateway
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (including dev)
COPY package.json tsconfig.json ./
RUN npm install --production=false

# Copy environment and source, then build
COPY .env.gateway ./
COPY src ./src
RUN npm run build

# Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app

# Only install production deps
COPY package.json ./
RUN npm install --production=true

# Copy built artifacts and env
COPY --from=builder /app/dist ./dist
COPY .env.gateway ./

# Expose API Gateway port
EXPOSE 3100

# Start server
CMD ["node", "dist/server.js"]