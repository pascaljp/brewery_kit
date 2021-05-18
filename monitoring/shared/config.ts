'use strict';

import * as crypto from 'crypto';
import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ConfigType {
  machineId: string;
  dataDir: string;
}

interface PartialConfigType {
  machineId?: string;
  dataDir?: string;
}

/** Returns whether the field is updated. */
function getMachineId(config: PartialConfigType): string {
  if (config.machineId) {
    return config.machineId;
  }
  const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return (
    'random-' +
    Array.from(crypto.randomFillSync(new Uint8Array(16)))
      .map((n) => S[n % S.length])
      .join('')
  );
}

function getDataDir(): string {
  return process.env['USER'] == 'docker'
    ? '/mnt/inkbird'
    : `/home/${process.env['USER']}/.inkbird`;
}

function getConfigInternal(): ConfigType {
  const configPath: string = path.join(getDataDir(), 'config.json');
  const partialConfig: PartialConfigType = JSON.parse(
    fs.readFileSync(configPath, {encoding: 'utf8'})
  );

  if (partialConfig.machineId && partialConfig.dataDir) {
    const machineId = partialConfig.machineId;
    const dataDir = partialConfig.dataDir;
    return {machineId, dataDir};
  }

  const config = {
    machineId: getMachineId(partialConfig),
    dataDir: getDataDir(),
  };

  const user = process.env['USER'];
  execSync(`sudo mkdir -p ${config.dataDir}`);
  execSync(`sudo chown ${user}:${user} ${config.dataDir}`);
  execSync(`mkdir -p ${config.dataDir}`);
  fs.writeFileSync(configPath, JSON.stringify(config));
  return config;
}

const cachedConfig: ConfigType = (() => {
  try {
    return getConfigInternal();
  } catch (e) {
    console.error(e);
    throw new Error('Config file was not found. Try running maintenance/update_job.sh');
  }
})();

function getConfig(): ConfigType {
  return cachedConfig;
}

  export {ConfigType, getConfig};
