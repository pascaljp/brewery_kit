'use strict';
const IBS_TH1 = require('ibs_th1');
const {execSync} = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const log4js = require('log4js');
const path = require('path');
const {Logger} = require('./logger');
const {Server} = require('./server');

log4js.configure({
  appenders: {
    out: {type: 'stdout', layout: {type: 'basic'}},
    err: {type: 'stderr', layout: {type: 'basic'}, level: 'warning'},
  },
  categories: {
    default: {appenders: ['out'], level: 'all'},
    ibs_th1: {appenders: ['out', 'err'], level: 'error'},
    inkbird: {appenders: ['out', 'err'], level: 'trace'},
    server: {appenders: ['out', 'err'], level: 'info'},
  },
});
const logger = log4js.getLogger('inkbird');

// Reboot the machine if there is no data in the past 5 minutes.
const watchdogId = setTimeout(() => {
  logger.error('Seems like inkbird process is not working properly.');
  logger.error('Rebooting the machine...');
  try {
    const stdout = execSync('/usr/sbin/reboot');
    logger.mark('Reboot command succeeded... Rebooting...');
    logger.mark(stdout);
    process.exit(1);
  } catch (e) {
    logger.error('Failed to reboot the machine.');
    logger.error(e);
  }
}, 300 * 1000);
// The watchdog does not prevent the program to terminate.
watchdogId.unref();

const createCallback = (machineId) => {
  return async (data) => {
    logger.trace(
        data.address, data.date, data.temperature, data.humidity,
        data.probeType, data.battery);
    try {
      await Logger.notifyInkbirdApi(
          machineId, data.address, data.temperature, data.humidity, data.battery);
      watchdogId.refresh();
    } catch (e) {
      // TODO: Save to a file and send to the server later.
      logger.error(e.error);
    }
  };
};

const getConfig = () => {
  const configFilePath = path.join(__dirname, 'config.json');
  try {
    return JSON.parse(
        fs.readFileSync(configFilePath, 'UTF-8'));
  } catch (e) {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const machineId = 'random-' +
          Array.from(crypto.randomFillSync(new Uint8Array(16)))
              .map((n) => S[n % S.length]).join('');
    const config = {machineId: machineId};
    fs.writeFileSync(configFilePath, JSON.stringify(config));
    return config;
  }
};

const config = getConfig();
logger.mark(`Machine ID: ${config.machineId}`);

// Server needs to start up after config file is created.
const server = new Server();
server.start();

// Subscribe inkbird signals.
logger.mark('Inkbird monitoring program has started.');
const device = new IBS_TH1();
device.subscribeRealtimeData(createCallback(config.machineId));
