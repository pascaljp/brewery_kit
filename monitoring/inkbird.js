'use strict';
const IBS_TH1 = require('ibs_th1');
const execSync = require('child_process').execSync;
const fs = require('fs');
const log4js = require('log4js');

const Notifier = require('./notifier').Notifier;
const Server = require('./server/main').Server;
const getConfig = require('./config').getConfig;

log4js.configure({
  appenders: {
    out: {type: 'stdout', layout: {type: 'basic'}},
    // err: {type: 'stderr', layout: {type: 'basic'}, level: 'warning'},
  },
  categories: {
    default: {appenders: ['out'], level: 'warn'},
    ibs_th1: {appenders: ['out', 'err'], level: 'error'},
    inkbird: {appenders: ['out', 'err'], level: 'info'},
    server: {appenders: ['out', 'err'], level: 'info'},
    notifier: {appenders: ['out', 'err'], level: 'info'},
  },
});
const logger = log4js.getLogger('inkbird');

// Reboot the machine if there is no data in the past 5 minutes.
const watchdogId = setTimeout(() => {
  logger.error('Seems like inkbird process is not working properly.');
  logger.error('Rebooting the machine...');
  try {
    // const stdout = execSync('/sbin/reboot');
    // logger.mark('Reboot command succeeded... Rebooting...');
    // logger.mark(stdout);
    process.exit(1);
  } catch (e) {
    logger.error('Failed to reboot the machine.');
    logger.error(e);
  }
}, 300 * 1000);
// The watchdog does not prevent the program to terminate.
watchdogId.unref();

// device ID to unixtime.
const lastNotifyTime = {};
const createCallback = (notifier, machineId) => {
  return async (data) => {
    const currentUnixtime = Math.floor(new Date().getTime() / 1000);
    if (lastNotifyTime[data.address] && parseInt(lastNotifyTime[data.address] / 10) == parseInt(currentUnixtime / 10)) {
      return;
    }
    logger.trace(
        data.address, data.date, data.temperature, data.humidity,
        data.probeType, data.battery);
    lastNotifyTime[data.address] = currentUnixtime;

    try {
      await notifier.notifyInkbirdApi(
        currentUnixtime, machineId, data.address, data.temperature, data.humidity, data.battery);
      watchdogId.refresh();
    } catch (e) {
      logger.error('Error in notifier.notifyInkbirdApi:', e);
    }
  };
};

const config = getConfig();
logger.mark(`Machine ID: ${config.machineId}`);

const notifier = new Notifier(config.dataDir);
notifier.init();

// Server needs to start up after config file is created.
const server = new Server();
server.start();

// Subscribe inkbird signals.
logger.mark('Inkbird monitoring program has started.');
const device = new IBS_TH1();
device.subscribeRealtimeData(createCallback(notifier, config.machineId));
