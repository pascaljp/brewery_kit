#!/bin/bash -eux

git pull
npm install
sudo chown docker:docker /mnt/inkbird
node setup.js
pm2 restart inkbird
