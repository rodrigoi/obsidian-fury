# Build stage
FROM oven/bun:1 AS builder

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

# Copy only the built file.
COPY --from=builder /build/dist/index.js ./

# Copy scripts
COPY src/scripts/cron-task.sh /app/cron-task.sh
COPY src/scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/cron-task.sh /app/entrypoint.sh

# Install only the required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends cron && \
    # remove the apt cache
    rm -rf /var/lib/apt/lists/* && \
    # Setup cron job with full path to script
    echo "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n" > /etc/cron.d/obsidian-fury-cron && \
    # add cron task to the crontab file
    echo "*/30 * * * * root /app/cron-task.sh" >> /etc/cron.d/obsidian-fury-cron && \
    # make the cron file executable
    chmod 0644 /etc/cron.d/obsidian-fury-cron

# default entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# run the cron daemon in the foreground
CMD ["cron", "-f"]
