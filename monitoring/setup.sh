#!/bin/bash -eux

# Enable Bluetooth.
sudo apt install -y pi-bluetooth

# Setup nodejs.
sudo apt install -y npm

# Setup nodejs's noble library.
sudo apt install -y bluetooth bluez libbluetooth-dev libudev-dev
npm install
sudo npm install -g pm2

# Without this line node cannot read bluetooth data.
# See https://github.com/abandonware/noble/issues/93
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

pm2 startup
pm2 start inkbird.js --name inkbird
pm2 start "pm2 pull inkbird" --cron '0 * * * *' --no-autorestart
sleep 10
pm2 save
pm2 list
sleep 10

sudo reboot
