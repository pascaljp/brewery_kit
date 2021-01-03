'use strict';

const commandLineArgs = require('command-line-args');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const USER = process.env.USER;

const optionDefinitions = [
  {
    name: 'target',
    type: String,
    defaultValue: ''
  },
];
const options = commandLineArgs(optionDefinitions);

const getDataDir = () => {
  let dir;
  switch (options.target) {
  case 'docker':
    return '/mnt/inkbird';
  case 'native':
    return `/home/${USER}/.inkbird`;
  default:
    console.error('Invalid argument: --target parameter should be one of "docker" or "native"');
    process.exit(1);
  }
};

const getConfigPath = () => {
  return path.join(getDataDir(), 'config.json');
};

const setupConfig = () => {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
  } catch (e) {
  }

  if (!config.machineId) {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const machineId = 'random-' +
          Array.from(crypto.randomFillSync(new Uint8Array(16)))
          .map((n) => S[n % S.length]).join('');
    config.machineId = machineId;
  }
  config.dataDir = path.join(getDataDir(), 'data');
  console.log(config);

  execSync(`sudo mkdir -p ${configDir}`);
  execSync(`sudo chown ${USER}:${USER} ${configDir}`);
  execSync(`mkdir -p ${config.dataDir}`);
  fs.writeFileSync(configPath, JSON.stringify(config));
  console.info('Succeeded');
};

setupConfig();
