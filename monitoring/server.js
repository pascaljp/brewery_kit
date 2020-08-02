// How to authenticate users:
// 1. monitoring program uploads machineId to a server.
// 2. user accesses the server, and get an IP address of the monitoring program.
// 3. user accesses the monitoring program to get the machineID.
// 4. user sends the machineId to the server.
// 5. now the server knows the user has an access to the machine.

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const log4js = require('log4js');
const os = require('os');
const path = require('path');

class Server {
  constructor() {
    this.logger_ = log4js.getLogger('server');
    this.app_ = express();
    this.server_ = null;

    this.app_.get('/', (req, res) => {
      res.send('OK');
    });

    this.app_.get('/getMachineId', (req, res) => {
      res.header('Content-Type', 'application/json; charset=utf-8');
      try {
        const machineId = this.getMachineId_();
        res.json({status: 'ok', machineId: machineId});
      } catch (e) {
        res.json({status: 'error', error: e});
      }
    });
  }

  start() {
    this.logger_.mark('Starting up a server...');
    this.server_ = this.app_.listen(0, () => {
      this.logger_.info('Server started.');
      this.notifyLocalIpAddress_(this.getMachineId_());
    });
  }

  getMachineId_() {
    const configFilePath = path.join(__dirname, 'config.json');
    const config = JSON.parse(fs.readFileSync(configFilePath, 'UTF-8'));
    return config.machineId;
  }

  async notifyLocalIpAddress_(machineId) {
    const port = this.server_.address().port;

    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
      for (const entry of interfaces[name]) {
        if (entry.family != 'IPv4') {
          continue;
        }
        if (entry.address == '127.0.0.1') {
          continue;
        }

        await fetch('https://brewery-app.com/api/client/saveIpAddress', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json; charset=utf-8'},
          redirect: 'follow',
          referrer: 'no-referrer',
          body: JSON.stringify({
            machineId: machineId,
            ipAddress: entry.address,
            port: port,
          }),
        });
        this.logger_.info(`Notified: ${entry.address}:${port}`);
      }
    }
  }
}

exports.Server = Server;
