// How to authenticate users:
// 1. monitoring program uploads machineId to a server.
// 2. user accesses the server, and get an IP address of the monitoring program.
// 3. user accesses the monitoring program to get the machineID.
// 4. user sends the machineId to the server.
// 5. now the server knows the user has an access to the machine.

import express from 'express';
import fetch from 'node-fetch';
import * as http from 'http';
import * as Log4js from 'log4js';
import * as os from 'os';
import * as net from 'net';

import * as InkbirdConfig from './config';

const logger = Log4js.getLogger();

class Server {
  private app_: express.Application;
  private server_: http.Server | null;
  private machineId_: string;

  constructor() {
    this.app_ = express();
    this.server_ = null;
    this.machineId_ = InkbirdConfig.getConfig().machineId;

    this.app_.get('/', (_req: any, res: { send: (arg0: string) => void; }) => { res.send('OK'); });
    this.app_.get('/getMachineId', this.getMachineId_.bind(this));
  }

  start(): void {
    logger.mark('Starting up a server...');
    this.server_ = this.app_.listen(0, () => {
      logger.info('Server started.');
      this.notifyLocalIpAddress_(this.machineId_);
    });
  }

  async notifyLocalIpAddress_(machineId: string): Promise<void> {
    if (!this.server_) {
      return;
    }
    const address: net.AddressInfo | string | null = this.server_.address();
    if (!address || typeof address === 'string') {
      return;      
    }
    const port: number = address.port;

    const interfaces = os.networkInterfaces();
    for (const [, entries] of Object.entries(interfaces)) {
      if (!Array.isArray(entries)) {
        continue;
      }
      for (const entry of entries) {
        if (entry.family != 'IPv4') {
          continue;
        }
        if (entry.internal) {
          continue;
        }

        await fetch('https://brewery-app.com/api/client/saveIpAddress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify({
            machineId: machineId,
            ipAddress: entry.address,
            port: port,
          }),
        });
        logger.info(`Notified: ${entry.address}:${port}`);
      }
    }
  }

  getMachineId_(_req: express.Request, res: express.Response) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', 'https://brewery-app.com');
    res.header('Access-Control-Allow-Origin', 'http://brewery-app.com');
    res.json({ status: 'ok', machineId: this.machineId_ });
  }
}

export {Server};
