# syntax=docker/dockerfile:1

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

# Install ALL dependencies (including devDependencies for Vite build)
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

############################
# Runtime stage
############################
FROM ubuntu:22.04

# Install nginx and curl for health checks
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Create nginx sites-enabled symlink
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy built application from build stage
COPY --from=build /app/dist /var/www/html

# Set proper permissions for nginx
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/index.html || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
