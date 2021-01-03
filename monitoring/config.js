const fs = require('fs');

const getConfig = () => {
  const CONFIG_PATHS = [
    `/home/${process.env.USER}/.inkbird/config.json`,
    '/mnt/inkbird/config.json',
  ];
  for (const path of CONFIG_PATHS) {
    try {
      return JSON.parse(fs.readFileSync(path, 'UTF-8'));
    } catch {}
  }
  throw new Error('Config file was not found. Try running maintenance/update_job.sh');
};

exports.getConfig = getConfig;
