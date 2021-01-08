const dns = require('dns');
const execSync = require('child_process').execSync;

class HealthCheck {
  constructor() {
  }

  isNetworkConnected() {
    try {
      execSync('ping -c 1 8.8.8.8');
      return true;
    } catch {
      return false;
    }
  }

  async isDnsWorking() {
    return new Promise((resolve, reject) => {
      dns.lookup('brewery-app.com', (err) => {
        if (err && err.code == 'ENOTFOUND') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  isInkbirdServiceRunning() {
    try {
      const result = execSync(
        'docker ps -a --filter name=brewery-kit-instance --format "{{.State}}"');
      const jobState = new TextDecoder('utf-8').decode(result).split('\n')[0];
      return jobState.find('running') != -1;
    } catch {
      return false;
    }
  }

  startInkbirdService() {
    try {
      execSync('docker run -d --rm --privileged --net=host --name brewery-kit-instance --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.2 bash -c "node brewery_kit/monitoring/inkbird.js"');
      return true;
    } catch (e) {
      return false;
    }
  }
}

(async () => {
  console.log(process.env);

  // execSync('sudo chown');
  const h = new HealthCheck();
  let success = true;
  if (!h.isNetworkConnected()) {
    console.error('8.8.8.8 is not reachable');
    success = false;
  }
  if (!await h.isDnsWorking()) {
    console.error('Failed to resolve brewery-app.com');
    success = false;
  }
  if (!h.isInkbirdServiceRunning()) {
    if (!h.startInkbirdService()) {
      console.error('Docker process is stopped, and failed to restart');
      success = false;
    } else if (!h.isInkbirdServiceRunning()) {
      console.error('Docker process was restarted, but failed immediately');
      success = false;
    }
  }
  process.exit(success ? 0 : 1);
})();
