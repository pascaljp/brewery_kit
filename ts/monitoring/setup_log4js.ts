import * as os from 'os';
import * as path from 'path';
import * as Log4js from 'log4js';
import {DateTime} from 'luxon';

Log4js.addLayout('with_filename', (/*config*/) => {
  return (logEvent: Log4js.LoggingEvent) => {
    const level: string = logEvent.level.levelStr[0] || '?';
    const time: string = DateTime.fromJSDate(logEvent.startTime).setZone('Asia/Tokyo').toFormat('yyyyMMdd HHmmss.SSS');
    const path: string = logEvent.fileName || 'unknown';
    const file: string = path.substr(
      path.indexOf('brewery_kit') + 'brewery_kit/'.length
    );
    return `${level}${time}] ${file} ${logEvent.data}`;
  };
});

Log4js.configure({
  appenders: {
    out: {type: 'stdout', layout: {type: 'with_filename'}},
    err: {
      type: 'file',
      filename: path.join(os.homedir(), '.inkbird', 'error.log'),
      pattern: '-yyyyMMdd',
      backups: 366,
      layout: {type: 'with_filename'},
    },
  },
  categories: {
    default: {appenders: ['out'], level: 'all', enableCallStack: true},
    ibs_th1: {appenders: ['out', 'err'], level: 'warn', enableCallStack: true},
  },
});

const logger: Log4js.Logger = Log4js.getLogger();

export {logger};
