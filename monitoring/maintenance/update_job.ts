// Tools this program depends on:
// - curl
// - npm
// - git

import * as os from 'os';
import {run, installInkbird, updateInkbird} from './update_job_internal';

function getUserName() {
  return os.userInfo().username;
}

function isOnDocker() {
  return getUserName() == 'docker';
}

function getRootDir() {
  if (isOnDocker()) {
    const userName = getUserName();
    run(`sudo chown ${userName}:${userName} -R /mnt/inkbird`);
    return '/mnt/inkbird';
  } else {
    run('mkdir -p /tmp/inkbird');
    return '/tmp/inkbird';
  }
}

function installLatestInkbird(branch: string, rootDir: string): void {
  try {
    updateInkbird(branch, rootDir);
  } catch (e) {
    installInkbird(branch, rootDir);
  }
};

function main() {
  try {
    const rootDir = getRootDir();
    const branch = run('curl -sS http://brewery-app.com/current_version').split('\n')[0];
    if (!branch) {
      return;
    }
    installLatestInkbird(branch, rootDir);
  } catch (e) {
    console.error(e);
  }
}

main();
