#!/bin/sh

# fixes issue where environment variables are not available in the crontab
printenv > /etc/environment

exec "$@"
