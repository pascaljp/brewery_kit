#!/bin/bash -eux
# How to use:
# Add this line to crontab.
#   0 * * * * update_job.sh

set +u
if [ ! -v "$USER" ]; then
    export USER=$(whoami)
fi
set -u
SCRIPT_DIR=$(cd $(dirname $0); pwd)

sudo chown $(whoami):$(whoami) -R /mnt/inkbird

BRANCH=$(curl http://brewery-app.com/current_version)
if [ ! -d /mnt/inkbird/brewery_kit ]; then
    echo "Cloning git repository branch=${BRANCH}"
    cd /mnt/inkbird
    git clone https://github.com/pascaljp/brewery_kit.git -b ${BRANCH} --depth 1
else
    echo "Syncing to branch ${BRANCH}"
    cd /mnt/inkbird/brewery_kit/monitoring
    git checkout ${BRANCH}
fi

cd /mnt/inkbird/brewery_kit/monitoring

if [[ "$(git fetch origin && git diff origin/${BRANCH} | wc -l)" == "0" &&
      -d "node_modules" ]]; then
    echo No update.
    exit 0
fi

# Update the code.
git pull origin ${BRANCH}
git checkout ${BRANCH}
npm install

# Setup the environment.
if [[ "$(whoami)" == "docker" ]]; then
    node ${SCRIPT_DIR}/setup.js --target=docker
else
    node ${SCRIPT_DIR}/setup.js --target=native
fi
