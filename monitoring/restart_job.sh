#!/bin/bash -eux

git fetch origin
git diff origin/master

if [[ "$(git fetch origin && git diff origin/master | wc -l)" == "0" ]]; then
    echo No update.
    exit 0
fi

git pull
npm install
sudo chown docker:docker /mnt/inkbird
node setup.js
pm2 restart inkbird
