const fs = require('fs');
const log4js = require('log4js');
const AsyncLock = require('async-lock');
const Path = require('path');

const logger = log4js.getLogger();

// A class that sends data to pascal's private server.
class Notifier {
  constructor(tmpdir, machineId, global) {
    this.tempDir_ = tmpdir;
    this.machineId_ = machineId;
    this.global_ = global;
    this.filePath_ = Path.join(this.tempDir_, '' + new Date().getTime());
    this.lock_ = new AsyncLock({ timeout: 3000 });
    this.resending_ = false;

    fs.mkdirSync(this.tempDir_, {recursive: true});
  }

  getFilePath() {
    return this.filePath_;
  }

  // Time consuming, but this task does not block anyting.
  async init() {
    setInterval(() => {this.resendWholeData_();}, 10 * 60 * 1000);
    return this.resendWholeData_();
  }

  async notifyInkbirdApi(unixtime, address, temperature, humidity, battery, isBackfill) {
    if (unixtime === undefined || address === undefined || temperature === undefined || humidity === undefined || battery === undefined) {
      throw new Error(`Required fields are not set ${unixtime}, ${address}, ${temperature}, ${humidity}, ${battery}`);
    }
    const params = {
      machineId: this.machineId_,
      deviceId: address,
      data: [{
        deviceId: address,
        unixtime: unixtime,
        temperature: temperature,
        humidity: humidity,
        battery: battery,
      }],
    };
    if (isBackfill) {
      params['backfill'] = 'true';
    }

    return this.global_.fetchContent('https://brewery-app.com/api/client/saveInkbirdData', {
      method: 'POST',
      timeout: 5 * 1000,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params),
    }).catch(e => {
      logger.error('Error in notifyInkbirdApi:', e);
      return this.saveToDisk_({unixtime, address, temperature, humidity, battery});
    });
  }

  async saveToDisk_(data) {
    return new Promise((resolve, reject) => {
      this.lock_.acquire('disk_lock', () => {
        try {
          fs.appendFileSync(this.filePath_, JSON.stringify(data) + '\n');
          logger.warn('Logged to local file.');
          resolve();
          return;
        } catch (err) {
          logger.error('Failed to append to file:', JSON.stringify(data), err);
          reject();
          return;
        }
      }, (err, ret) => {
        if (err) {
          logger.error('Failed to acquire lock:', err.message, JSON.stringify(data));
          reject();
          return;
        }
        resolve();
      });
    });
  }

  async resendWholeData_() {
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
      for (const entry of entries) {
        if (/\S/.test(entry)) {
          let data = null;
          try {
            data = JSON.parse(entry);
          } catch (e) {
          }
          if (data) {
            await this.notifyInkbirdApi(
              data.unixtime, data.address, data.temperature, data.humidity, data.battery, true);
            fs.writeSync(fd, ' '.repeat(entry.length), position);
          }
        }
        position += entry.length + '\n'.length;
      }
      fs.closeSync(fd);
      fs.unlinkSync(fullPath);
    }
    this.resending_ = false;
  }
}

exports.Notifier = Notifier;
