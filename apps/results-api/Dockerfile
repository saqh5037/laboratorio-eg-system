# ==========================================
# Results API - Multi-stage Dockerfile
# ==========================================
# Note: Uses Puppeteer for PDF generation, requires Chromium dependencies
FROM node:20-alpine AS base

# Metadata
LABEL maintainer="Laboratorio EG <dev@laboratorio-eg.com>"
LABEL description="Results API - Laboratorio EG System"

# Install dumb-init and Chromium dependencies for Puppeteer
RUN apk add --no-cache \
    dumb-init \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set working directory
WORKDIR /app

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies
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
RUN mkdir -p logs temp templates && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment variables (will be overridden by docker-compose or runtime)
ENV NODE_ENV=production \
    PORT=3003 \
    LOG_LEVEL=info

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "import('http').then(http => {http.get('http://localhost:${PORT}/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
