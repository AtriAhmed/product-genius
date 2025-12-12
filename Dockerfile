# -----------------------------
# 1) Builder
# -----------------------------
FROM node:22.20.0 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma client (important for Linux container)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# -----------------------------
# 2) Runner
# -----------------------------
FROM node:22.20.0 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files + node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Persistent uploads folder
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["npm", "start"]
