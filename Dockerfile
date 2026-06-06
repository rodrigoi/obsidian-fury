FROM oven/bun:alpine
WORKDIR /app

RUN addgroup -S obsidian-fury && adduser -S -G obsidian-fury obsidian-fury

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY src ./src
COPY tsconfig.json ./
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# obsidian-fury's crontab — crond (root) runs these jobs as the obsidian-fury user.
# Jobs write to a named pipe created at runtime by entrypoint.sh.
RUN mkdir -p /var/spool/cron/crontabs \
    && printf '*/30 * * * * /usr/local/bin/bun /app/src/index.ts --worker "hacker-news" --worker "truly-remote" >> /tmp/cron.log 2>&1\n' > /var/spool/cron/crontabs/watcherr \
    && chmod 600 /var/spool/cron/crontabs/obsidian-fury

ENTRYPOINT ["/entrypoint.sh"]
