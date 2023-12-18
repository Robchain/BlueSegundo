
import React, { useEffect } from 'react'
import { Platform, SafeAreaView} from 'react-native'
import { MainScreen } from './src/screen/MainScreen'
import { PaperProvider } from 'react-native-paper'
import IonIcon from 'react-native-vector-icons/Ionicons';
import SplashScreen from 'react-native-splash-screen';
export const App = () => {

  useEffect(() => {
    
    if(Platform.OS ==='android') SplashScreen.hide()
  }, [])
  
  return (
    <PaperProvider settings={
      {icon:(props) =><IonIcon {...props}/>}
    }>
    <SafeAreaView style={{flex:1}}>
      <MainScreen/>
    </SafeAreaView>
    </PaperProvider>
  )
}
