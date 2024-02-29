import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/button/custom-button";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { MainContext } from "../context/MainContext";
import { StatusBar } from "expo-status-bar";
import { validate } from "validate.js";
import addressValidation from "../validation/address-validation";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";

const AddressForm = ({ navigation }) => {
  const context = useContext(MainContext);
  const GOOGLE_PLACES_API_KEY = "AIzaSyDxFN9yluWMaEqBcT8ey_GOtuGmd_zGQio";
  const [destination, setDestination] = useState([]);
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
      navigation.navigate("StartSession", {
        destination: destination,
      });
    }
  };
  return (
    <View
      style={[styles.container, { backgroundColor: context.screenBackground }]}
    >
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

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
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
    marginTop: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
  },
});

export default AddressForm;
