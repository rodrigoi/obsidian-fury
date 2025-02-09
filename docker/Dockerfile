# Build stage
FROM oven/bun:1 as builder

WORKDIR /build

# Copy only package files first to leverage cache
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Build the application into a single file
RUN bun build ./src/index.ts --outfile=dist/index.js --target=bun

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy only the built file and package.json (for dependencies)
COPY --from=builder /build/dist/index.js ./
COPY --from=builder /build/package.json ./

# Copy scripts
COPY src/scripts/cron-task.sh /app/cron-task.sh
COPY src/scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/cron-task.sh /app/entrypoint.sh

# Install only the required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends cron && \
    rm -rf /var/lib/apt/lists/* && \
    # Setup cron job with full path to script
    echo "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n" > /etc/cron.d/app-cron && \
    echo "*/30 * * * * root /app/cron-task.sh" >> /etc/cron.d/app-cron && \
    chmod 0644 /etc/cron.d/app-cron

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["cron", "-f"]
