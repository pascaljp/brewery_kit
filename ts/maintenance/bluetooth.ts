'use strict';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
const bleno = require('@abandonware/bleno');
import { execSync } from 'child_process';

class Bluetooth {
  // Created by uuidgen command.
  static SERVICE_UUID: string = '5df27299-6bc8-41e4-81d3-46cf1907d5a5';
  static DEBUG_CHARACTERISTIC_UUID: string = '290f71cf-e43f-4a6d-ba34-63da4e1e47f3';
  static WIFI_SETTINGS_CHARACTERISTIC_UUID: string = '229a4726-db88-482f-ba8e-94785b8f5b4f';
  static WIFI_STATE_CHARACTERISTIC_UUID: string = '9601f3a2-60de-49c4-8524-0db4ab930349';
  static MACHINE_ID_CHARACTERISTIC_UUID: string = 'fd2c411e-35d0-4df8-b2e5-a1b7be3e4dbb';
  static DEVICE_NAME: string = 'brewery-kit';

  private wifiSsid_: string;
  private wifiPassword_: string;

  constructor() {
    console.log(`bleno - ${Bluetooth.DEVICE_NAME}`);

    this.wifiSsid_ = '';
    this.wifiPassword_ = '';
  }

  initService() {
    const DebugCharacteristic = new bleno.Characteristic({
      uuid: Bluetooth.DEBUG_CHARACTERISTIC_UUID,
      properties: ['write'],
      onWriteRequest: (data: Buffer, _offset: number, _withoutResponse: any, callback: (result: number) => void): void => {
        console.log('#', data);
        // const command = data.toString();
        // const stdout: string = execSync(`( ${command} ) 2>/dev/tty1`, {encoding: 'utf8'});
        // fs.writeSync('/dev/tty1', `[${stdout}]`);
        callback(bleno.Characteristic.RESULT_SUCCESS);
      },
    });

    const WiFiStateCharacteristic = new bleno.Characteristic({
      uuid: Bluetooth.WIFI_STATE_CHARACTERISTIC_UUID,
      properties: ['read'],
      onReadRequest: (_offset: any, callback: any): void => {
        const stdout: string = execSync('ping 8.8.8.8 -c 1 >/dev/null | echo $?', {encoding: 'utf8'}).trim();
        console.log(`[${stdout}]`);
        callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from([stdout == '0' ? 0 : 1]));
      },
    });
    const WiFiSettingsCharacteristic = new bleno.Characteristic({
      uuid: Bluetooth.WIFI_SETTINGS_CHARACTERISTIC_UUID,
      properties: ['read', 'write'],
      onReadRequest: (_offset: number, callback: any): void => {
        console.log(this.wifiSsid_, this.wifiPassword_);
        const data = Buffer.from(`${this.wifiSsid_} ${this.wifiPassword_}`);
        callback(bleno.Characteristic.RESULT_SUCCESS, data);
      },
      onWriteRequest: (data: Buffer, _offset: number, _withoutResponse: any, callback: (result: number) => void): void => {
        console.log(data);
        const wifiData: Array<string> = data.toString('utf8').split(' ');
        if (wifiData.length != 2) {
          callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
          return;
        }
        this.wifiSsid_ = wifiData[0] || '';
        this.wifiPassword_ = wifiData[1] || '';

        let networkId:string = execSync('wpa_cli -iwlan0 add_network', {encoding: 'utf8'}).trim();
        console.log(`[${networkId}]`);
        networkId = networkId.trim();
        const wpa_supplicant:string = `
        ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
        update_config=1
        country=JP

        network={
          ssid="${this.wifiSsid_}"
          psk="${this.wifiPassword_}"
        }
        `;
        fs.writeFileSync('/etc/wpa_supplicant/wpa_supplicant.conf', wpa_supplicant);
        fs.writeFileSync('/home/pascal/wpa_supplicant.conf', wpa_supplicant);
        // execSync('sudo systemctl reload-or-restart wpa_supplicant');
        execSync('wpa_cli -iwlan0 reassociate >/dev/tty1 2>/dev/tty1');

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
    const MachineIdCharacteristic = new bleno.Characteristic({
      uuid: Bluetooth.MACHINE_ID_CHARACTERISTIC_UUID,
      properties: ['read'],
      onReadRequest: (_offset: any, callback: any): void => {
        const configPath: string = path.join(os.homedir(), '.inkbird', 'config.json');
        let config: any = {};
        try {
          config = JSON.parse(fs.readFileSync(configPath, {encoding: 'utf8'}));
        } catch {}
        callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from(config.machineId || ''));
      },
    });

    bleno.on('stateChange', (state: string) => {
      console.log(`on -> stateChange: ${state}`);
      if (state === 'poweredOn') {
        bleno.startAdvertising(Bluetooth.DEVICE_NAME, [Bluetooth.SERVICE_UUID]);
      } else {
        bleno.stopAdvertising();
      }
    });

    bleno.on('advertisingStart', (error: any) => {
      console.log(`on -> advertisingStart: ${(error ? 'error' : 'success')}`);
      if (error) return;

      const blenoService = new bleno.PrimaryService({
        uuid: Bluetooth.SERVICE_UUID,
        characteristics: [DebugCharacteristic, WiFiSettingsCharacteristic, WiFiStateCharacteristic, MachineIdCharacteristic],
      });

      bleno.setServices([blenoService]);
    });
  }
}

new Bluetooth().initService();
