# Use official Node.js LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install dependencies (only production packages)
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start backend server
CMD ["node", "server.js"]
