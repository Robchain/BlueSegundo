import {BleManager, Device} from 'react-native-ble-plx';
import {atob, btoa} from 'react-native-quick-base64';
import {BleConfig} from '../config/BleConfig';

export class BleService {
  private bleManager: BleManager;

  constructor(bleManager: BleManager) {
    this.bleManager = bleManager;
  }

  async connectToDevice(device: Device): Promise<Device> {
    try {
      const deviceConnection = await this.bleManager.connectToDevice(device.id);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      this.bleManager.stopDeviceScan();
      return deviceConnection;
    } catch (error) {
      this.bleManager.stopDeviceScan();
      throw new Error('Failed to connect to device');
    }
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    await this.bleManager.cancelDeviceConnection(deviceId);
  }

  async writeData(deviceId: string, data: string): Promise<void> {
    await this.bleManager.writeCharacteristicWithoutResponseForDevice(
      deviceId,
      BleConfig.SERVICE_UUID,
      BleConfig.WRITE_UUID,
      btoa(`mm${data}`),
    );
  }

  async readData(deviceId: string): Promise<string> {
    const characteristic = await this.bleManager.readCharacteristicForDevice(
      deviceId,
      BleConfig.SERVICE_UUID,
      BleConfig.READ_UUID,
    );
    return atob(characteristic.value!);
  }

  stopScan(): void {
    this.bleManager.stopDeviceScan();
  }

  getBleManager(): BleManager {
    return this.bleManager;
  }
}