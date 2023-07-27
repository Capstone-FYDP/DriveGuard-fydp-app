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

const App = () => {
  const context = useContext(MainContext);
  const [text, setText] = useState('Start');
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

  // const camera = useRef<Camera>(null)
  const devices = useCameraDevices()
  const device = devices.front

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

  const processFrame = async (base64) => {
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify(
          { "image": base64 }
        )
      });

      const json = await response.json();
      if (json['classification'] != "safe driving" && json['classification'] != classRef.current) {
        setIncidentCoordinates([
          ...incidentCoordinatesRef.current,
          {
            latitude: locationRef.current.coords.latitude,
            longitude: locationRef.current.coords.longitude,
          },
        ]);
        addIncident(json['classification'], base64)
        setClassification(json['classification'])
      }
      } catch (error) {
        console.error(error);
      }
  }
  const processFrameJS = Worklets.createRunInJsFn(processFrame)

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
      runAtTargetFps(1, () => {
        'worklet'
        const result = toBase64(frame)
        processFrameJS(result[0])
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
      setText("End")
      setButtonLoading(false);

    } catch (error) {
      console.error(error);
      setButtonLoading(false);
    }
  };

  const endSession = async () => {
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
        setText(json.success);
        setSessionId(null)
      }

      setText("Start")
      setButtonLoading(false);
    } catch (error) {
      console.error(error);
      setButtonLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.createContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
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
                />
              })
            }
          <Polyline coordinates={routeCoordinates} strokeWidth={5} />
        </MapView>
        {isFocused && (device != null) && hasCameraPermissions &&
          <Camera 
            isActive={true}
            device={device}
            style={styles.cameraStyle}
            preset="vga-640x480"
            frameProcessor={sessionId != null ? frameProcessor : null}
          />
        }
      <CustomButton
            type='emphasized'
            text={
              buttonLoading ? (
                <LoadingIndicator color="white" isAnimating={true} />
              ) : (
                text
              )
            }
            onPress={text == "Start" ? createSession : endSession}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    backgroundColor: '#fffbf6',
  },
  mapStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    width: 50,
    height: 50,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#3f2021',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'space-evenly',
    alignSelf: 'center',
    width: '85%',
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
    backgroundColor: 'blue',
  },
});

export default App;