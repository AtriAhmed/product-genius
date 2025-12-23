# -----------------------------
# 1) Builder
# -----------------------------
FROM node:22.20.0 AS builder
RUN corepack enable
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies for build
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Prisma client + build
RUN pnpm prisma generate
RUN pnpm build

# -----------------------------
# 2) Runner
# -----------------------------
FROM node:22.20.0 AS runner
RUN corepack enable
WORKDIR /home/appuser/app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN useradd -m -u 1001 appuser

# Copy only necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Prepare uploads directory
RUN mkdir -p uploads && chown -R appuser:appuser uploads

USER 1001:1001
EXPOSE 3000
CMD ["pnpm", "start"]
