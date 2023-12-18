import React, { useEffect } from 'react'
import { Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import logoEsasy from "../images/easyMarkLogo.jpeg"
import useBLE from '../../useBle';
import Icon from 'react-native-vector-icons/Ionicons'
import { formatearTexto } from '../helpers';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { BleManager } from 'react-native-ble-plx';
export const MainScreen = () => {
  const {width} = useWindowDimensions()
  const {error, bleManager, setBloqueadoM,setloading,setError,allDevices,bloqueadoM,connectedDevice,desable,disconnectFromDevice,scanForPeripherals,connectToDevice,requestPermissions, exchangeData,response,status,setTexto,texto,conectado,setresponse,loading} = useBLE();


  const scandevices =async ()=>{
    requestPermissions((permitido:boolean)=>{
      if(permitido){
        scanForPeripherals();
        console.log('comienza')
      }
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setresponse('');
    }, 5000);
  }, [response])

  useEffect(() => {
    setTimeout(() => {
      setError(false);
    }, 5000);
  }, [error])
  
  useEffect(() => {
    setTimeout(() => {
      if(bloqueadoM ===true){
      setBloqueadoM(false);
      setloading(false);
      console.log('dejo de buscar...');
      // setError(true);
      bleManager.stopDeviceScan();
    }
    }, 15000);
  }, [bloqueadoM])
  
  return (
    <View style={style.pantalla}>
<View style={style.cabecera}>
  <View style={style.textoCabecera}>
  <Text style={style.styleTextCabecera}>ASISTENCIA LINKS</Text>
  </View>
  <View>
     <Image style={style.logoStyle} source={logoEsasy}/>
  </View>
  {/* fin de la cabecera */}
</View>
{/* contenido */}
<View style={style.contenedorContenido}>
<View style={style.miInforacion}>
<Text style={style.textoMiInformacionTitulo}>
{texto}
</Text>
<Pressable>
  <Icon name='options-outline' size={30}/>
</Pressable>
</View>

  <View style={{...style.lineaEstado, backgroundColor:conectado ? '#35FF69':'#C3FDF7'}}/>
  <View style={style.seccionBoton}>
  <Pressable 
    style={({pressed})=>[
        {...style.boton, width:width*0.6},
        pressed && style.botonPressed,

        (texto.length<10 || bloqueadoM) &&{backgroundColor:'#8786d4'}
    ]}  
  onPress={()=>{scandevices()}}
  disabled={bloqueadoM}
    >
        <Text style={{textAlign:'center',fontSize:20,color: Platform.OS === 'android' ? 'white': 'white'}}>MARCAR
        {/* {loading && <ActivityIndicator animating={loading} color={MD2Colors.amber100} /> } */}
        </Text>
    </Pressable>
  </View>
  {response?.length!>0 && <View style={style.MarcacionContenedor}>
  <Text style={style.textoMaracion}>
    {formatearTexto(response!)}
  </Text>
  </View>}
  {
    error &&<View style={style.MarcacionContenedor} >
      <Text style={{color:'red'}}>Error, vuelva a intentarlo</Text>
    </View>
  }
 
</View>


{/* fin contenido */}
    </View>
  )
}


const style= StyleSheet.create({
  pantalla:{
flex:1
  },
  textoCabecera:{
    justifyContent:'center',
    paddingLeft:10,
  },
  styleTextCabecera:{
fontSize:16,
fontWeight:'bold'
  },
  cabecera:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:"#f2f2f2"
  },
  logoStyle:{
    width:120,
    height:60
  },
  
  seccionBoton:{
   alignSelf:'center',
   marginTop:10
  }
  ,boton:{
    paddingHorizontal:10,
    paddingVertical:10,
  backgroundColor: Platform.OS === 'android' ? '#5856D6' :'#5856D6',
    borderRadius:10,
},
botonPressed:{
    backgroundColor:Platform.OS === 'android' ? '#4746AB':'#4746AB'
},contenedorContenido:{
  
},lineaEstado:{
  width:'auto',
  height:20
},
MarcacionContenedor:{
marginTop:10,
marginHorizontal:10,
},
textoMaracion:{
  fontSize:16,
},
miInforacion:{
marginHorizontal:10,
marginVertical:20,
flexDirection:'row',
justifyContent:'space-between'
},
textoMiInformacionTitulo:{
fontWeight:'bold'
}
})

