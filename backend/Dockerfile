# Use official Node.js LTS Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install dependencies (only production packages)
RUN npm ci --omit=dev

# Copy application code (offline_data.json included, so the API works without the database)
COPY --chown=node:node . .

# Run as the unprivileged node user
USER node

# Expose port
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1

# Start backend server
CMD ["node", "server.js"]
