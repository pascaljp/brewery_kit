import * as Log4js from 'log4js';

const logger: Log4js.Logger = Log4js.getLogger();

class Watchdog {
  private timeout_sec_: number;
  private watchdogId_: NodeJS.Timer | null;

  constructor(timeout_sec: number) {
    this.timeout_sec_ = timeout_sec;
    this.watchdogId_ = null;
  }

  run() {
    this.watchdogId_ = setTimeout(() => {
      logger.error('Seems like inkbird process is not working properly.');
      logger.error('Exiting the program...');
      process.exit(1);
    }, this.timeout_sec_ * 1000);
    // The watchdog does not prevent the program to terminate.
    this.watchdogId_.unref();
  }

  refresh() {
    if (!this.watchdogId_) {
      logger.error('Watchdog needs to be started.');
      return;
    }
    this.watchdogId_.refresh();
  }
}

export {Watchdog};
