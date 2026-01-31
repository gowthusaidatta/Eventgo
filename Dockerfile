# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Set npm to avoid unnecessary warnings
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm ci --omit=dev || npm install --production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM ubuntu:22.04

# Install nginx and curl for health checks
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create nginx user
RUN useradd -m -s /sbin/nologin nginx || true

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Enable the site
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default || true

# Remove default nginx config if it exists
RUN rm -f /etc/nginx/sites-enabled/default || true

# Copy built application from build stage
COPY --from=build /app/dist /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Create nginx cache directory
RUN mkdir -p /var/cache/nginx && chown -R www-data:www-data /var/cache/nginx

# Create supervisor config for nginx
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisor.conf /etc/supervisor/conf.d/nginx.conf || true

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/index.html || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
