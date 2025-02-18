#!/bin/sh

cd /app && /usr/local/bin/bun index.js --worker hacker-news >> /var/log/cron.log 2>&1
cd /app && /usr/local/bin/bun index.js --worker truly-remote >> /var/log/cron.log 2>&1
