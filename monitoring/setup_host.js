'use strict';

const commandLineArgs = require('command-line-args');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const optionDefinitions = [
  {
    name: 'sharedDir',
    type: String,
    defaultValue: '/var/lib/docker/volumes/inkbird/_data'
  },
];
const options = commandLineArgs(optionDefinitions);

const setupConfig = () => {
  const configFilePath = path.join(options.sharedDir, 'config.json');
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configFilePath, 'UTF-8'));
  } catch (e) {
  }

  if (!config.machineId) {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const machineId = 'random-' +
          Array.from(crypto.randomFillSync(new Uint8Array(16)))
          .map((n) => S[n % S.length]).join('');
    config.machineId = machineId;
  }
  console.log(config);
  fs.writeFileSync(configFilePath, JSON.stringify(config));
  console.info('Succeeded');
};

setupConfig();
