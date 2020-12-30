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
