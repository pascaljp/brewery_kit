'use strict';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';

interface ConfigType {
  machineId: string;
  dataDir: string;
}

const createMachineId: () => string = () => {
  const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return (
    'machine-' +
    Array.from(crypto.randomFillSync(new Uint8Array(16)))
      .map((n) => S[n % S.length])
      .join('')
  );
};

const createDataDir: () => string = () => {
  const dataDir = path.join(os.homedir(), '.inkbird', 'data');
  try {
    fs.mkdirSync(dataDir, {recursive: true});
  } catch {}
  return dataDir;
};

const cachedConfig: ConfigType = (() => {
  const configPath: string = path.join(os.homedir(), '.inkbird', 'config.json');
  let config: Partial<ConfigType> = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, {encoding: 'utf8'}));
  } catch (e) {}

  let updated: boolean = false;
  if (!config.machineId) {
    config.machineId = createMachineId();
    updated = true;
  }
  if (!config.dataDir) {
    config.dataDir = createDataDir();
    updated = true;
  }

  if (updated) {
    try {
      fs.mkdirSync(path.dirname(configPath), {recursive: true});
    } catch {}
    fs.writeFileSync(configPath, JSON.stringify(config));
    console.log('OK: Updated');
  } else {
    console.log('OK: Nothing to update');
  }

  return {machineId: config.machineId, dataDir: config.dataDir};
})();

function getConfig(): ConfigType {
  return cachedConfig;
}

export {ConfigType, getConfig};
