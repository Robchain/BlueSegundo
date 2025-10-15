import React, {useEffect, useMemo} from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {BleManager} from 'react-native-ble-plx';
import logoEsasy from '../images/easyMarkLogo.jpeg';
import {RootState, AppDispatch} from '../../store';
import {setError, setResponse} from '../../store/slices/bleSlice';
import {PermissionService} from '../../domain/services/PermissionService';
import {BleService} from '../../domain/services/BleService';
import {BleUseCase} from '../../domain/useCases/BleUseCase';
import {formatearTexto} from '../helpers';
import {BleConfig} from '../../domain/config/BleConfig';

const bleManager = new BleManager();

export const MainScreen = () => {
  const {width} = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();

  const {
    userText,
    response,
    error,
    isScanning,
    isConnected,
    isLoading,
  } = useSelector((state: RootState) => state.ble);

  const bleUseCase = useMemo(() => {
    const bleService = new BleService(bleManager);
    return new BleUseCase(bleService, dispatch);
  }, [dispatch]);

  const handleScan = async () => {
    const hasPermission = await PermissionService.requestBluetoothPermissions();
    if (hasPermission) {
      bleUseCase.startScan(userText);
    }
  };

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        dispatch(setResponse(null));
      }, BleConfig.RESPONSE_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [response, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(setError(null));
      }, BleConfig.ERROR_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const isButtonDisabled = userText.length < 10 || isScanning;

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <View style={styles.textoCabecera}>
          <Text style={styles.styleTextCabecera}>ASISTENCIA LINKS</Text>
        </View>
        <View>
          <Image style={styles.logoStyle} source={logoEsasy} />
        </View>
      </View>

      <View style={styles.contenedorContenido}>
        <View style={styles.miInformacion}>
          <Text style={styles.textoMiInformacionTitulo}>{userText}</Text>
          <Pressable>
            <Icon name="options-outline" size={30} />
          </Pressable>
        </View>

        <View
          style={[
            styles.lineaEstado,
            {backgroundColor: isConnected ? '#35FF69' : '#C3FDF7'},
          ]}
        />

        <View style={styles.seccionBoton}>
          <Pressable
            style={({pressed}) => [
              styles.boton,
              {width: width * 0.6},
              pressed && styles.botonPressed,
              isButtonDisabled && styles.botonDisabled,
            ]}
            onPress={handleScan}
            disabled={isButtonDisabled}>
            <Text style={styles.textoBoton}>
              {isLoading ? 'MARCANDO...' : 'MARCAR'}
            </Text>
          </Pressable>
        </View>

        {response && (
          <View style={styles.marcacionContenedor}>
            <Text style={styles.textoMarcacion}>
              {formatearTexto(response)}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.marcacionContenedor}>
            <Text style={styles.textoError}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  textoCabecera: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  styleTextCabecera: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
  },
  logoStyle: {
    width: 120,
    height: 60,
  },
  contenedorContenido: {
    flex: 1,
  },
  lineaEstado: {
    width: 'auto',
    height: 20,
  },
  marcacionContenedor: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  textoMarcacion: {
    fontSize: 16,
    color: '#000',
  },
  textoError: {
    fontSize: 16,
    color: 'red',
  },
  miInformacion: {
    marginHorizontal: 10,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textoMiInformacionTitulo: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  seccionBoton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  boton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: Platform.OS === 'android' ? '#5856D6' : '#5856D6',
    borderRadius: 10,
  },
  botonPressed: {
    backgroundColor: Platform.OS === 'android' ? '#4746AB' : '#4746AB',
  },
  botonDisabled: {
    backgroundColor: '#8786d4',
  },
  textoBoton: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
});