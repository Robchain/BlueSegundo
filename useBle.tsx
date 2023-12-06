/* eslint-disable no-bitwise */
import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {atob, btoa} from 'react-native-quick-base64';
// import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
// import DeviceInfo from 'react-native-device-info';

// import {atob} from 'react-native-quick-base64';
const SERVICE_UUID = '1b7e8251-2877-41c3-b46e-cf057c562023';
const READ_UUID = '8ac32d3f-5cb9-4d44-bec2-ee689169f626';
const WRITE_UUID = '5e9bf2a8-f93f-4481-a67e-3b2f4a07891a';

const HEART_RATE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
  exchangeData(
    device: Device,
  ): Promise<void>;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [exchangeError, setExchangeError] = useState<BleError | null>(null);
  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'Bluetooth Low Energy requires Location',
              buttonNeutral: 'Ask Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          cb(granted === PermissionsAndroid.RESULTS.GRANTED);
    //   const apiLevel = await DeviceInfo.getApiLevel();

    //   if (apiLevel < 31) {
    //     const granted = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //       {
    //         title: 'Location Permission',
    //         message: 'Bluetooth Low Energy requires Location',
    //         buttonNeutral: 'Ask Later',
    //         buttonNegative: 'Cancel',
    //         buttonPositive: 'OK',
    //       },
    //     );
    //     cb(granted === PermissionsAndroid.RESULTS.GRANTED);
    //   } else {
    //     const result = await requestMultiple([
    //       PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    //       PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    //       PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    //     ]);

    //     const isGranted =
    //       result['android.permission.BLUETOOTH_CONNECT'] ===
    //         PermissionsAndroid.RESULTS.GRANTED &&
    //       result['android.permission.BLUETOOTH_SCAN'] ===
    //         PermissionsAndroid.RESULTS.GRANTED &&
    //       result['android.permission.ACCESS_FINE_LOCATION'] ===
    //         PermissionsAndroid.RESULTS.GRANTED;

    //     cb(isGranted);
    //   }
    } else {
      cb(true);
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
  setAllDevices([]);
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device?.name) {
        setAllDevices((prevState: Device[]) => {  
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  };

  const onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was recieved');
      return -1;
    }

    const rawData = atob(characteristic.value);
    let innerHeartRate: number = -1;

    const firstBitValue: number = Number(rawData) & 0x01;

    if (firstBitValue === 0) {
      innerHeartRate = rawData[1].charCodeAt(0);
    } else {
      innerHeartRate =
        Number(rawData[1].charCodeAt(0) << 8) +
        Number(rawData[2].charCodeAt(2));
    }

    setHeartRate(innerHeartRate);
  };

  const exchangeData = async (
    device: Device,
  ) => {
    setExchangeError(null);

    try {
      await bleManager.writeCharacteristicWithResponseForDevice(
        device.id,
        SERVICE_UUID,
        WRITE_UUID,
        btoa('Mensaje de prueba' +'\n'),
      );
    } catch (e) {
      console.log(e);
    }
  };
  

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC,
        (error, characteristic) => onHeartRateUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    exchangeData,
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    heartRate,
  };
}

export default useBLE;