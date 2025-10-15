
import {configureStore} from '@reduxjs/toolkit';
import bleReducer from './slices/bleSlice';

export const store = configureStore({
  reducer: {
    ble: bleReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ble/setConnectedDevice', 'ble/addDevice'],
        ignoredPaths: ['ble.connectedDevice', 'ble.allDevices', 'ble.bleManager'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;