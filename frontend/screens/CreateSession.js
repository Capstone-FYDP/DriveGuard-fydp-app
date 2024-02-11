import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useCameraDevices, useFrameProcessor, Camera, runAtTargetFps } from 'react-native-vision-camera';
import { StyleSheet, Text, View, SafeAreaView, Button, ScrollView, Image } from 'react-native';
import CustomButton from '../components/button/custom-button';
import CustomCard from '../components/card/custom-card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { MainContext } from '../context/MainContext';
import LoadingIndicator from '../components/loadingIndicator/loadingIndicator';
import { useIsFocused } from '@react-navigation/native';
import { CardAnimationContext } from '@react-navigation/stack';
import { toBase64 } from '../frame-processors/DistractedDrivingFrameProcessorPlugin';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import IconBadge from '../components/iconBadge/custom-iconBadge';
import { capitalize } from 'validate.js';
import { mapClassToLabel } from '../utils/string-utils';

const App = () => {
  const context = useContext(MainContext);
  const [button, setButton] = useState('play');
  const [sessionId, setSessionId] = useState(null);
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId
  const [buttonLoading, setButtonLoading] = useState(false);
  const [hasCameraPermissions, setHasCameraPermissions] = useState(false);
  const [classification, setClassification] = useState("")
  const classRef = useRef(classification)
  classRef.current = classification
  const isFocused = useIsFocused();

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const routeCoordinatesRef = useRef(routeCoordinates)
  routeCoordinatesRef.current = routeCoordinates
  const [incidentCoordinates, setIncidentCoordinates] = useState([]);
  const incidentCoordinatesRef = useRef(incidentCoordinates);
  incidentCoordinatesRef.current = incidentCoordinates;
  const [location, setLocation] = useState(false);
  const locationRef = useRef(location);
  locationRef.current = location;

  const [base64, setBase64] = useState(null);

  // const camera = useRef<Camera>(null)
  const devices = useCameraDevices()
  const device = devices.front
  // const camera1 = useRef<Camera>(null)

  useEffect(() => {
    (async () => {
      let cameraStatus = await Camera.getCameraPermissionStatus()
      if (cameraStatus != 'authorized') {
        cameraStatus = await Camera.requestCameraPermission()
        if (cameraStatus == "denied") {
          Toast.show({
            text1: 'Error',
            text2: "Camera permission not granted. Please go to settings and allow camera permissions for this app.",
            type: 'error',
          });
        }
      }
      if (cameraStatus == 'authorized') {
        setHasCameraPermissions(true)
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          text1: 'Error',
          text2: "Permission to access location was denied",
          type: 'error',
        });
      } else {
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setLocation(location);
            if (sessionIdRef.current != null) {
              setRouteCoordinates([
                ...routeCoordinatesRef.current,
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                },
              ]);
            }
          }
        );
      }
      return () => locationSubscription.remove();
    })();
  }, []);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (e) {
      console.log(e);
    }
  };

  const processFrame = async (classif) => {
    //setBase64(base64)
    classif = mapClassToLabel(classif)
    try {
      if (classif != "None" && classif != classRef.current) {
        setIncidentCoordinates([
          ...incidentCoordinatesRef.current,
          {
            latitude: locationRef.current.coords.latitude,
            longitude: locationRef.current.coords.longitude,
          },
        ]);
        addIncident(classif, base64)
        setClassification(classif)
        Toast.show({
          text1: classif,
          type: 'error',
          autoHide: false,
        });
      } else if (classif == "None") {
        Toast.hide();
      }
    } catch (error) {
      console.error(error);
    }
  }
  const processFrameJS = Worklets.createRunInJsFn(processFrame)

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
      runAtTargetFps(2, () => {
        'worklet'
        let cur = new Date();
        const result = toBase64(frame)
        let end = new Date();
        console.log(end - cur);
        if (result[0] != null) {
          console.log(result[0])
        } else if (result[1] != null) {
          console.log(`class: ${result[1]}, score: ${result[2]}`)
          processFrameJS(result[1])
        }
      })
  }, [])

  const addIncident = async (classification, base64) => {
    try {
      const token = await getToken();
      await fetch(context.fetchPath + `api/addIncident`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({
          "classification": classification,
          "image": base64,
          "session_id": sessionIdRef.current,
        })
      });
    } catch (error) {
      console.error(error);
    }
  }

  const createSession = async () => {
    setButtonLoading(true);
    setIncidentCoordinates([]);
    setRouteCoordinates([]);
    //TODO: need to pass the image url for the request body
    //const photo = await camera.current.takePhoto()
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({
          "image": "http://driving_image_url"
        })
      });

      const json = await response.json();
      setSessionId(json.message);
      setButton("stop")
      setButtonLoading(false);

    } catch (error) {
      console.error(error);
      setButtonLoading(false);
    }
  };

  const endSession = async () => {
    Toast.hide()
    setButtonLoading(true);
    try {
      const token = await getToken();

      const response = await fetch(
        context.fetchPath + `api/endSession/${sessionId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        }
      );

      const json = await response.json;

      if (json.message) {
        Toast.show({
          text1: 'Error',
          text2: json.message,
          type: 'error',
        });
      } else {
        setSessionId(null)
      }

      setButton("play")
      setButtonLoading(false);
    } catch (error) {
      console.error(error);
      setButtonLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.createContainer}>
        <MapView
          style={styles.mapStyle}
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: 43.4729452,
            longitude: -80.5321545,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          showsUserLocation
          followsUserLocation
          loadingEnabled
        >
          {
            incidentCoordinates.map( coordinates => {
              return <Marker
                coordinate={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }}
                pinColor="red"
              />
            })
          }
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor={context.primaryColour}/>
        </MapView>
        {isFocused && (device != null) && hasCameraPermissions &&
          <View style={styles.cameraStyle}>
            <Camera 
              // ref={camera}
              // photo={true}
              isActive={true}
              device={device}
              style={styles.camera}
              preset="cif-352x288"
              frameProcessor={sessionId != null ? frameProcessor : null}
            />
            {base64 != null && <Image style={styles.imageStyle} resizeMode='contain' source={{uri: `data:image/jpeg;base64,${base64}`}}/>}
          </View>
        }
        <View style={styles.startButton}>
          <View style={styles.semiCircleWrapper}>
            <View style={[styles.semiCircle, {backgroundColor: context.primaryColour}]} />
          </View>
          <View style={[styles.rectangle, {backgroundColor: context.primaryColour}]}>
          {buttonLoading ? (
                <LoadingIndicator color={'white'} isAnimating={true} />
                ) : (
                  <IconBadge 
                    color = {"white"}
                    onPress={button == "play" ? createSession : endSession}
                    library="FontAwesome"
                    icon={button}
                    size={30}
                  />
            )}
          </View>
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createContainer: {
    position: "absolute",
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
    flex: 1,
    alignItems: "center",
    backgroundColor: '#fffbf6',
  },
  mapStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hud: {
    bottom: 0,
  },
  item: {
    padding: 60,
    marginVertical: 30,
    alignSelf: 'center',
    height: '30%',
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    color: '#EF5350',
    fontWeight: '500',
  },
  upperContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  textWrapper: {
    width: '85%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  cameraStyle: {
    position: "absolute",
    width: 224,
    height: 224,
    bottom: 0,
    right: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "white",
  },
  imageStyle: {
    position: "absolute",
    width: 300,
    height: 400,
    bottom: 0,
    right: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "white",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#3f2021',
  },
  lowerOuterContainer: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    margin: 0,
    paddingVertical: 40,
    paddingHorizontal: 20,
    elevation: 2,
  },
  lowerInnerContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 400,
  },
  startButton: {
    position: "absolute",
    width: 75,
    bottom: 0,
  },
  rectangle: {
    width: "100%",
    height: 50,
  },
  semiCircleWrapper: {
    width: "100%", // half of the image width
    height: 25,
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  semiCircle: {
    width: "100%",
    height: 50,
    borderRadius: 125, // half of the image width
  },
});

export default App;