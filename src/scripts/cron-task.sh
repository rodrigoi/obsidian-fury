#!/bin/sh
source /app/.env.sh
cd /app && /usr/local/bin/bun index.js >> /var/log/cron.log 2>&1
