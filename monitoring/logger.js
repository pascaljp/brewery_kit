const fs = require('fs');
const log4js = require('log4js');
const rp = require('request-promise');
const AsyncLock = require('async-lock');
const Path = require('path');

const logger = log4js.getLogger('logger');

// A class that sends data to pascal's private server.
class Logger {
  constructor(tmpdir) {
    console.log(tmpdir);
    this.tempDir_ = tmpdir;
    fs.mkdirSync(this.tempDir_, {recursive: true});
    this.filePath_ = Path.join(this.tempDir_, '' + new Date().getTime());

    this.lock_ = new AsyncLock({ timeout: 3000 });

    this.resendWholeData_();
  }

  async notifyInkbirdApi(unixtime, userId, address, temperature, humidity, battery) {
    if (unixtime && address && temperature && humidity && battery) {
      return rp({
        uri: 'https://brewery-app.com/api/inkbird/notify',
        qs: {
          userId: userId,
          deviceId: address,
          temperature: temperature,
          humidity: humidity,
          battery: battery,
        },
        timeout: 5 * 1000,
      }).catch(() => {
        this.saveToDisk_({unixtime, userId, address, temperature, humidity, battery});
      });
    }
  }

  async saveToDisk_(data) {
    await this.lock_.acquire('disk_lock', () => {
      fs.appendFileSync(this.filePath_, JSON.stringify(data) + '\n', (err) => {
        if (err) {
          logger.error('Failed to append to file:', JSON.stringify(data));
          return;
        }
        logger.warning('Logged to local file.');
      });
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
      const entries = fs.readFileSync(Path.join(this.tempDir_, file.name), {encoding: 'utf8'}).split('\n');
      const fd = fs.openSync(Path.join(this.tempDir_, file.name), 'r+');
      let position = 0;
      for (const entry of entries) {
        if (/\S/.test(entry)) {
          const data = JSON.parse(entry);
          await this.notifyInkbirdApi(data.unixtime, data.userId, data.address, data.temperature, data.humidity, data.battery);
          fs.writeSync(fd, ' '.repeat(entry.length), position);
        }
        position += entry.length + '\n'.length;
      }
      fs.close(fd);
      fs.unlinkSync(Path.join(this.tempDir_, file.name));
    }
  }
}

exports.Logger = Logger;
