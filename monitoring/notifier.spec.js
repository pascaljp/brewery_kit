const path = require('path');
const sinon = require('sinon');
const GLOBAL = require('./global').Global;
jest.mock('fs');

const fs = require('fs');

const {Notifier} = require('./notifier');

const urlHasUnixtime = unixtime => {
  return sinon.match(value => {
    return value.search(`unixtime=${unixtime}`) != -1;
  });
};

describe('Notifier', () => {
  const dirName = '/memfs';
  let fetchStub;

  beforeAll(() => {});

  beforeEach(() => {
    fetchStub = sinon.stub(GLOBAL, 'fetchContent');
  });

  afterEach(() => {
    sinon.restore();
    fs.rmdirSync(dirName, {recursive: true});
  });

  test('SendSuccess', async () => {
    fetchStub.onCall(0).resolves('OK');

    const notifier = new Notifier(dirName, GLOBAL);
    await notifier.init();
    await notifier.notifyInkbirdApi(1, 'machineId', '00:00:00:00:00:00', 20, 60, 90);
    expect(fs.readdirSync(dirName)).toHaveLength(0);
  });

  test('Fails', async () => {
    fetchStub.onCall(0).rejects();
    fetchStub.onCall(1).resolves('OK');

    const notifier = new Notifier(dirName, GLOBAL);
    await notifier.init();
    await notifier.notifyInkbirdApi(1, 'machineId', '00:00:00:00:00:00', 20, 60, 90);
    await notifier.notifyInkbirdApi(1, 'machineId', '00:00:00:00:00:00', 19, 60, 90);

    // The data is stored on the disk.
    expect(fs.readdirSync(dirName)).toHaveLength(1);
    const content = fs.readFileSync(notifier.getFilePath(), 'utf-8');
    expect(content).toBe('{"unixtime":1,"machineId":"machineId","address":"00:00:00:00:00:00","temperature":20,"humidity":60,"battery":90}\n');
  });

  test('Backfill', async () => {
    fetchStub.onCall(0).resolves('OK');

    fs.mkdirSync(dirName, {recursive: true});
    fs.writeFileSync(
      path.join(dirName, 'records'),
      JSON.stringify({
        "unixtime": 1,
        "machineId": "failureMachineId",
        "address": "00:00:00:00:00:00",
        "temperature": 20,
        "humidity": 60,
        "battery": 90,
      }) + '\n');
    const notifier = new Notifier(dirName, GLOBAL);
    await notifier.init();

    // All logs are commited on startup.
    expect(fs.readdirSync(dirName)).toHaveLength(0);
  });

  test('BackfillFromBrokenFile', async () => {
    fetchStub.withArgs(urlHasUnixtime(12345), sinon.match.object).onCall(0).resolves('OK');

    fs.mkdirSync(dirName, {recursive: true});
    fs.writeFileSync(
      path.join(dirName, 'records'),
      '@@@@@@' + '\n' +
      JSON.stringify({
        "unixtime": 12345,
        "machineId": "failureMachineId",
        "address": "00:00:00:00:00:00",
        "temperature": 20,
        "humidity": 60,
        "battery": 90,
      }) + '\n');
    const notifier = new Notifier(dirName, GLOBAL);
    await notifier.init();

    // All logs are commited on startup.
    expect(fs.readdirSync(dirName)).toHaveLength(0);
    expect(fetchStub.callCount).toBe(1);
  });
});
