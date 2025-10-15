import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Device} from 'react-native-ble-plx';

interface BleState {
  allDevices: Device[];
  connectedDevice: Device | null;
  isScanning: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  response: string | null;
  userText: string;
}

const initialState: BleState = {
  allDevices: [],
  connectedDevice: null,
  isScanning: false,
  isConnected: false,
  isLoading: false,
  error: null,
  response: null,
  userText: '0952815595',
};

const bleSlice = createSlice({
  name: 'ble',
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<Device>) => {
      const exists = state.allDevices.some(d => d.id === action.payload.id);
      if (!exists) {
        state.allDevices.push(action.payload);
      }
    },
    clearDevices: state => {
      state.allDevices = [];
    },
    setConnectedDevice: (state, action: PayloadAction<Device | null>) => {
      state.connectedDevice = action.payload;
      state.isConnected = action.payload !== null;
    },
    setScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setResponse: (state, action: PayloadAction<string | null>) => {
      state.response = action.payload;
    },
    setUserText: (state, action: PayloadAction<string>) => {
      state.userText = action.payload;
    },
    resetBleState: () => initialState,
  },
});

export const {
  addDevice,
  clearDevices,
  setConnectedDevice,
  setScanning,
  setLoading,
  setError,
  setResponse,
  setUserText,
  resetBleState,
} = bleSlice.actions;

export default bleSlice.reducer;