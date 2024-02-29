import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/button/custom-button";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { MainContext } from "../context/MainContext";
import { validate } from "validate.js";
import addressValidation from "../validation/address-validation";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";

const AddressForm = ({ navigation }) => {
  const context = useContext(MainContext);
  const GOOGLE_PLACES_API_KEY = "AIzaSyDxFN9yluWMaEqBcT8ey_GOtuGmd_zGQio";
  const [destination, setDestination] = useState([]);
  const [start, setStart] = useState([]);
  const [destAddress, setdestAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const errorCheckOrder = ["destAddress"];

  const handleSubmit = async () => {
    setLoading(true);

    const validationResult = validate({ destAddress }, addressValidation);

    if (validationResult) {
      for (let error of errorCheckOrder) {
        if (validationResult[error]) {
          Toast.show({
            text1: "Error",
            text2: validationResult[error][0],
            type: "error",
          });
          break;
        }
      }
      setLoading(false);
    } else {
      setLoading(false);
      context.setSelectedPage("Trips")
      navigation.navigate("StartSession", {
        destination: destination,
      });
    }
  };
  return (
    <View
      style={[styles.container, { backgroundColor: context.screenBackground }]}
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        onUserLocationChange={(location) => {
          if (start.length == 0) {
            setStart([location.nativeEvent.coordinate.longitude, location.nativeEvent.coordinate.latitude])
          }
        }}
        style={styles.mapStyle}
        region={(start.length > 0 || destination.length > 0) ? {
          latitude: destination[1] || start[1],
          longitude: destination[0] || start[0],
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        } : undefined}
      >
        {destination.length > 0 && <Marker
          coordinate={{
            latitude: destination[1],
            longitude: destination[0],
          }}
        />}
      </MapView>
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            Where to?
          </Text>
        </View>
      </View>
      <View style={styles.inputsWrapper}>
        <GooglePlacesAutocomplete
          placeholder="Enter Location"
          minLength={2}
          autoFocus={false}
          returnKeyType={"default"}
          fetchDetails={true}
          onPress={(data, details = null) => {
            setdestAddress(data.description);
            setDestination([
              details.geometry.location.lng,
              details.geometry.location.lat,
            ]);
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: "en",
          }}
          styles={{
            textInputContainer: {
              backgroundColor: "rgba(0,0,0,0)",
            },
            textInput: {
              marginLeft: 20,
              marginRight: 20,
              height: 60,
              color: context.secondaryColour,
              fontSize: 20,
            },
            listView: {
              marginHorizontal: 20,
            },
          }}
          currentLocation={false}
        />
        <View style={styles.inputContainer}>
          <CustomButton
            text={
              loading ? (
                <LoadingIndicator color="white" isAnimating={true} />
              ) : (
                "Start Trip"
              )
            }
            type="emphasized"
            onPress={handleSubmit}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  promptContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 10,
    elevation: 3,
  },
  autoComplete: {
    maxHeight: '100%',
    flex: 1,
    flexGrow: 1,
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    pointerEvents: 'none',
    marginTop: 10,
  },
  inputsWrapper: {
    flex: 1,
    height: "100%",
  },
  inputContainer: {
    width: "80%",
    alignSelf: "center",
    marginVertical: 20,
  },
  textWrapper: {
    width: "85%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    pointerEvents: 'none',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
  },
  mapStyle: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default AddressForm;
