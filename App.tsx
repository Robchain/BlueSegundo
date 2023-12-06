import React from 'react'
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import useBLE from './useBle'

export const App = () => {
  const {width} = useWindowDimensions()
  const {allDevices,connectedDevice,disconnectFromDevice,scanForPeripherals,connectToDevice,requestPermissions} = useBLE();

  const scandevices =async ()=>{
    requestPermissions((permitido:boolean)=>{
      if(permitido){
        scanForPeripherals();
      }
    })
  }
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
    <View style={styles.seccionBoton}>
    <Pressable 
    style={({pressed})=>[
        {...styles.boton, width:width*0.6},

        pressed && styles.botonPressed
    ]}  
  onPress={scandevices}
    >
        <Text style={{textAlign:'center',fontSize:20,color: Platform.OS === 'android' ? 'white': 'white'}}>Buscar</Text>
    </Pressable>
    </View>
      <View style={styles.arriba}>
        <Text>
          Listado de Dispositivos...
        </Text>
        {allDevices.map(i=>(
          <Pressable    style={({pressed})=>[
            {...styles.boton, width:width*0.4, marginBottom:10},
    
            pressed && styles.botonPressed
        ]}
        onPress={()=>connectToDevice(i)}  >
             <Text>
          {i.name}
        </Text>
        <Text>
          {i.rssi}
        </Text>
        <Text>
          {i.id}
        </Text>
          </Pressable>
        ))}
      </View>
  { connectedDevice  !== null && <View>
    <Pressable
     style={({pressed})=>[
      {...styles.boton, width:width*0.4, marginBottom:10},

      pressed && styles.botonPressed
  ]}
  onPress={disconnectFromDevice}
    >
      <Text style={{color:'white', textAlign:'center'}}>Desconetar</Text>
    </Pressable>
    {/* <Pressable
     style={({pressed})=>[
      {...styles.boton, width:width*0.4, marginBottom:10},

      pressed && styles.botonPressed
  ]}
  onPress={()=>exchangeData(connectedDevice)}
    >
      <Text style={{color:'white', textAlign:'center'}}>Enviar mensaje de prueba</Text>
    </Pressable> */}
  </View>}
  
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#f2f2f2',
    flexDirection:'column',
    padding:10
  },
  arriba:{
marginVertical:10
  },
  seccionBoton:{
   alignSelf:'center',
  }
  ,boton:{
    paddingHorizontal:10,
    paddingVertical:10,
    backgroundColor: Platform.OS === 'android' ? '#5856D6' :'#5856D6',
    borderRadius:10,
},
botonPressed:{
    backgroundColor:Platform.OS === 'android' ? '#4746AB':'#4746AB',
}
})