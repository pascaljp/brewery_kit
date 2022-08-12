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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ibs_th1_1 = require("ibs_th1");
var luxon_1 = require("luxon");
var brewery_kit_api_1 = require("@pascaljp/brewery-kit-api");
var setup_log4js_1 = require("monitoring/setup_log4js");
var watchdog_1 = require("monitoring/watchdog");
var main_1 = require("monitoring/server/main");
var InkbirdConfig = __importStar(require("monitoring/server/config"));
var MONITORING_FREQUENCY = 60; // Once in every 60 seconds.
var Inkbird = /** @class */ (function () {
    function Inkbird() {
    }
    Inkbird.run = function () {
        // Exit the program if watchdog.refresh() is not called for 5 minutes.
        var watchdog = new watchdog_1.Watchdog(/*seconds=*/ 300);
        watchdog.run();
        // device ID to unixtime.
        var lastNotifyTimes = new Map();
        function createCallback(api /* notifier: Notifier*/) {
            var _this = this;
            return function (data) { return __awaiter(_this, void 0, void 0, function () {
                var currentUnixtime, lastNotifyTime, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            currentUnixtime = Math.floor(luxon_1.DateTime.now().toSeconds());
                            lastNotifyTime = lastNotifyTimes.get(data.address);
                            if (lastNotifyTime &&
                                Math.floor(lastNotifyTime / MONITORING_FREQUENCY) ==
                                    Math.floor(currentUnixtime / MONITORING_FREQUENCY)) {
                                return [2 /*return*/];
                            }
                            setup_log4js_1.logger.trace(data.address, data.temperature, data.humidity, data.probeType, data.battery);
                            lastNotifyTimes.set(data.address, currentUnixtime);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, api.saveInkbirdData([
                                    {
                                        deviceId: data.address,
                                        unixtime: currentUnixtime,
                                        temperature: data.temperature,
                                        humidity: data.humidity,
                                        battery: data.battery,
                                    },
                                ], false)];
                        case 2:
                            _a.sent();
                            watchdog.refresh();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            setup_log4js_1.logger.error('Error in notifier.notifyInkbirdApi:', e_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
        }
        var config = InkbirdConfig.getConfig();
        setup_log4js_1.logger.mark("Machine ID: ".concat(config.machineId));
        var api = new brewery_kit_api_1.BreweryKitApi(config.dataDir, config.machineId);
        api.startBackgroundTask(function () { setup_log4js_1.logger.info('Saved'); });
        // Server needs to start up after config file is created.
        var server = new main_1.Server();
        server.start();
        // Subscribe inkbird signals.
        setup_log4js_1.logger.mark('Inkbird monitoring program has started.');
        var device = new ibs_th1_1.IBS_TH1();
        device.subscribeRealtimeData(createCallback(api /*notifier*/));
    };
    return Inkbird;
}());
Inkbird.run();
