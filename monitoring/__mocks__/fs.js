'use strict';

const fs = jest.createMockFromModule('fs');
const memfs = require('memfs');

fs.mkdirSync = (path, params) => memfs.fs.mkdirSync(path, params);

fs.readdirSync = (path, param) => memfs.fs.readdirSync(path, param);

fs.appendFileSync = (path, params) => memfs.fs.appendFileSync(path, params);

module.exports = fs;
