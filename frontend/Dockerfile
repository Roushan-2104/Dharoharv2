# ----------------------------------------------------
# Stage 1: Build Frontend Assets
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm ci || npm install

# Build argument for API URL if custom domain is used
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Nginx Server
# ----------------------------------------------------
FROM nginx:alpine

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
