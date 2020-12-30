'use strict';

const commandLineArgs = require('command-line-args');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const optionDefinitions = [
  {
    name: 'config',
    type: String,
    defaultValue: '/mnt/inkbird/config.json'
  },
];
const options = commandLineArgs(optionDefinitions);

const setupConfig = () => {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(options.config, 'UTF-8'));
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
  fs.writeFileSync(options.config, JSON.stringify(config));
  console.info('Succeeded');
};

setupConfig();
