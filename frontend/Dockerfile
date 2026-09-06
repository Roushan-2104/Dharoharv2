# ----------------------------------------------------
# Development Dockerfile (Live Hot-Reload with Vite)
# ----------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install

# Copy rest of the application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server on all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
