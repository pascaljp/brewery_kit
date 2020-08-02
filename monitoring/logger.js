const rp = require('request-promise');

// A class that sends data to pascal's private server.
class Logger {
  constructor() {}

  static notifyInkbirdApi(userId, address, temperature, humidity, battery) {
    if (address && temperature && humidity && battery) {
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
      });
    }
  }
}

exports.Logger = Logger;
