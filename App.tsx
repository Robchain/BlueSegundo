import React, {useEffect} from 'react';
import {Platform, SafeAreaView} from 'react-native';
import {Provider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import IonIcon from 'react-native-vector-icons/Ionicons';
import SplashScreen from 'react-native-splash-screen';
import {MainScreen} from './src/screen/MainScreen';
import {store} from './store';

export const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      SplashScreen.hide();
    }
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider
        settings={{
          icon: props => <IonIcon {...props} />,
        }}>
        <SafeAreaView style={{flex: 1}}>
          <MainScreen />
        </SafeAreaView>
      </PaperProvider>
    </Provider>
  );
};