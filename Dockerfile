# -----------------------------
# 1) Builder
# -----------------------------
FROM node:22.20.0 AS builder

# Enable Corepack (provides pnpm)
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev + prod) for build
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js app
RUN pnpm build

# -----------------------------
# 2) Runner
# -----------------------------
FROM node:22.20.0 AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Enable Corepack in runtime
RUN corepack enable

# Create a non-root user
RUN useradd -m -u 1001 appuser

# Pre-create Corepack cache folder and fix permissions
RUN mkdir -p /home/appuser/.cache/node/corepack/v1 \
    && chown -R 1001:1001 /home/appuser/.cache

# Set working directory
WORKDIR /home/appuser/app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Prepare uploads directory
RUN mkdir -p uploads && chown -R appuser:appuser uploads

# Drop privileges: run as non-root user
USER 1001:1001

EXPOSE 3000
CMD ["pnpm", "start"]
