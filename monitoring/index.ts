'use strict';

import {IBS_TH1, RealtimeData} from 'ibs_th1';
import {logger} from './setup_log4js';
import moment from 'moment-timezone';

import {Watchdog} from './watchdog';
import {Server} from './server/main';
import * as InkbirdConfig from './server/config';
import {BreweryKitApi} from '@pascaljp/brewery-kit-api';

const MONITORING_FREQUENCY: number = 60; // Once in every 60 seconds.

class Inkbird {
  static run() {
    // Exit the program if watchdog.refresh() is not called for 5 minutes.
    const watchdog: Watchdog = new Watchdog(/*seconds=*/ 300);
    watchdog.run();

    // device ID to unixtime.
    const lastNotifyTimes: Map<string, number> = new Map<string, number>();
    function createCallback(api: BreweryKitApi/* notifier: Notifier*/): (data: RealtimeData) => Promise<void> {
      return async (data: RealtimeData): Promise<void> => {
        const currentUnixtime: number = moment().unix();
        const lastNotifyTime = lastNotifyTimes.get(data.address);
        if (
          lastNotifyTime &&
          Math.floor(lastNotifyTime / MONITORING_FREQUENCY) ==
            Math.floor(currentUnixtime / MONITORING_FREQUENCY)
        ) {
          return;
        }
        logger.trace(
          data.address,
          data.temperature,
          data.humidity,
          data.probeType,
          data.battery
        );
        lastNotifyTimes.set(data.address, currentUnixtime);

        try {
          await api.saveInkbirdData(
            [
              {
                deviceId: data.address,
                unixtime: currentUnixtime,
                temperature: data.temperature,
                humidity: data.humidity,
                battery: data.battery,
              },
            ],
            false
          );
          watchdog.refresh();
        } catch (e) {
          logger.error('Error in notifier.notifyInkbirdApi:', e);
        }
      };
    }

    const config: InkbirdConfig.ConfigType = InkbirdConfig.getConfig();
    logger.mark(`Machine ID: ${config.machineId}`);

    const api: BreweryKitApi = new BreweryKitApi(config.dataDir, config.machineId);
    api.startBackgroundTask(() => { logger.info('Saved') });

    // Server needs to start up after config file is created.
    const server: Server = new Server();
    server.start();

    // Subscribe inkbird signals.
    logger.mark('Inkbird monitoring program has started.');
    const device = new IBS_TH1();
    device.subscribeRealtimeData(createCallback(api/*notifier*/));
  }
}

Inkbird.run();
