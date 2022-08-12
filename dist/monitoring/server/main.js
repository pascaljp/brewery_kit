"use strict";
// How to authenticate users:
// 1. monitoring program uploads machineId to a server.
// 2. user accesses the server, and get an IP address of the monitoring program.
// 3. user accesses the monitoring program to get the machineID.
// 4. user sends the machineId to the server.
// 5. now the server knows the user has an access to the machine.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var express_1 = __importDefault(require("express"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var Log4js = __importStar(require("log4js"));
var os = __importStar(require("os"));
var InkbirdConfig = __importStar(require("./config"));
var logger = Log4js.getLogger();
var Server = /** @class */ (function () {
    function Server() {
        this.app_ = (0, express_1.default)();
        this.server_ = null;
        this.machineId_ = InkbirdConfig.getConfig().machineId;
        this.app_.get('/', function (_req, res) { res.send('OK'); });
        this.app_.get('/getMachineId', this.getMachineId_.bind(this));
    }
    Server.prototype.start = function () {
        var _this = this;
        logger.mark('Starting up a server...');
        this.server_ = this.app_.listen(0, function () {
            logger.info('Server started.');
            _this.notifyLocalIpAddress_(_this.machineId_);
        });
    };
    Server.prototype.notifyLocalIpAddress_ = function (machineId) {
        return __awaiter(this, void 0, void 0, function () {
            var address, port, interfaces, _i, _a, _b, entries, _c, entries_1, entry;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.server_) {
                            return [2 /*return*/];
                        }
                        address = this.server_.address();
                        if (!address || typeof address === 'string') {
                            return [2 /*return*/];
                        }
                        port = address.port;
                        interfaces = os.networkInterfaces();
                        _i = 0, _a = Object.entries(interfaces);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], entries = _b[1];
                        if (!Array.isArray(entries)) {
                            return [3 /*break*/, 5];
                        }
                        _c = 0, entries_1 = entries;
                        _d.label = 2;
                    case 2:
                        if (!(_c < entries_1.length)) return [3 /*break*/, 5];
                        entry = entries_1[_c];
                        if (entry.family != 'IPv4') {
                            return [3 /*break*/, 4];
                        }
                        if (entry.internal) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, (0, node_fetch_1.default)('https://brewery-app.com/api/client/saveIpAddress', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                                redirect: 'follow',
                                body: JSON.stringify({
                                    machineId: machineId,
                                    ipAddress: entry.address,
                                    port: port,
                                }),
                            })];
                    case 3:
                        _d.sent();
                        logger.info("Notified: ".concat(entry.address, ":").concat(port));
                        _d.label = 4;
                    case 4:
                        _c++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.getMachineId_ = function (_req, res) {
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.header('Access-Control-Allow-Origin', 'https://brewery-app.com');
        res.header('Access-Control-Allow-Origin', 'http://brewery-app.com');
        res.json({ status: 'ok', machineId: this.machineId_ });
    };
    return Server;
}());
exports.Server = Server;
