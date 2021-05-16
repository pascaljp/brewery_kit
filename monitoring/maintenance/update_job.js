// Tools this program depends on:
// - curl
// - docker (optional)
// - npm
// - git

const execSync = require('child_process').execSync;

const run = (command, cwd) => {
  return execSync(command, {cwd: cwd}).toString();
};

const installLatestInkbird = () => {
  // const branch = run('curl http://brewery-app.com/current_version').split('\n')[0];
  const branch = 'master';
  run(`curl https://raw.githubusercontent.com/pascaljp/brewery_kit/${branch}/monitoring/maintenance/update_job.ts -O | ts-node`);
};

/** Main */
function main() {
  try {
    installLatestInkbird();
  } catch (e) {
    result.push({'unexpected error': e});
  }
}

main();
