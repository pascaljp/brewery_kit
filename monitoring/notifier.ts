import * as fs from 'fs';
import * as Log4js from 'log4js';
import AsyncLock from 'async-lock';
import * as Path from 'path';
import {Global} from './global';

const logger: Log4js.Logger = Log4js.getLogger();

interface InkbirdData {
  deviceId: string;
  unixtime: number;
  temperature: number;
  humidity: number;
  battery: number;
  probeType: number;
}

// A class that sends data to pascal's private server.
class Notifier {
  private tempDir_: string;
  private machineId_: string;
  private filePath_: string;
  private global_: typeof Global;
  private lock_: AsyncLock;
  private resending_: boolean;

  constructor(tmpdir: string, machineId: string, global: typeof Global) {
    this.tempDir_ = tmpdir;
    this.machineId_ = machineId;
    this.global_ = global;
    this.filePath_ = Path.join(this.tempDir_, '' + new Date().getTime());
    this.lock_ = new AsyncLock({timeout: 3000});
    this.resending_ = false;

    fs.mkdirSync(this.tempDir_, {recursive: true});
  }

  getFilePath(): string {
    return this.filePath_;
  }

  // Time consuming, but this task does not block anyting.
  async init(): Promise<void> {
    setInterval(() => {
      this.resendWholeData_();
    }, 10 * 60 * 1000);
    return this.resendWholeData_();
  }

  async notifyInkbirdApi(
    data: InkbirdData[],
    isBackfill: boolean
  ): Promise<string | void> {
    for (const entry of data) {
      if (
        entry.deviceId === undefined ||
        entry.unixtime === undefined ||
        entry.temperature === undefined ||
        entry.humidity === undefined ||
        entry.battery === undefined
      ) {
        throw new Error(
          `Required fields are not set: ${JSON.stringify(entry)}`
        );
      }
    }
    const params: {machineId: string; data: InkbirdData[]; backfill: boolean} =
      {
        machineId: this.machineId_,
        data: data,
        backfill: isBackfill,
      };

    return this.global_
      .fetchContent('https://brewery-app.com/api/client/saveInkbirdData', {
        method: 'POST',
        timeout: 5 * 1000,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(params),
      })
      .catch((e: Error) => {
        logger.error('Error in notifyInkbirdApi:', e.message);
        let promise = Promise.resolve();
        for (const entry of data) {
          promise = promise.then(() => this.saveToDisk_(entry));
        }
        return promise;
      });
  }

  async saveToDisk_(data: InkbirdData): Promise<void> {
    try {
      await this.lock_.acquire('disk_lock', () => {
        try {
          fs.appendFileSync(this.filePath_, JSON.stringify(data) + '\n');
          logger.warn('Logged to local file.');
          return;
        } catch (err) {
          logger.error('Failed to append to file:', JSON.stringify(data), err);
          throw new Error('Failed to append to file');
        }
      });
    } catch (err) {
      logger.error(
        'Failed to acquire lock:',
        err,
        JSON.stringify(data)
      );
      throw new Error('Failed to acquire lock');
    }
  }

  async resendWholeData_(): Promise<void> {
    if (this.resending_) {
      return;
    }
    this.resending_ = true;
    const files = fs.readdirSync(this.tempDir_, {withFileTypes: true});

    // New data will be stored to a new file.
    this.filePath_ = Path.join(this.tempDir_, '' + new Date().getTime());

    for (const file of files) {
      if (!file.isFile()) {
        continue;
      }
      const fullPath = Path.join(this.tempDir_, file.name);
      const entries = fs.readFileSync(fullPath, {encoding: 'utf8'}).split('\n');
      const fd = fs.openSync(fullPath, 'r+');
      let position = 0;
      let length = 0;
      const buffer: InkbirdData[] = [];
      for (const entry of entries) {
        if (/\S/.test(entry)) {
          try {
            buffer.push(JSON.parse(entry));
          } catch (e) {}
          if (buffer.length >= 100) {
            await this.notifyInkbirdApi(buffer, true);
            fs.writeSync(fd, ' '.repeat(length - 1), position);
            position += length;
            length = 0;
            buffer.splice(0);
          }
        }
        length += entry.length + '\n'.length;
      }
      if (buffer.length) {
        await this.notifyInkbirdApi(buffer, true);
      }
      fs.closeSync(fd);
      fs.unlinkSync(fullPath);
    }
    this.resending_ = false;
  }
}

export {Notifier};
