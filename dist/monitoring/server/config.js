'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
var fs = __importStar(require("fs"));
var os = __importStar(require("os"));
var path = __importStar(require("path"));
var crypto = __importStar(require("crypto"));
var createMachineId = function () {
    var S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return ('machine-' +
        Array.from(crypto.randomFillSync(new Uint8Array(16)))
            .map(function (n) { return S[n % S.length]; })
            .join(''));
};
var createDataDir = function () {
    var dataDir = path.join(os.homedir(), '.inkbird', 'data');
    try {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    catch (_a) { }
    return dataDir;
};
var cachedConfig = (function () {
    var configPath = path.join(os.homedir(), '.inkbird', 'config.json');
    var config = {};
    try {
        config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
    }
    catch (e) { }
    var updated = false;
    if (!config.machineId) {
        config.machineId = createMachineId();
        updated = true;
    }
    if (!config.dataDir) {
        config.dataDir = createDataDir();
        updated = true;
    }
    if (updated) {
        try {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }
        catch (_a) { }
        fs.writeFileSync(configPath, JSON.stringify(config));
        console.log('OK: Updated');
    }
    else {
        console.log('OK: Nothing to update');
    }
    return { machineId: config.machineId, dataDir: config.dataDir };
})();
function getConfig() {
    return cachedConfig;
}
exports.getConfig = getConfig;
