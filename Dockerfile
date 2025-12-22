# -----------------------------
# 1) Builder
# -----------------------------
FROM node:22.20.0 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install all dependencies (dev + prod) for build
RUN npm install

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build


# -----------------------------
# 2) Runner
# -----------------------------
FROM node:22.20.0 AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user with a home directory
RUN useradd -m -u 1001 appuser

# Set working directory inside the user's home
WORKDIR /home/appuser/app

# Copy build artifacts & package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts

# Prepare uploads directory with proper permissions
RUN mkdir -p uploads && chown -R appuser:appuser uploads

# Drop privileges: run as non-root user
USER 1001:1001

EXPOSE 3000
CMD ["npm", "start"]
