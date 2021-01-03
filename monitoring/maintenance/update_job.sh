#!/bin/bash -eux
# How to use:
# Add this line to crontab.
#   0 * * * * update_job.sh

SCRIPT_DIR=$(cd $(dirname $0); pwd)
BRANCH=$(curl http://brewery-app.com/current_version)
echo "Syncing to branch ${BRANCH}"
git checkout ${BRANCH}

if [[ "$(git fetch origin && git diff origin/${BRANCH} | wc -l)" == "0" &&
      -d "node_modules" ]]; then
    echo No update.
    exit 0
fi

# Update the code.
git pull origin ${BRANCH}
npm install

# Setup the environment.
if [[ "${USER}" == "docker" ]]; then
    node ${SCRIPT_DIR}/setup.js --target=docker
else
    node ${SCRIPT_DIR}/setup.js --target=native
fi
