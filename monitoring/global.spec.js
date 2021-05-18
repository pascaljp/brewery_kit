const GLOBAL = require('./global').Global;

describe('Global', () => {
  test('fetchContent', async () => {
    const content = await GLOBAL.fetchContent('http://gpasc.al/');
  });
});
