import React, {useState } from 'react'
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native'
import useBLE from '../../useBle'


export const App = () => {
  const {width} = useWindowDimensions()
  const [continuar, setcontinuar] = useState<boolean>(false)
  const {allDevices,connectedDevice,desable,disconnectFromDevice,scanForPeripherals,connectToDevice,requestPermissions, exchangeData,response,status,setTexto,texto} = useBLE();

  const scandevices =async ()=>{
    requestPermissions((permitido:boolean)=>{
      if(permitido){
        scanForPeripherals();
        console.log('comienza')
      }
    })
  }
  const guardado = () => {
      
    console.log('Texto guardado:', texto);
  };
  
  
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
    <View style={styles.seccionBoton}>
    <Pressable 
    style={({pressed})=>[
        {...styles.boton, width:width*0.6},

        pressed && styles.botonPressed,
        texto.length<10 &&{backgroundColor:'#8786d4'}
    ]}  
  onPress={()=>{scandevices()}}
  disabled={texto.length<10}
    >
        <Text style={{textAlign:'center',fontSize:20,color: Platform.OS === 'android' ? 'white': 'white'}}>Registrar</Text>
    </Pressable>
    </View>
      <View>
      <Text>
        Mi texto: {texto}
      </Text>
      </View>
      <View>
        <Text>
          Version de Ios: {Platform.Version}
        </Text>
        <Text>
          sistema operativo: {Platform.OS}
        </Text>
      </View>
      {
        connectedDevice !==null ?<View>
          <Text>Contectado</Text>
        </View>:<View><Text>No conectado</Text></View>
      }
  { connectedDevice  !== null && <View>
    <Pressable
    disabled={desable}
     style={({pressed})=>[
      {...styles.boton, width:width*0.4, marginBottom:10},
      pressed && styles.botonPressed
  ]}
  onPress={disconnectFromDevice}
    >
      <Text style={{color:'white', textAlign:'center'}}>Desconetar</Text>
    </Pressable>
    <Pressable
    disabled={desable}
     style={({pressed})=>[
      {...styles.boton, width:width*0.4, marginBottom:10},
      pressed && styles.botonPressed
  ]}
  onPress={()=>exchangeData(connectedDevice)}
    >
      <Text style={{color:'white', textAlign:'center'}}>Enviar mensaje de prueba</Text>
    </Pressable>
  </View>}
  <View>
    <Text>
      Escribir C.I.
    </Text>
      {/* Caja de texto */}
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, margin: 10, padding: 5 }}
        onChangeText={(nuevoTexto) => setTexto(nuevoTexto)}
        value={texto}
        placeholder="Escribe aquí"
      />
      {/* Botón para guardar */}
      <Pressable style={({pressed})=>[
        {...styles.boton, width:width*0.6},
        pressed && styles.botonPressed
    ]}    onPress={guardado} >
        <Text style={{textAlign:'center',fontSize:20,color: Platform.OS === 'android' ? 'white': 'white'}}>Guardar</Text>
      </Pressable>
    </View>
  {response!==null &&
    <View>
      <Text>{response}</Text>
    </View>
  }
     {status !=null &&<View>
      <Text>
        {status}
      </Text>
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
    backgroundColor:Platform.OS === 'android' ? '#4746AB':'#4746AB'
}})

