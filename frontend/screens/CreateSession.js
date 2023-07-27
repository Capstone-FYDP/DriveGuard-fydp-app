import React, { useState, useEffect, useContext, useCallback } from 'react';
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

const App = () => {
  const context = useContext(MainContext);
  const [text, setText] = useState('Message Prompt');
  const [sessionId, setSessionId] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [hasCameraPermissions, setHasCameraPermissions] = useState(false);
  const isFocused = useIsFocused();

  const devices = useCameraDevices()
  const device = devices.front

  const processFrame = async (base64) => {
    //console.log(frame.toString())
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ "image": base64 })
      });

      const json = await response.json();
      setText(`Class: ${json['classification']}, Conf: ${json['confidence']}`);

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

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (e) {
      console.log(e);
    }
  };

  const createSession = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus()
    if (cameraPermission != "authorized") {
      const newCameraPermission = await Camera.requestCameraPermission()
      if (newCameraPermission == "denied") {
        setHasCameraPermissions(false)
        Toast.show({
          text1: 'Error',
          text2: "Camera permission not granted. Please go to settings and allow camera permissions for this app.",
          type: 'error',
        });
        return
      }
    }
    if (!hasCameraPermissions) {
      setHasCameraPermissions(true)
    }
    setStartLoading(true);
    //TODO: need to pass the image url for the request body
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ "image": "http://driving_image_url" })
      });

      const json = await response.json();
      setSessionId(json.message);
      setText("Start Driving Session");
      setStartLoading(false);

    } catch (error) {
      console.error(error);
      setStartLoading(false);
    }
  };

  const endSession = async () => {
    setStopLoading(true);
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
      }

      setText("Ended Driving Session");
      setStopLoading(false);
    } catch (error) {
      console.error(error);
      setStopLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.createContainer}>
      <ScrollView>
        <View style={styles.upperContainer}>
          <View style={styles.textWrapper}>
            <Text style={styles.headerTitle}>Start Session</Text>
          </View>
          {isFocused && (device != null) && hasCameraPermissions &&
            <Camera 
              device={device}
              style={styles.cameraStyle}
              isActive={true}
              preset="vga-640x480"
              frameProcessor={frameProcessor}
            />
          }
        </View>

        <View style={styles.item}>
          <Text style={styles.title}>{text}</Text>
        </View>

        <CustomCard
          outerStyle={styles.lowerOuterContainer}
          innerStyle={styles.lowerInnerContainer}
          noTouchOpacity
        >
          <View style={styles.buttonsContainer}>
            <CustomButton
              type='emphasized'
              text={
                startLoading ? (
                  <LoadingIndicator color="white" isAnimating={true} />
                ) : (
                  'Start'
                )
              }
              onPress={createSession}
            />
            <CustomButton 
              type='emphasized'
              text={
                stopLoading ? (
                  <LoadingIndicator color="white" isAnimating={true} />
                ) : (
                  'Stop'
                )
              }
              onPress={endSession}
            />
          </View>
        </CustomCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    backgroundColor: '#fffbf6',
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
    width: '85%',
    height: 300,
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