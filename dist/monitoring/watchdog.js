"use strict";
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
exports.Watchdog = void 0;
var Log4js = __importStar(require("log4js"));
var logger = Log4js.getLogger();
var Watchdog = /** @class */ (function () {
    function Watchdog(timeout_sec) {
        this.timeout_sec_ = timeout_sec;
        this.watchdogId_ = null;
    }
    Watchdog.prototype.run = function () {
        this.watchdogId_ = setTimeout(function () {
            logger.error('Seems like inkbird process is not working properly.');
            logger.error('Exiting the program...');
            process.exit(1);
        }, this.timeout_sec_ * 1000);
        // The watchdog does not prevent the program to terminate.
        this.watchdogId_.unref();
    };
    Watchdog.prototype.refresh = function () {
        if (!this.watchdogId_) {
            logger.error('Watchdog needs to be started.');
            return;
        }
        this.watchdogId_.refresh();
    };
    return Watchdog;
}());
exports.Watchdog = Watchdog;
