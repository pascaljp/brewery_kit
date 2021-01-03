'use strict';

const fs = jest.createMockFromModule('fs');
const memfs = require('memfs');

fs.mkdirSync = (path, params) => memfs.fs.mkdirSync(path, params);

fs.readdirSync = (path, param) => memfs.fs.readdirSync(path, param);

fs.readFileSync = (path, param) => memfs.fs.readFileSync(path, param);

fs.appendFileSync = (path, params) => memfs.fs.appendFileSync(path, params);

fs.openSync = (path, params) => memfs.fs.openSync(path, params);

fs.writeSync = (path, params) => memfs.fs.writeSync(path, params);

fs.closeSync = (fd) => memfs.fs.closeSync(fd);

fs.unlinkSync = (path, params) => memfs.fs.unlinkSync(path, params);

module.exports = fs;
