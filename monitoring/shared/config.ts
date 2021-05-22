'use strict';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

interface ConfigType {
  machineId: string;
  dataDir: string;
}

const cachedConfig: ConfigType = (() => {
  try {
    const configPath: string = path.join(os.homedir(), '.inkbird', 'config.json');
    const config: ConfigType = JSON.parse(
      fs.readFileSync(configPath, {encoding: 'utf8'})
    );
    return config;
  } catch (e) {
    console.error(e);
    throw new Error(
      'Config file was not found. Try running maintenance/update_job.sh'
    );
  }
})();

function getConfig(): ConfigType {
  return cachedConfig;
}

export {ConfigType, getConfig};
