# ---------- Build stage ----------
FROM node:22-slim AS builder

# Install build tools
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=development

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --prefer-offline --no-audit --progress=false || npm install --legacy-peer-deps

# Copy project source
COPY . .

# Build Nuxt without hardcoding env vars
# This ensures runtime envs from Render can override during container start
RUN rm -rf .output && npm run build

# ---------- Production stage ----------
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN useradd -m appuser
USER appuser

# Copy only built output and package files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Start the Nuxt app
CMD ["node", ".output/server/index.mjs"]
