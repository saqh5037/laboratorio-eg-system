# ==========================================
# Stage 1: Build
# ==========================================
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Laboratorio EG <dev@laboratorio-eg.com>"
LABEL description="Frontend PWA - Laboratorio EG System"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_CONFIG_API_URL
ARG VITE_RESULTS_API_URL
ARG VITE_MESSAGING_BOT_API_URL=/api/messaging
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CONFIG_API_URL=$VITE_CONFIG_API_URL
ENV VITE_RESULTS_API_URL=$VITE_RESULTS_API_URL
ENV VITE_MESSAGING_BOT_API_URL=$VITE_MESSAGING_BOT_API_URL
ENV NODE_ENV=$NODE_ENV

# Build application
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM nginx:alpine

# Install nodejs for API proxy (optional, si necesitas SSR)
# RUN apk add --no-cache nodejs npm

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment replacement script for runtime config
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Use custom entrypoint for env var replacement at runtime
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
