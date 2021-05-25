import path from 'path';
import sinon from 'sinon';
import {Global as GLOBAL} from './global';

jest.mock('fs');

import fs from 'fs';

import {Notifier} from './notifier';

const paramHasUnixtime = (unixtime: number) => {
  return sinon.match((params) => {
    const body = JSON.parse(params.body);
    return body['data'][0]['unixtime'] == unixtime;
  });
};

describe('Notifier', () => {
  const dirName = '/memfs';
  let fetchStub: any;

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

    const notifier = new Notifier(dirName, 'machineId', GLOBAL);
    await notifier.init();
    await notifier.notifyInkbirdApi(
      [
        {
          deviceId: '00:00:00:00:00:00',
          unixtime: 1,
          temperature: 20,
          humidity: 60,
          battery: 90,
          probeType: 1,
        },
      ],
      false
    );
    expect(fs.readdirSync(dirName)).toHaveLength(0);
  });

  test('Fails', async () => {
    fetchStub.onCall(0).rejects();
    fetchStub.onCall(1).resolves('OK');

    const notifier = new Notifier(dirName, 'macineId', GLOBAL);
    await notifier.init();
    await notifier.notifyInkbirdApi(
      [
        {
          deviceId: '00:00:00:00:00:00',
          unixtime: 1,
          temperature: 20,
          humidity: 60,
          battery: 90,
          probeType: 1,
        },
      ],
      false
    );
    await notifier.notifyInkbirdApi(
      [
        {
          unixtime: 1,
          deviceId: '00:00:00:00:00:00',
          temperature: 19,
          humidity: 60,
          battery: 90,
          probeType: 1,
        },
      ],
      false
    );

    // The data is stored on the disk.
    expect(fs.readdirSync(dirName)).toHaveLength(1);
    const content = fs.readFileSync(notifier.getFilePath(), 'utf-8');
    expect(content).toBe(
      '{"deviceId":"00:00:00:00:00:00","unixtime":1,"temperature":20,"humidity":60,"battery":90,"probeType":1}\n'
    );
  });

  test('Backfill', async () => {
    fetchStub.onCall(0).resolves('OK');

    fs.mkdirSync(dirName, {recursive: true});
    fs.writeFileSync(
      path.join(dirName, 'records'),
      JSON.stringify({
        unixtime: 1,
        deviceId: '00:00:00:00:00:00',
        temperature: 20,
        humidity: 60,
        battery: 90,
        probeType: 1,
      }) + '\n'
    );
    const notifier = new Notifier(dirName, 'failureMachineId', GLOBAL);
    await notifier.init();

    // All logs are commited on startup.
    expect(fs.readdirSync(dirName)).toHaveLength(0);
  });

  test('BackfillFromBrokenFile', async () => {
    fetchStub
      .withArgs(sinon.match.string, paramHasUnixtime(12345))
      .onCall(0)
      .resolves('OK');

    fs.mkdirSync(dirName, {recursive: true});
    fs.writeFileSync(
      path.join(dirName, 'records'),
      '@@@@@@' +
        '\n' +
        JSON.stringify({
          unixtime: 12345,
          deviceId: '00:00:00:00:00:00',
          temperature: 20,
          humidity: 60,
          battery: 90,
          probeType: 1,
        }) +
        '\n'
    );
    const notifier = new Notifier(dirName, 'failureMachineId', GLOBAL);
    await notifier.init();

    // All logs are commited on startup.
    expect(fs.readdirSync(dirName)).toHaveLength(0);
    expect(fetchStub.callCount).toBe(1);
  });
});
