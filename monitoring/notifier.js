const fs = require('fs');
const log4js = require('log4js');
const fetch = require('node-fetch');
const AsyncLock = require('async-lock');
const Path = require('path');

const logger = log4js.getLogger('notifier');

// A class that sends data to pascal's private server.
class Notifier {
  constructor(tmpdir) {
    this.tempDir_ = tmpdir;
    this.filePath_ = Path.join(this.tempDir_, '' + new Date().getTime());
    this.lock_ = new AsyncLock({ timeout: 3000 });

    fs.mkdirSync(this.tempDir_, {recursive: true});
  }

  // Time consuming, but this task does not block anyting.
  async init() {
    await this.resendWholeData_();
  }

  async notifyInkbirdApi(unixtime, machineId, address, temperature, humidity, battery, isBackfill) {
    if (!(unixtime && address && temperature && humidity && battery)) {
      throw new Error(`Required fields are not set ${unixtime}, ${address}, ${temperature}, ${humidity}, ${battery}`);
    }
    const params = {
      unixtime: unixtime,
      machineId: machineId,
      deviceId: address,
      temperature: '' + temperature,
      humidity: '' + humidity,
      battery: '' + battery,
    };
    if (isBackfill) {
      params['backfill'] = 'true';
    }

    const paramStr = new URLSearchParams(params);
    return fetch(`https://brewery-app.com/api/inkbird/notify?${paramStr}`, {
      method: 'GET',
      timeout: 5 * 1000
    }).then(response => {
      if (!response.ok) {
        throw new Error('Response is not OK');
      }
      return response.body;
    }).catch((e) => {
      logger.error('Error in notifyInkbirdApi:', e);
      this.saveToDisk_({unixtime, machineId, address, temperature, humidity, battery});
    });
  }

  async saveToDisk_(data) {
    await this.lock_.acquire('disk_lock', () => {
      try {
        fs.appendFileSync(this.filePath_, JSON.stringify(data) + '\n');
        logger.warn('Logged to local file.');
      } catch (err) {
        logger.error('Failed to append to file:', JSON.stringify(data), err);
      };
    }, (err, ret) => {
      if (err) {
        logger.error('Failed to acquire lock:', err.message, JSON.stringify(data));
      }
    });
  }

  async resendWholeData_() {
    const files = fs.readdirSync(this.tempDir_, {withFileTypes: true});
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
          const data = JSON.parse(entry);
          const machineId = data.userId || data.machineId;
          await this.notifyInkbirdApi(data.unixtime, machineId, data.address, data.temperature, data.humidity, data.battery, true);
          fs.writeSync(fd, ' '.repeat(entry.length), position);
        }
        position += entry.length + '\n'.length;
      }
      fs.closeSync(fd);
      fs.unlinkSync(fullPath);
    }
  }
}

exports.Notifier = Notifier;
