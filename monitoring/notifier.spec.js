const fetchMock = require('fetch-mock');

jest.mock('fs');
jest.mock('node-fetch');

const kSuccessMachineId = 'successMachineId';
const kFailureMachineId = 'failureMachineId';

const buildRequest = (machineId) => {
  return {
    url: new RegExp(`https://brewery-app.com/api/inkbird/notify\?.*machineId=${machineId}`),
    method: 'GET',
  };
}

// Success case.
const successRequest = buildRequest(kSuccessMachineId);
fetchMock.getOnce(successRequest, 200, { overwriteRoutes: false });

// Failure case. Fails for the first attempt, and retry succeeds.
const failureRequest = buildRequest(kFailureMachineId);
fetchMock.getOnce(failureRequest, 404, { overwriteRoutes: false });
fetchMock.getOnce(failureRequest, 200, { overwriteRoutes: false });

const {Notifier} = require('./notifier');

describe('Notifier', () => {
  beforeEach(() => {
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('SendSuccess', async () => {
    const logger = new Notifier('/tmpdir');
    await logger.init();
    await logger.notifyInkbirdApi(1, kSuccessMachineId, '00:00:00:00:00:00', 20, 60, 90);
    expect(require('fs').readdirSync('/tmpdir')).toHaveLength(0);
  });

  test('Fails', async () => {
    const logger = new Notifier('/tmpdir');
    await logger.init();
    await logger.notifyInkbirdApi(1, kFailureMachineId, '00:00:00:00:00:00', 20, 60, 90);
    // The data is stored on the disk.
    expect(require('fs').readdirSync('/tmpdir')).toHaveLength(1);

    const logger2 = new Notifier('/tmpdir');
    await logger2.init();
    // All logs are commited on startup.
    expect(require('fs').readdirSync('/tmpdir')).toHaveLength(0);
  });
});
