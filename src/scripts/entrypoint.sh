#!/bin/sh
# Export environment variables to a file that can be sourced
env | while read -r line; do
  echo "export $line" >> /app/.env.sh
done
chmod +x /app/.env.sh

exec "$@"
