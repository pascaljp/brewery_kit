// This program is usually run in docker environment, but native environment is also supported.
//
// Tools this program depends on:
// - curl
// - npm
// - git

import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {getConfig} from '../shared/config';

const logs: string[] = [];
function report(message: string) {
  logs.push(message);
}

function run(command: string, options?: {cwd?: string}) {
  try {
    const result = execSync(command + ' 2>/dev/null', {
      cwd: options?.cwd,
    }).toString();
    try {
      report('> ' + command);
      report(result);
    } catch {}
    return {
      stdout: result,
      stderr: '',
    };
  } catch (err) {
    try {
      report(command);
      report(err.stderr.toString());
    } catch {}
    return {
      stdout: err.stdout.toString(),
      stderr: err.stderr.toString(),
    };
  }
}

function getUserName() {
  return os.userInfo().username;
}

const installInkbird = (branch: string, rootDir: string) => {
  run(
    `git clone https://github.com/pascaljp/brewery_kit.git -b ${branch} --depth 1`,
    {cwd: rootDir}
  );
};

const updateInkbird = (branch: string, gitRootDir: string) => {
  run(`git fetch origin ${branch}`, {cwd: gitRootDir});
  const diff = run(`git diff origin/${branch}`, {cwd: gitRootDir}).stdout;
  if (!diff) {
    return false;
  }
  run(`git pull origin ${branch}`, {cwd: gitRootDir});
  run(`git checkout ${branch}`, {cwd: gitRootDir});
  return true;
};

const installLatestInkbird = (rootDir: string): boolean => {
  const userName = getUserName();
  run(`sudo chown ${userName}:${userName} -R ${rootDir}`);

  const branch = run('curl http://brewery-app.com/current_version')[
    'stdout'
  ].split('\n')[0];
  if (!branch) {
    return false;
  }

  const monitoringDir = path.join(rootDir, 'brewery_kit', 'monitoring');
  try {
    fs.accessSync(monitoringDir);
    const updated = updateInkbird(branch, monitoringDir);
    if (!updated) {
      return false;
    }
  } catch (e) {
    installInkbird(branch, rootDir);
  }
  run('npm install', {cwd: monitoringDir});
  return true;
};

/** Main */
function main() {
  try {
    const rootDir = getConfig().dataDir;
    const updated = installLatestInkbird(rootDir);
    report('Update finished');
    if (updated) {
      console.log('Updated');
    }
  } catch (e) {
    report(e);
  }

  const machineId = escape(getConfig().machineId);
  const message = escape(logs.join('\n'));
  const url = `https://brewery-app.com/api/client/log`;
  run(
    `curl -G -sS ${url} -d 'machineId=${machineId}' -d 'key=log' -d 'data=${message}'`
  );
}

main();
