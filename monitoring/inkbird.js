'use strict';
const IBS_TH1 = require('ibs_th1');
const {execSync} = require('child_process');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const log4js = require('log4js');
const {Logger} = require('./logger');
const {Server} = require('./server');

const optionDefinitions = [
  {
    name: 'tmpdir',
    type: String,
    defaultValue: '/tmp/var/data/inkbird'
  },
  {
    name: 'config',
    type: String,
    defaultValue: '/mnt/inkbird/config.json'
  }
];
const options = commandLineArgs(optionDefinitions);

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
const notifier = new Logger(options.tmpdir);

// Reboot the machine if there is no data in the past 5 minutes.
const watchdogId = setTimeout(() => {
  logger.error('Seems like inkbird process is not working properly.');
  logger.error('Rebooting the machine...');
  try {
    const stdout = execSync('/sbin/reboot');
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
      await notifier.notifyInkbirdApi(
        Math.floor(new Date().getTime() / 1000), machineId, data.address, data.temperature, data.humidity, data.battery);
      watchdogId.refresh();
    } catch (e) {
      // TODO: Save to a file and send to the server later.
      logger.error(e.error);
    }
  };
};

const getConfig = () => {
  return JSON.parse(fs.readFileSync(options.config, 'UTF-8'));
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
