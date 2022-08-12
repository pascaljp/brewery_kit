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
var path = __importStar(require("path"));
var os = __importStar(require("os"));
var fs = __importStar(require("fs"));
var bleno = require('@abandonware/bleno');
var child_process_1 = require("child_process");
var Bluetooth = /** @class */ (function () {
    function Bluetooth() {
        console.log("bleno - ".concat(Bluetooth.DEVICE_NAME));
        this.wifiSsid_ = '';
        this.wifiPassword_ = '';
    }
    Bluetooth.prototype.initService = function () {
        var _this = this;
        var DebugCharacteristic = new bleno.Characteristic({
            uuid: Bluetooth.DEBUG_CHARACTERISTIC_UUID,
            properties: ['write'],
            onWriteRequest: function (data, _offset, _withoutResponse, callback) {
                console.log('#', data);
                // const command = data.toString();
                // const stdout: string = execSync(`( ${command} ) 2>/dev/tty1`, {encoding: 'utf8'});
                // fs.writeSync('/dev/tty1', `[${stdout}]`);
                callback(bleno.Characteristic.RESULT_SUCCESS);
            },
        });
        var WiFiStateCharacteristic = new bleno.Characteristic({
            uuid: Bluetooth.WIFI_STATE_CHARACTERISTIC_UUID,
            properties: ['read'],
            onReadRequest: function (_offset, callback) {
                var stdout = (0, child_process_1.execSync)('ping 8.8.8.8 -c 1 >/dev/null | echo $?', { encoding: 'utf8' }).trim();
                console.log("[".concat(stdout, "]"));
                callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from([stdout == '0' ? 0 : 1]));
            },
        });
        var WiFiSettingsCharacteristic = new bleno.Characteristic({
            uuid: Bluetooth.WIFI_SETTINGS_CHARACTERISTIC_UUID,
            properties: ['read', 'write'],
            onReadRequest: function (_offset, callback) {
                console.log(_this.wifiSsid_, _this.wifiPassword_);
                var data = Buffer.from("".concat(_this.wifiSsid_, " ").concat(_this.wifiPassword_));
                callback(bleno.Characteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function (data, _offset, _withoutResponse, callback) {
                console.log(data);
                var wifiData = data.toString('utf8').split(' ');
                if (wifiData.length != 2) {
                    callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
                    return;
                }
                _this.wifiSsid_ = wifiData[0] || '';
                _this.wifiPassword_ = wifiData[1] || '';
                var networkId = (0, child_process_1.execSync)('wpa_cli -iwlan0 add_network', { encoding: 'utf8' }).trim();
                console.log("[".concat(networkId, "]"));
                networkId = networkId.trim();
                var wpa_supplicant = "\n        ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n        update_config=1\n        country=JP\n\n        network={\n          ssid=\"".concat(_this.wifiSsid_, "\"\n          psk=\"").concat(_this.wifiPassword_, "\"\n        }\n        ");
                fs.writeFileSync('/etc/wpa_supplicant/wpa_supplicant.conf', wpa_supplicant);
                fs.writeFileSync('/home/pascal/wpa_supplicant.conf', wpa_supplicant);
                // execSync('sudo systemctl reload-or-restart wpa_supplicant');
                (0, child_process_1.execSync)('wpa_cli -iwlan0 reassociate >/dev/tty1 2>/dev/tty1');
                // const stdin = `
                // set_network ${networkId} ssid ${this.wifiSsid_}
                // set_network ${networkId} psk ${this.wifiPassword_}
                // enable_network ${networkId}
                // save_config
                // `;
                // execSync('wpa_cli -iwlan0', {input: stdin});
                // execSync('cat /etc/wpa_supplicant/wpa_supplicant.conf > /dev/tty1');
                // callback(bleno.Characteristic.RESULT_SUCCESS);
                // execSync('wpa_cli -iwlan0 reassociate >/dev/tty1 2>/dev/tty1');
            },
        });
        var MachineIdCharacteristic = new bleno.Characteristic({
            uuid: Bluetooth.MACHINE_ID_CHARACTERISTIC_UUID,
            properties: ['read'],
            onReadRequest: function (_offset, callback) {
                var configPath = path.join(os.homedir(), '.inkbird', 'config.json');
                var config = {};
                try {
                    config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
                }
                catch (_a) { }
                callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from(config.machineId || ''));
            },
        });
        bleno.on('stateChange', function (state) {
            console.log("on -> stateChange: ".concat(state));
            if (state === 'poweredOn') {
                bleno.startAdvertising(Bluetooth.DEVICE_NAME, [Bluetooth.SERVICE_UUID]);
            }
            else {
                bleno.stopAdvertising();
            }
        });
        bleno.on('advertisingStart', function (error) {
            console.log("on -> advertisingStart: ".concat((error ? 'error' : 'success')));
            if (error)
                return;
            var blenoService = new bleno.PrimaryService({
                uuid: Bluetooth.SERVICE_UUID,
                characteristics: [DebugCharacteristic, WiFiSettingsCharacteristic, WiFiStateCharacteristic, MachineIdCharacteristic],
            });
            bleno.setServices([blenoService]);
        });
    };
    // Created by uuidgen command.
    Bluetooth.SERVICE_UUID = '5df27299-6bc8-41e4-81d3-46cf1907d5a5';
    Bluetooth.DEBUG_CHARACTERISTIC_UUID = '290f71cf-e43f-4a6d-ba34-63da4e1e47f3';
    Bluetooth.WIFI_SETTINGS_CHARACTERISTIC_UUID = '229a4726-db88-482f-ba8e-94785b8f5b4f';
    Bluetooth.WIFI_STATE_CHARACTERISTIC_UUID = '9601f3a2-60de-49c4-8524-0db4ab930349';
    Bluetooth.MACHINE_ID_CHARACTERISTIC_UUID = 'fd2c411e-35d0-4df8-b2e5-a1b7be3e4dbb';
    Bluetooth.DEVICE_NAME = 'brewery-kit';
    return Bluetooth;
}());
new Bluetooth().initService();
