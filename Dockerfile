# ── Stage 1: Build ───────────────────────────────────────────
# Use full Node to compile TypeScript — this stage is thrown away
# after the build, so its size doesn't affect the final image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Patch Alpine system packages to clear known CVEs
RUN apk update && apk upgrade --no-cache

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript)
RUN npm ci

# Copy source and compile TypeScript → dist/
COPY . .
RUN npm run build

# ── Stage 2: Runtime ─────────────────────────────────────────
# Start fresh — only copy what's needed to run the app
FROM node:20-alpine AS runtime

# Patch Alpine system packages here too
RUN apk update && apk upgrade --no-cache

WORKDIR /usr/src/app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Don't run as root — security best practice
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]