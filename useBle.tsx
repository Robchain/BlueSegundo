/* eslint-disable no-bitwise */
import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  ScanOptions,
} from 'react-native-ble-plx';
import {atob, btoa} from 'react-native-quick-base64';
// import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
// import DeviceInfo from 'react-native-device-info';

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
  connectToDevice: (deviceId: Device) => Promise<Device | undefined>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
  response:string|null;
  loading:boolean;
  status:string|null;
  bloqueadoM:boolean;
  desable:boolean;
  texto:string;
  error:boolean;
  setresponse:React.Dispatch<React.SetStateAction<string | null>>;
  setTexto:React.Dispatch<React.SetStateAction<string>>;
  conectado:boolean;
  bleManager:BleManager;
  setBloqueadoM:React.Dispatch<React.SetStateAction<boolean>>;
  setloading:React.Dispatch<React.SetStateAction<boolean>>;
  setError:React.Dispatch<React.SetStateAction<boolean>>;
  exchangeData(
    device: Device,
  ): Promise<void>;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [status, setstatus] = useState<string|null>('');
  
  const [error, setError] = useState<boolean>(false);
  const [bloqueadoM, setBloqueadoM] = useState<boolean>(false);
  const [buffer, setbuffer] = useState('');
  const [texto, setTexto] = useState<string>('0952815595');
  // const [texto, setTexto] = useState<string>('1001002433');
  const [conectado, setconectado] = useState<boolean>(false)
  const [pase, setpase] = useState('second')
  const [desable, setdesable] = useState<boolean>(false);
  const [response, setresponse] = useState<string |null>('');
  const [loading, setloading] = useState<boolean>(false);
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



  const scanForPeripherals = () =>{
    setAllDevices([]);
    bleManager.startDeviceScan(null, null, (error, device) => {
      setError(false);
      if (error) {
        console.log('no se pudo conectar');
        bleManager.stopDeviceScan();
        setAllDevices([])
        setBloqueadoM(false);
        setloading(false);
        setError(true);
      }


      console.log('buscando...');
      setBloqueadoM(true);
      setloading(true);

     

      if (device && device?.name) {
        setloading(false);
        if(device.name ==="MXCHIP_EMB1061" && device.rssi!=null){
          if(device.rssi > -55) {
            setAllDevices((prevState: Device[]) => {  
              if (!isDuplicteDevice(prevState, device)) {
                return [...prevState, device];
              }
              return prevState;
            });
            //coneccion en sistemas IOS
            if(Platform.Version<'16' &&Platform.Version > '14'  && Platform.OS==='ios'){
              console.log('version 15 o menores');
              setloading(false);
              
              device.connect().then((device)=>{ // conecta al dispositivo
                setloading(false);
              setConnectedDevice(device);//setea la conecxion
              setconectado(true);
              return device.discoverAllServicesAndCharacteristics(); // busca todas las caracteristicas
            }).then((device) =>{
              exchangeData(device).catch(
                ()=>{ setBloqueadoM(false);console.log('error en conectividad - ios version 15 o menores');}                
              ) //manda informacion
            }).catch(()=>{
              bleManager.stopDeviceScan();
              setconectado(false);
                console.log('fallo')
                setloading(false);
                setError(true);
                setBloqueadoM(false);
            } // en caso de fallar la coneccion
            );
            }else if(Platform.Version >= '16'&& Platform.OS==='ios'){
              // coneccion
              setloading(false);
              if(allDevices.length>0){
              console.log('version 16 o mayores');
              device.connect().then((device)=>{
                setConnectedDevice(device);
              console.log('conectado en 16')
                return device.discoverAllServicesAndCharacteristics();
              }).then(dev=>{
                exchangeData(dev)
              }).catch(
                ()=>{
                  setconectado(false);
                  bleManager.stopDeviceScan();
                  console.log('error en 16 o mayores')
                  setBloqueadoM(false);
                }
              )

            }    
          }else if(Platform.OS === 'android'){
            console.log('android prueba');
              device.connect().then((device)=>{ // conecta al dispositivo
              setConnectedDevice(device);//setea la conecxion
              console.log('Conectando');
              setconectado(true);
              setloading(false);
              return device.discoverAllServicesAndCharacteristics(); // busca todas las caracteristicas
            }).then((device) =>{
              exchangeData(device) //manda informacion
            }).catch(()=>{
              bleManager.stopDeviceScan();
              setError(true);
                console.log('fallo')
                setconectado(false);
                setloading(false);
                setBloqueadoM(false);
            } // en caso de fallar la coneccion
            );
          }
          }
        }
      }

    });
    
  }




  const connectToDevice = async (device: Device) => {
    try {
      setresponse('');
      console.log("contectar")
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      return deviceConnection;
    } catch (e) {
      bleManager.stopDeviceScan();
      console.log('Fallo y se dejo de escanear');
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      console.log('desconectado');
      setdesable(false);
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
    
    try {
      setloading(false);
      setExchangeError(null);
      setdesable(true);
      setresponse('');
   setpase('');
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        device.id,
        SERVICE_UUID,
        WRITE_UUID,
        btoa('mm'+texto),
      )

      setTimeout(() => {
     bleManager.readCharacteristicForDevice(
          device.id,
          SERVICE_UUID,
          READ_UUID,
        ).then(res=>{
          let output =atob(res.value!)
          setresponse(output);
          setpase('pase');
          setdesable(false);
        })  
      }, 3000);
      
      setTimeout(() => {
        bleManager.cancelDeviceConnection(device.id);
      setConnectedDevice(null);
      console.log('desconectadoNuevo');
      setloading(false);
      setdesable(false);
      setconectado(false);
      setBloqueadoM(false);
      setError(false);
      bleManager.stopDeviceScan();
         }, 3500);
    } catch (e) {
      console.log('fallo en enviar');
      setBloqueadoM(false);
    }
  };
  

  const startStreamingData = async (device: Device) => {
    if (device) {
      console.log('STREAMINGSTART')
      device.monitorCharacteristicForService(
         SERVICE_UUID,
     READ_UUID ,
        (error, characteristic) => onHeartRateUpdate(error, characteristic),
      );
    } else {
      console.log('adasda');
    }
  };

//  function scanAndConnect() {
//     console.log("Scanning Started");
//     bleManager.startDeviceScan(null, null, (error, device) => {
//     if (error) {
//       // Handle error (scanning will be stopped automatically)
//      console.log("Error in scanning devices:", error);
//      return
//      }
//        // Check if it is a device you are looking for based on advertisement data
//        // or other criteria.
//       console.log("Detected Device Details:", device?.id, device?.name);
//        // ||device.localName === 'BLEPeripheralApp') 
//        if (device?.name === 'Versa Lite'){ //
//           // Stop scanning as it's not necessary if you are scanning for one device.
//           console.log("Device Found, Stopping the Scan.");
//           console.log("Connecting to:",device?.name)
//           bleManager.stopDeviceScan();
//           device?.connect()
//           .then((device) => {
//            // this.info("Discovering services and characteristics")
//            console.log("Connected...Discovering services and characteristics");
//          return device.discoverAllServicesAndCharacteristics()
//        })
//       .then((device) => {
//         console.log('Services and characteristics discovered');
//         //return this.testChar(device)
//         const services = device.services()
//         console.log(services);
//         return device.readCharacteristicForService(services)
//         // device.readCharacteristicForService("abbaff00-e56a-484c-b832-8b17cf6cbfe8")
//         // this.info("Setting notifications")
//         //return this.setupNotifications(device)
//       })
//       .then(() => {
//         const characteristicsData =  device.readCharacteristicForService();
//         console.log(characteristicsData);
//         //this.info("Listening...")
//       }, (error) => {
//         console.warn(error.message);
//         // this.error(error.message)
//         })
//        }
//      });
//     }
 
  return {status,desable,response,
    setresponse,
    exchangeData,loading,
    scanForPeripherals,
    requestPermissions,
    conectado,
    connectToDevice,
    allDevices,
    connectedDevice,
    error,
    disconnectFromDevice,
    heartRate,
    bleManager,
    texto, setTexto,
    bloqueadoM,  setBloqueadoM,setloading,setError
  };
}

export default useBLE;


