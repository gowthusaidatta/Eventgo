# syntax=docker/dockerfile:1
# Multi-stage build for EventGo Frontend
# Works on both Windows (with WSL2) and Linux

############################
# Build stage
############################
FROM oven/bun:latest AS build
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

############################
# Runtime stage - Alpine for cross-platform compatibility
############################
FROM node:18-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/dist /app/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=80

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the static file server
CMD ["serve", "-s", "/app/dist", "-l", "80"]
