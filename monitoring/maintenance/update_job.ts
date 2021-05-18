// Tools this program depends on:
// - curl
// - docker (optional)
// - npm
// - git

const spawnSync = require('child_process').spawnSync;
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const run = (command: string, cwd?: string) => {
  const c = command.split(' ');
  const result = spawnSync(c[0], c.slice(1), {cwd: cwd});
  return {
    stdout: new TextDecoder().decode(result.stdout),
    stderr: new TextDecoder().decode(result.stderr),
  };
};

const GetRootDir = () => {
  if (IsOnDocker()) {
    return '/mnt/inkbird';
  } else {
    run('mkdir -p /tmp/inkbird');
    return '/tmp/inkbird';
  }
};

const GetUserName = () => {
  return os.userInfo().username;
};

const IsOnDocker = () => {
  return GetUserName() == 'docker';
};

const InstallInkbird = (branch: string, rootDir: string) => {
  run(
    `git clone https://github.com/pascaljp/brewery_kit.git -b ${branch} --depth 1`,
    rootDir
  );
  AddLog('git clone: done');
};

const UpdateInkbird = (branch: string, gitRootDir: string) => {
  run(`git fetch origin ${branch}`, gitRootDir);
  const diff = run(`git diff origin/${branch}`, gitRootDir).stdout;
  if (!diff) {
    AddLog('git: no diff');
    return false;
  }
  run(`git pull origin ${branch}`, gitRootDir);
  run(`git checkout ${branch}`, gitRootDir);
  AddLog('git pull: done');
  return true;
};

const RestartJob = () => {
  if (IsOnDocker()) {
    run('docker restart brewery-kit-instance');
    AddLog('restart job: done');
    return;
  }
  AddLog('restart job: not executed');
};

const InstallLatestInkbird = (rootDir: string) => {
  const userName = GetUserName();
  run(`sudo chown ${userName}:${userName} -R ${rootDir}`);

  // const branch = run('curl http://brewery-app.com/current_version')[
  //   'stdout'
  // ].split('\n')[0];
  const branch = 'master';
  AddLog(`git branch: ${branch}`);
  if (!branch) {
    return;
  }

  const monitoringDir = path.join(rootDir, 'brewery_kit', 'monitoring');
  try {
    fs.accessSync(monitoringDir);
    const updated = UpdateInkbird(branch, monitoringDir);
    if (!updated) {
      return;
    }
  } catch (e) {
    InstallInkbird(branch, rootDir);
  }
  run('npm install', monitoringDir);
  AddLog('npm install: done');
  RestartJob();
};

const AddLog = (message: string) => {
  console.log(message);
};

function main() {
  try {
    const rootDir = GetRootDir();
    InstallLatestInkbird(rootDir);

    const setupScript = path.join(
      rootDir,
      'brewery_kit/monitoring/maintenance/setup.js'
    );
    const target = IsOnDocker() ? 'docker' : 'native';
    run(`node ${setupScript} ${target}`);
  } catch (e) {
    console.error(e);
  }
}

main();
