import React, { useState, useEffect, useContext, useRef } from "react";
import {
  useCameraDevices,
  useFrameProcessor,
  Camera,
  runAtTargetFps,
} from "react-native-vision-camera";
import { StyleSheet, View, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { MainContext } from "../context/MainContext";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";
import { useIsFocused } from "@react-navigation/native";
import { CardAnimationContext } from "@react-navigation/stack";
import { toBase64 } from "../frame-processors/DistractedDrivingFrameProcessorPlugin";
import * as Location from "expo-location";
import IconBadge from "../components/iconBadge/custom-iconBadge";
import { capitalize } from "validate.js";
import { mapClassToLabel } from "../utils/string-utils";
import MapboxNavigation from "rnc-mapbox-nav";
import { getDistance } from "geolib";

const StartNewSession = ({ route, navigation }) => {
  const { destination } = route.params;
  const context = useContext(MainContext);
  //const [button, setButton] = useState('play');
  const [sessionId, setSessionId] = useState(null);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  //const [buttonLoading, setButtonLoading] = useState(false);
  const [hasCameraPermissions, setHasCameraPermissions] = useState(false);
  const [classification, setClassification] = useState("");
  const classRef = useRef(classification);
  classRef.current = classification;
  const isFocused = useIsFocused();

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const routeCoordinatesRef = useRef(routeCoordinates);
  routeCoordinatesRef.current = routeCoordinates;
  const [incidentCoordinates, setIncidentCoordinates] = useState([]);
  const incidentCoordinatesRef = useRef(incidentCoordinates);
  incidentCoordinatesRef.current = incidentCoordinates;
  const [location, setLocation] = useState(null);
  // const [destination, setDestination] = useState(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  const [base64, setBase64] = useState(null);

  // const camera = useRef<Camera>(null)
  const devices = useCameraDevices();
  const device = devices.front;
  // const camera1 = useRef<Camera>(null)
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    (async () => {
      let cameraStatus = await Camera.getCameraPermissionStatus();
      if (cameraStatus != "authorized") {
        cameraStatus = await Camera.requestCameraPermission();
        if (cameraStatus == "denied") {
          Toast.show({
            text1: "Error",
            text2:
              "Camera permission not granted. Please go to settings and allow camera permissions for this app.",
            type: "error",
          });
        }
      }
      if (cameraStatus == "authorized") {
        console.log("camera permission true");
        setHasCameraPermissions(true);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          text1: "Error",
          text2: "Permission to access location was denied",
          type: "error",
        });
      }
      console.log(status);
      if (status == "granted") {
        // console.log("Start Location")
        let location = await Location.getCurrentPositionAsync({});
        // console.log("End Location")

        setLocation([location.coords.longitude, location.coords.latitude]);
        console.log(location);
        // let dest = await Location.geocodeAsync("208 sunview");
        // setDestination([dest[0].longitude, dest[0].latitude]);
        // console.log(dest);
        console.log("Dest Route: ", destination);
        createSession();
      }
    })();
  }, []);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (e) {
      console.log(e);
    }
  };

  const processFrame = async (classif, base64) => {
    //setBase64(base64)
    classif = mapClassToLabel(classif);
    try {
      if (classif != "Safe driving" && classif != classRef.current) {
        setIncidentCoordinates([
          ...incidentCoordinatesRef.current,
          {
            latitude: locationRef.current[1],
            longitude: locationRef.current[0],
          },
        ]);
        addIncident(classif, base64);
        setClassification(classif);
        // Add an audio alert here
        Toast.show({
          text1: classif,
          type: "error",
          autoHide: false,
        });
        ///////////////////////////
      } else if (classif == "Safe driving") {
        Toast.hide();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const processFrameJS = Worklets.createRunInJsFn(processFrame);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAtTargetFps(2, () => {
        "worklet";
        let cur = new Date();
        const result = toBase64(frame);
        let end = new Date();
        console.log(`Image Processor and Classifier RTT: ${end - cur}ms`);
        if (result[0] != null) {
          console.log(result[0]);
        } else if (result[1] != null) {
          console.log(`class: ${result[1]}, score: ${result[2]}`);
          processFrameJS(result[1], result[3]);
        }
      });
    },
    [processFrameJS]
  );

  const addIncident = async (classification, base64) => {
    try {
      const token = await getToken();
      await fetch(context.fetchPath + `api/addIncident`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
        body: JSON.stringify({
          classification: classification,
          image: base64,
          session_id: sessionIdRef.current,
          long: locationRef.current[0],
          lat: locationRef.current[1],
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateSessionCoords = async (coords) => {
    try {
      const token = await getToken();
      await fetch(context.fetchPath + `api/updateCoords`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          coords: coords,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createSession = async () => {
    setIncidentCoordinates([]);
    setRouteCoordinates([]);
    //TODO: need to pass the image url for the request body
    //const photo = await camera.current.takePhoto()
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/createSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
        body: JSON.stringify({
          image: "http://driving_image_url",
        }),
      });

      const json = await response.json();
      console.log("set session: " + json.message);
      setSessionId(json.message);
    } catch (error) {
      console.error(error);
    }
  };

  const endSession = async () => {
    Toast.hide();
    if (routeCoordinatesRef.current.length > 0) {
      coordsCopy = [...routeCoordinatesRef.current];
      await updateSessionCoords(coordsCopy);
    }
    try {
      const token = await getToken();

      const response = await fetch(
        context.fetchPath + `api/endSession/${sessionId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-access-tokens": token,
          },
        }
      );

      const json = await response.json();

      if (json.message) {
        Toast.show({
          text1: "Error",
          text2: json.message,
          type: "error",
        });
      } else {
        console.log("end session is called!");
        setSessionId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.createContainer}>
      {isFocused && location && destination && (
        <MapboxNavigation
          origin={location}
          destination={destination}
          style={styles.mapStyle}
          showsEndOfRouteFeedback
          hideStatusView
          onLocationChange={(event) => {
            const { latitude, longitude } = event.nativeEvent;
            const distanceTravelled = getDistance(
              {
                latitude: location[1],
                longitude: location[0],
              },
              {
                latitude: latitude,
                longitude: longitude,
              }
            );
            console.log(
              `New coords: [$${latitude}, ${longitude}], Distance travelled: ${distanceTravelled}`
            );
            if (distanceTravelled >= context.locationPollDistanceMetres) {
              setLocation([longitude, latitude]);
              console.log(
                `Coordinates Array Length: ${routeCoordinates.length}`
              );
              if (routeCoordinates.length >= context.routeCoordinatesLimit) {
                coordsCopy = [...routeCoordinates];
                updateSessionCoords(coordsCopy);
                setRouteCoordinates([
                  {
                    latitude: latitude,
                    longitude: longitude,
                  },
                ]);
              } else {
                setRouteCoordinates([
                  ...routeCoordinates,
                  {
                    latitude: latitude,
                    longitude: longitude,
                  },
                ]);
              }
            }
          }}
          onRouteProgressChange={(event) => {
            const {
              distanceTraveled,
              durationRemaining,
              fractionTraveled,
              distanceRemaining,
            } = event.nativeEvent;
            // console.log('onRouteProgressChange', event.nativeEvent);
          }}
          onError={(event) => {
            const { message } = event.nativeEvent;
            if (sessionId != null) {
              endSession();
            }
            alert(message);
          }}
          onCancelNavigation={() => {
            // User tapped the "X" cancel button in the nav UI
            // or canceled via the OS system tray on android.
            // Do whatever you need to here.
            if (sessionId != null) {
              endSession();
              alert("Session ended");
              navigation.navigate("SessionDetails", {
                sessionId: sessionId,
              });
            }
          }}
          onArrive={() => {
            // Called when you arrive at the destination.
            if (sessionId != null) {
              endSession();
              alert("You have reached your destination");
              navigation.navigate("SessionDetails", {
                sessionId: sessionId,
              });
            }
          }}
        />
      )}
      {isFocused && device != null && hasCameraPermissions && (
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
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    position: "absolute",
    zIndex: 150,
    width: "100%",
    height: "100%",
  },
  hud: {
    bottom: 0,
  },
  item: {
    padding: 60,
    marginVertical: 30,
    alignSelf: "center",
    height: "30%",
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    color: "#EF5350",
    fontWeight: "500",
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  textWrapper: {
    width: "85%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  cameraStyle: {
    position: "absolute",
    width: 5,
    height: 5,
    bottom: 0,
    right: 0,
    zIndex: 100,
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
    fontWeight: "600",
    color: "#3f2021",
  },
  lowerOuterContainer: {
    width: "100%",
    height: "100%",
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
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  semiCircle: {
    width: "100%",
    height: 50,
    borderRadius: 125, // half of the image width
  },
});

export default StartNewSession;
