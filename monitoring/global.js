const nodeFetch = require('node-fetch');

class Global {
  constructor() {}

  static async fetchContent() {
    return nodeFetch.apply({}, arguments).then(response => {
      if (!response.ok) {
        throw new Error('Response is not OK');
      }
      return response.text();
    });
  }
}

exports.Global = Global;
