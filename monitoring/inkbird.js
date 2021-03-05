'use strict';
const IBS_TH1 = require('ibs_th1');
const execSync = require('child_process').execSync;
const fs = require('fs');
const log4js = require('log4js');
const moment = require('moment-timezone');

const Notifier = require('./notifier').Notifier;
const Server = require('./server/main').Server;
const getConfig = require('./config').getConfig;
const GLOBAL = require('./global').Global;

const MONITORING_FREQUENCY = 60;  // Once in every 60 seconds.

log4js.addLayout('with_filename', function(config) {
  return function(logEvent) {
    const level = logEvent.level.levelStr[0];
    const time = moment(logEvent.startTime).tz('Asia/Tokyo').format('YYYYMMDD HHmmss.SSS');
    const path = logEvent.fileName;
    const file = path.substr(path.indexOf('brewery_kit') + 'brewery_kit/'.length);
    return `${level}${time}] ${file}:${logEvent.lineNumber} ${logEvent.data}`;
  }
});

log4js.configure({
  appenders: {
    out: {type: 'stdout', layout: {type: 'with_filename'}},
    err: {
      type: 'file',
      filename: 'error.log',
      pattern:  '-yyyyMMdd',
      backups: 366,
      layout: {type: 'with_filename'},
    },
  },
  categories: {
    default: {appenders: ['out'], level: 'all', enableCallStack: true},
    ibs_th1: {appenders: ['out', 'err'], level: 'warn', enableCallStack: true},
  },
});
const logger = log4js.getLogger();

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
    if (lastNotifyTime[data.address] && parseInt(lastNotifyTime[data.address] / MONITORING_FREQUENCY) == parseInt(currentUnixtime / MONITORING_FREQUENCY)) {
      return;
    }
    logger.trace(
        data.address, data.date, data.temperature, data.humidity,
        data.probeType, data.battery);
    lastNotifyTime[data.address] = currentUnixtime;

    try {
      await notifier.notifyInkbirdApi(
        currentUnixtime, data.address, data.temperature, data.humidity, data.battery, false);
      watchdogId.refresh();
    } catch (e) {
      logger.error('Error in notifier.notifyInkbirdApi:', e);
    }
  };
};

const config = getConfig();
logger.mark(`Machine ID: ${config.machineId}`);

const notifier = new Notifier(config.dataDir, config.machineId, GLOBAL);
notifier.init();

// Server needs to start up after config file is created.
const server = new Server();
server.start();

// Subscribe inkbird signals.
logger.mark('Inkbird monitoring program has started.');
const device = new IBS_TH1();
device.subscribeRealtimeData(createCallback(notifier, config.machineId));


