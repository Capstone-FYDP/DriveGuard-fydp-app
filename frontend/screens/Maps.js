import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const Maps = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [location, setLocation] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setLocation(location);
            setRouteCoordinates([
              ...routeCoordinates,
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
            ]);
          }
        );
      }
      return () => locationSubscription.remove();
    })();
  }, []);

  // useEffect(() => {
  //   console.log("Location Object: " + JSON.stringify(location));
  // }, [location]);

  // useEffect(() => {
  //   console.log("Route: " + JSON.stringify(routeCoordinates));
  // }, [routeCoordinates]);

  return (
    <View style={styles.container}>
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
        {/* {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        )} */}
        <Polyline coordinates={routeCoordinates} strokeWidth={5} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Maps;
