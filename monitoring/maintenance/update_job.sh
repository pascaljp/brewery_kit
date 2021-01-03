#!/bin/bash -eux
# How to use:
# Add this line to crontab.
#   0 * * * * update_job.sh

if [[ "$(git fetch origin && git diff origin/master | wc -l)" == "0" ]]; then
    echo No update.
    exit 0
fi

# Update the code.
git pull origin master
npm install

# Setup the environment.
if [[ "${USER}" == "docker" ]]; then
    node setup.js --target=docker
else
    node setup.js --target=native
fi

# Restart the job.
pm2 restart inkbird
