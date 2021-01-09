#!/bin/bash -eux
# How to use:
# Add this line to crontab.
#   0 * * * * update_job.sh

set +u
if [ ! -v "$USER" ]; then
    export USER=$(whoami)
fi
set -u

sudo chown ${USER}:${USER} -R /mnt/inkbird

# Update the code. Exit if there is no update.
BRANCH=$(curl http://brewery-app.com/current_version 2>/dev/null)
if [ ! -d /mnt/inkbird/brewery_kit/monitoring/maintenance ]; then
    echo "Cloning git repository branch=${BRANCH}"
    cd /mnt/inkbird
    git clone https://github.com/pascaljp/brewery_kit.git -b ${BRANCH} --depth 1
else
    echo "Syncing to branch ${BRANCH}"
    cd /mnt/inkbird/brewery_kit/monitoring
    if [[ "$(git fetch origin ${BRANCH} && git diff origin/${BRANCH} | wc -l)" == "0" &&
              -d "node_modules" ]]; then
        echo No update
        exit 0
    fi

    git pull origin ${BRANCH} >/dev/null 2>/dev/null
    git checkout ${BRANCH} >/dev/null 2>/dev/null
fi

cd /mnt/inkbird/brewery_kit/monitoring
npm install

# Setup the environment.
if [[ "${USER}" == "docker" ]]; then
    node maintenance/setup.js --target=docker
else
    node maintenance/setup.js --target=native
fi

echo Updated
