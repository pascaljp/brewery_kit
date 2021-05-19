// Tools this program depends on:
// - npm
// - git

import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function run(command: string, cwd?: string) {
  const result = execSync(`${command}`, {cwd: cwd, encoding: 'utf8'});
  addLog(`$ ${command}\n${result}`);
  return result;
}

function installInkbird(branch: string, rootDir: string): void {
  run('rm -rf brewery_kit', rootDir);
  run(
    `git clone https://github.com/pascaljp/brewery_kit.git -b ${branch} --depth 1`,
    rootDir
  );
  const monitoringDir = path.join(rootDir, 'brewery_kit', 'monitoring');
  run('npm install', monitoringDir);
};

function updateInkbird(branch: string, rootDir: string): void {
  const gitRootDir = path.join(rootDir, 'brewery_kit');
  const monitoringDir = path.join(gitRootDir, 'monitoring');
  try {
    fs.accessSync(monitoringDir);
  } catch (err) {
    throw new Error('Git repository does not exist');
  }

  const branches = run('git branch --format="%(refname:short)"', gitRootDir).split('\n');
  if (branches.includes(branch)) {
    run(`git checkout ${branch}`, gitRootDir);
  } else {
    run(`git checkout -b ${branch}`, gitRootDir);
  }

  run(`git fetch origin ${branch}`, gitRootDir);
  const diff = run(`git diff origin ${branch}`, gitRootDir);
  if (!diff) {
    return;
  }
  run(`git merge origin/${branch}`, gitRootDir);

  run('npm install', monitoringDir);
};

function addLog(message: string) {
  console.log(message);
};

export {run, updateInkbird, installInkbird};
