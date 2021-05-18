'use strict';
const IBS_TH1 = require('ibs_th1');
// import execSync from 'child_process';
import Log4js from 'log4js';
import moment from 'moment-timezone';

import { Notifier } from './notifier';
import { Server } from './server/main';
import * as InkbirdConfig from './shared/config';
import { Global } from './global';

const MONITORING_FREQUENCY: number = 60;  // Once in every 60 seconds.

Log4js.addLayout('with_filename', (/*config*/) => {
  return (logEvent: any /*Log4js.LoggingEvent*/) => {
    const level: string = logEvent.level.levelStr[0];
    const time: string = moment(logEvent.startTime).tz('Asia/Tokyo').format('YYYYMMDD HHmmss.SSS');
    const path: string = logEvent.fileName;
    const file: string = path.substr(path.indexOf('brewery_kit') + 'brewery_kit/'.length);
    return `${level}${time}] ${file} ${logEvent.data}`;
  };
});

Log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: { type: 'with_filename' } },
    err: {
      type: 'file',
      filename: 'error.log',
      pattern: '-yyyyMMdd',
      backups: 366,
      layout: { type: 'with_filename' },
    },
  },
  categories: {
    default: { appenders: ['out'], level: 'all', enableCallStack: true },
    ibs_th1: { appenders: ['out', 'err'], level: 'warn', enableCallStack: true },
  },
});
const logger: Log4js.Logger = Log4js.getLogger();

class Inkbird {
  static run() {
    // Reboot the machine if there is no data in the past 5 minutes.
    const watchdogId: NodeJS.Timer = setTimeout(() => {
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
    const lastNotifyTimes: Map<string, number> = new Map<string, number>();
    function createCallback(notifier: Notifier): (data: any) => Promise<void> {
      return async (data: any) => {
        const currentUnixtime: number = moment().unix();
        const lastNotifyTime = lastNotifyTimes.get(data.address);
        if (lastNotifyTime && Math.floor(lastNotifyTime / MONITORING_FREQUENCY) == Math.floor(currentUnixtime / MONITORING_FREQUENCY)) {
          return;
        }
        logger.trace(
          data.address, data.date, data.temperature, data.humidity,
          data.probeType, data.battery);
        lastNotifyTimes.set(data.address, currentUnixtime);

        try {
          await notifier.notifyInkbirdApi([{
            deviceId: data.address,
            unixtime: currentUnixtime,
            temperature: data.temperature,
            humidity: data.humidity,
            battery: data.battery,
            probeType: data.probeType,
          }], false);
          watchdogId.refresh();
        } catch (e) {
          logger.error('Error in notifier.notifyInkbirdApi:', e);
        }
      };
    }

    const config: InkbirdConfig.ConfigType = InkbirdConfig.getConfig();
    logger.mark(`Machine ID: ${config.machineId}`);

    const notifier: Notifier = new Notifier(config.dataDir, config.machineId, Global);
    notifier.init();

    // Server needs to start up after config file is created.
    const server: Server = new Server();
    server.start();

    // Subscribe inkbird signals.
    logger.mark('Inkbird monitoring program has started.');
    const device = new IBS_TH1();
    device.subscribeRealtimeData(createCallback(notifier));
  }
}

Inkbird.run();
