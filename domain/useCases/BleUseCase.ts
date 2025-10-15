import {Device, BleManager} from 'react-native-ble-plx';
import {Platform} from 'react-native';
import {BleService} from '../services/BleService';
import {BleConfig} from '../config/BleConfig';
import {AppDispatch} from '../../store';
import {
  addDevice,
  clearDevices,
  setConnectedDevice,
  setScanning,
  setLoading,
  setError,
  setResponse,
} from '../../store/slices/bleSlice';

export class BleUseCase {
  private bleService: BleService;
  private dispatch: AppDispatch;

  constructor(bleService: BleService, dispatch: AppDispatch) {
    this.bleService = bleService;
    this.dispatch = dispatch;
  }

  startScan(userText: string): void {
    this.dispatch(clearDevices());
    this.dispatch(setError(null));
    this.dispatch(setScanning(true));
    this.dispatch(setLoading(true));

    const bleManager = this.bleService.getBleManager();

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        this.handleScanError();
        return;
      }

      if (device && this.isTargetDevice(device)) {
        this.dispatch(setLoading(false));
        this.dispatch(addDevice(device));
        this.handleDeviceConnection(device, userText);
      }
    });

    this.setupScanTimeout();
  }

  private isTargetDevice(device: Device): boolean {
    return (
      device.name === BleConfig.DEVICE_NAME &&
      device.rssi !== null &&
      device.rssi > BleConfig.MIN_RSSI
    );
  }

  private async handleDeviceConnection(device: Device, userText: string): Promise<void> {
    try {
      const connectedDevice = await this.bleService.connectToDevice(device);
      this.dispatch(setConnectedDevice(connectedDevice));
      await this.exchangeData(connectedDevice, userText);
    } catch (error) {
      this.handleConnectionError();
    }
  }

  private async exchangeData(device: Device, userText: string): Promise<void> {
    try {
      this.dispatch(setLoading(false));
      this.dispatch(setResponse(null));

      await this.bleService.writeData(device.id, userText);

      setTimeout(async () => {
        try {
          const data = await this.bleService.readData(device.id);
          this.dispatch(setResponse(data));
        } catch (error) {
          console.error('Error reading data:', error);
        }
      }, BleConfig.READ_DELAY);

      setTimeout(async () => {
        await this.disconnect(device.id);
      }, BleConfig.DISCONNECT_DELAY);
    } catch (error) {
      this.handleExchangeError();
    }
  }

  private async disconnect(deviceId: string): Promise<void> {
    await this.bleService.disconnectFromDevice(deviceId);
    this.dispatch(setConnectedDevice(null));
    this.dispatch(setLoading(false));
    this.dispatch(setScanning(false));
    this.bleService.stopScan();
  }

  private handleScanError(): void {
    this.bleService.stopScan();
    this.dispatch(clearDevices());
    this.dispatch(setScanning(false));
    this.dispatch(setLoading(false));
    this.dispatch(setError('No se pudo conectar'));
  }

  private handleConnectionError(): void {
    this.bleService.stopScan();
    this.dispatch(setLoading(false));
    this.dispatch(setError('Error de conexión'));
    this.dispatch(setScanning(false));
  }

  private handleExchangeError(): void {
    this.dispatch(setScanning(false));
    this.dispatch(setError('Error al intercambiar datos'));
  }

  private setupScanTimeout(): void {
    setTimeout(() => {
      this.dispatch(setScanning(false));
      this.dispatch(setLoading(false));
      this.bleService.stopScan();
    }, BleConfig.SCAN_TIMEOUT);
  }
}