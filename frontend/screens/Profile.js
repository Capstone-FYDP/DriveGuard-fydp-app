import React, { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { MainContext } from '../context/MainContext';
import { useIsFocused } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import CustomButton from '../components/button/custom-button';
import MapboxNavigation from 'rnc-mapbox-nav';
import * as Location from 'expo-location';

export default function Profile({ navigation }) {
  const context = useContext(MainContext);
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const isFocused = useIsFocused();

  const removeToken = () => {
    return AsyncStorage.removeItem('auth_token');
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
      setLocation(location);

      let dest = await Location.geocodeAsync('208 sunview');
      console.log(dest[0]);
      setDestination(dest[0]);
    })();
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: context.screenBackground }]}
    >
      {/* <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            Settings
          </Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <CustomButton
          text="Logout"
          type="emphasized"
          onPress={() => removeToken().then(navigation.navigate("Signin"))}
        />
      </View>

      <StatusBar style="auto" /> */}
      {isFocused && location && destination && (
        <MapboxNavigation
          origin={[location.coords.longitude, location.coords.latitude]}
          destination={[destination.longitude, destination.latitude]}
          style={styles.box}
          showsEndOfRouteFeedback
          hideStatusView
          onLocationChange={(event) => {
            const { latitude, longitude } = event.nativeEvent;
            console.log('onLocationChange', event.nativeEvent);
          }}
          onRouteProgressChange={(event) => {
            const {
              distanceTraveled,
              durationRemaining,
              fractionTraveled,
              distanceRemaining,
            } = event.nativeEvent;
            console.log('onRouteProgressChange', event.nativeEvent);
          }}
          onError={(event) => {
            const { message } = event.nativeEvent;
            alert(message);
          }}
          onCancelNavigation={() => {
            // User tapped the "X" cancel button in the nav UI
            // or canceled via the OS system tray on android.
            // Do whatever you need to here.
            alert('Cancelled navigation event');
          }}
          onArrive={() => {
            // Called when you arrive at the destination.
            alert('You have reached your destination');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    height: '100%',
    marginVertical: 20,
  },
  upperContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  inputContainer: {
    flex: 1,
    width: '80%',
    alignSelf: 'center',
  },
  textWrapper: {
    width: '85%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
  },
});
