# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Run the app
FROM node:20-alpine AS runner
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "src/index.js"]