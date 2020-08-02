#!/bin/bash -eux

# Connect to wireless network.
read -p "Input the SSID of the wireless network: " WIFI_SSID
read -p "Input the SSID of the wireless network: " WIFI_PASSWORD
sudo apt install -y network-manager
nmcli device wifi connect ${WIFI_SSID} password ${WIFI_PASSWORD}

# Enable Bluetooth.
sudo apt install -y pi-bluetooth

# Setup nodejs's noble library
sudo apt install -y bluetooth bluez libbluetooth-dev libudev-dev
npm install
sudo npm install -g pm2

sudo pm2 start inkbird.js --name inkbird
pm2 start "pm2 pull inkbird" --cron '0 * * * *' --no-autorestart
sleep 10
sudo pm2 save
sleep 10

sudo reboot
