// Tools this program depends on:
// - curl
// - docker (optional)
// - npm
// - git

const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
const os = require('os');
const path = require('path');

const Run = (command, cwd) => {
  const c = command.split(' ');
  const result = spawnSync(c[0], c.slice(1), {cwd: cwd});
  return {
    stdout: (new TextDecoder).decode(result.stdout),
    stderr: (new TextDecoder).decode(result.stderr),
  };
};

const GetRootDir = () => {
  if (IsOnDocker()) {
    return '/mnt/inkbird';
  } else {
    Run('mkdir -p /tmp/inkbird');
    return '/tmp/inkbird';
  }
};

const GetUserName = () => {
  return os.userInfo().username;
};

const IsOnDocker = () => {
  return GetUserName() == 'docker';
};

const InstallInkbird = (branch, rootDir) => {
  Run(`git clone https://github.com/pascaljp/brewery_kit.git -b ${branch} --depth 1`,
      rootDir);
  AddLog('git clone: done');
}

const UpdateInkbird = (branch, gitRootDir) => {
  Run(`git fetch origin ${branch}`, gitRootDir);
  const diff = (Run(`git diff origin/${branch}`, gitRootDir)).stdout;
  if (!diff) {
    AddLog('git: no diff');
    return false;
  }
  Run(`git pull origin ${branch}`, gitRootDir);
  Run(`git checkout ${branch}`, gitRootDir);
  AddLog('git pull: done');
  return true
};

const RestartJob = () => {
  if (IsOnDocker()) {
    Run('docker restart brewery-kit-instance')
    AddLog('restart job: done');
    return;
  }
  AddLog('restart job: not executed');
};

const InstallLatestInkbird = (rootDir) => {
  const userName = GetUserName();
  Run(`sudo chown ${userName}:${userName} -R ${rootDir}`);

  const branch = Run('curl http://brewery-app.com/current_version')['stdout'].split('\n')[0];
  AddLog(`git branch: ${branch}`);

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
  Run('npm install', monitoringDir)
  AddLog('npm install: done');
  RestartJob();
}


const result = [];
const AddLog = (message) => {
  result.push(message);
};

try {
  const rootDir = GetRootDir();
  InstallLatestInkbird(rootDir);

  const setupScript = path.join(rootDir, 'brewery_kit/monitoring/maintenance/setup.js');
  const target = IsOnDocker() ? 'docker' : 'native';
  Run(`node ${setupScript} ${target}`);
} catch (e) {
  result.push({'unexpected error': e});
}
console.log(JSON.stringify(result));
