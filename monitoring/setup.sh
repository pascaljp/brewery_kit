#!/bin/bash -eux

# Setup nodejs.
sudo apt install -y curl npm
# Install versioned nodejs and delete the npm installed from apt.
sudo npm install n -g && sudo n stable && sudo apt-get purge -y nodejs npm

# Setup nodejs's noble library.
sudo apt install -y bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin
npm install
sudo npm install -g pm2

# Without this line node cannot read bluetooth data.
# See https://github.com/abandonware/noble/issues/93
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

# pm2 startup
# sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup upstart -u docker --hp /home/docker
pm2 start inkbird.js --name inkbird
pm2 start "pm2 pull inkbird" --cron '0 * * * *' --no-autorestart
sleep 10
pm2 save
pm2 list
sleep 10

# sudo reboot
