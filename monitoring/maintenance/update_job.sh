#!/bin/bash -eux

# Updates inkbird monitoring program to the latest version, and sets up the
# environment.

function install_inkbird() {
    BRANCH=$1
    echo "Cloning git repository branch=${BRANCH}"
    cd /mnt/inkbird
    git clone https://github.com/pascaljp/brewery_kit.git -b ${BRANCH} --depth 1
}

function update_inkbird() {
    BRANCH=$1
    echo "Syncing to branch ${BRANCH}"
    cd /mnt/inkbird/brewery_kit/monitoring
    if [[ "$(git fetch origin ${BRANCH} 2>/dev/null && git diff origin/${BRANCH} | wc -l)" == "0" &&
              -d "node_modules" ]]; then
        echo No update
        exit 0
    fi

    git pull origin ${BRANCH} >/dev/null 2>/dev/null
    git checkout ${BRANCH} >/dev/null 2>/dev/null
}

set +u
if [ ! -v "$USER" ]; then
    export USER=$(whoami)
fi
set -u

sudo chown ${USER}:${USER} -R /mnt/inkbird

# Update the code. Exit if there is no update.
BRANCH=$(curl http://brewery-app.com/current_version 2>/dev/null)
if [ ! -d /mnt/inkbird/brewery_kit/monitoring/maintenance ]; then
    install_inkbird ${BRANCH}
else
    update_inkbird ${BRANCH}
fi

cd /mnt/inkbird/brewery_kit/monitoring
npm install

# Reinstall crontab.
# crontab -u ${USER} monitoring/crontab.user
# sudo crontab -u root monitoring/crontab.root

# Setup the environment.
if [[ "${USER}" == "docker" ]]; then
    node maintenance/setup.js --target=docker
else
    node maintenance/setup.js --target=native
fi

echo Updated
