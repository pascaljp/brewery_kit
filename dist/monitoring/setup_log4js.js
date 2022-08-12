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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var os = __importStar(require("os"));
var path = __importStar(require("path"));
var Log4js = __importStar(require("log4js"));
var moment_timezone_1 = __importDefault(require("moment-timezone"));
Log4js.addLayout('with_filename', function ( /*config*/) {
    return function (logEvent) {
        var level = logEvent.level.levelStr[0] || '?';
        var time = (0, moment_timezone_1.default)(logEvent.startTime)
            .tz('Asia/Tokyo')
            .format('YYYYMMDD HHmmss.SSS');
        var path = logEvent.fileName || 'unknown';
        var file = path.substr(path.indexOf('brewery_kit') + 'brewery_kit/'.length);
        return "".concat(level).concat(time, "] ").concat(file, " ").concat(logEvent.data);
    };
});
Log4js.configure({
    appenders: {
        out: { type: 'stdout', layout: { type: 'with_filename' } },
        err: {
            type: 'file',
            filename: path.join(os.homedir(), '.inkbird', 'error.log'),
            pattern: '-yyyyMMdd',
            backups: 366,
            layout: { type: 'with_filename' },
        },
    },
    categories: {
        default: { appenders: ['out'], level: 'all', enableCallStack: true },
        ibs_th1: { appenders: ['out', 'err'], level: 'warn', enableCallStack: true },
    },
});
var logger = Log4js.getLogger();
exports.logger = logger;
