# -----------------------------
# 1) Builder
# -----------------------------
FROM node:22.20.0 AS builder

# create reproducible build env
WORKDIR /app

# copy lock/package files
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# install — no dev deps in production build
RUN npm ci --omit=dev

# copy full project
COPY . .

# generate prisma client
RUN npx prisma generate

# next build
RUN npm run build


# -----------------------------
# 2) Runner
# -----------------------------
FROM node:22.20.0-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000

# create non-root user & home
RUN useradd -m -d /home/appuser appuser

WORKDIR /home/appuser/app
USER appuser

# copy built app contents
COPY --from=builder --chown=appuser:appuser /app ./

# secure uploads
RUN mkdir -p /home/appuser/app/uploads \
    && chmod 700 /home/appuser/app/uploads

EXPOSE 3000

# 🔥 keep your start command intact
CMD ["npm", "start"]
