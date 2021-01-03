const fetchMock = require('fetch-mock');

jest.mock('fs');
jest.mock('node-fetch');

const kSuccessUserId = 'successUserId';
const kFailureUserId = 'failureUserId';

const kSharedRequest = {
  url: 'https://brewery-app.com/api/inkbird/notify',
  method: 'GET',
  body: {
    // userId is needed when we use this template.
    deviceId: '00:00:00:00:00:00',
    temperature: 20,
    humidity: 60,
    battery: 90
  }
};

// Success case.
const successRequest = Object.assign(Object.assign({}, kSharedRequest));
successRequest.body.userId = kSuccessUserId;
fetchMock.getOnce(successRequest, 200, { overwriteRoutes: false });

// Failure case.
const failureRequest = Object.assign(Object.assign({}, kSharedRequest));
failureRequest.body.userId = kFailureUserId;
fetchMock.getOnce(failureRequest, 404, { overwriteRoutes: false });

const {Logger} = require('./logger');

describe('Logger', () => {
  beforeEach(() => {
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('Logger.SendSuccess', async () => {
    const logger = new Logger('/tmpdir');
    await logger.notifyInkbirdApi(1, kSuccessUserId, '00:00:00:00:00:00', 20, 60, 90);
    expect(require('fs').readdirSync('/tmpdir')).toHaveLength(0);
  });

  test('Logger.Fails', async () => {
    const logger = new Logger('/tmpdir');
    await logger.notifyInkbirdApi(1, kFailureUserId, '00:00:00:00:00:00', 20, 60, 90);
    expect(require('fs').readdirSync('/tmpdir')).toHaveLength(1);
  });
});
