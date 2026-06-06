#!/bin/sh
mkdir -p /app/data
chmod 777 -R /app/data
touch /tmp/cron.log
chmod 666 /tmp/cron.log
tail -f /tmp/cron.log &
exec crond -f
