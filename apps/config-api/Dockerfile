# ==========================================
# Config API - Multi-stage Dockerfile
# ==========================================
FROM node:20-alpine AS base

# Metadata
LABEL maintainer="Laboratorio EG <dev@laboratorio-eg.com>"
LABEL description="Config API - Laboratorio EG System"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && \
    npm cache clean --force

# ==========================================
# Stage 2: Production
# ==========================================
FROM base AS production

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment variables (will be overridden by docker-compose or runtime)
ENV NODE_ENV=production \
    PORT=3005 \
    LOG_LEVEL=info

# Expose ports
EXPOSE 3005 3006

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
