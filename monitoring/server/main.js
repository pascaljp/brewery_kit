// How to authenticate users:
// 1. monitoring program uploads machineId to a server.
// 2. user accesses the server, and get an IP address of the monitoring program.
// 3. user accesses the monitoring program to get the machineID.
// 4. user sends the machineId to the server.
// 5. now the server knows the user has an access to the machine.

const express = require('express');
const fetch = require('node-fetch');
const log4js = require('log4js');
const os = require('os');
const getConfig = require('../config').getConfig;

class Server {
  constructor() {
    this.logger_ = log4js.getLogger('server');
    this.app_ = express();
    this.server_ = null;
    this.machineId_ = getConfig().machineId;

    this.app_.get('/', (req, res) => { res.send('OK'); });
    this.app_.get('/getMachineId', this.getMachineId_.bind(this));
  }

  start() {
    this.logger_.mark('Starting up a server...');
    this.server_ = this.app_.listen(0, () => {
      this.logger_.info('Server started.');
      this.notifyLocalIpAddress_(this.machineId_);
    });
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

  getMachineId_(req, res, next) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', 'https://brewery-app.com');
    res.header('Access-Control-Allow-Origin', 'http://brewery-app.com');
    try {
      res.json({status: 'ok', machineId: this.machineId_});
    } catch (e) {
      res.json({status: 'error', error: e});
    }
  }

}

exports.Server = Server;
