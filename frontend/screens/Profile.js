import React, { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { MainContext } from "../context/MainContext";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/button/custom-button";

export default function Profile({ navigation }) {
  const context = useContext(MainContext);

  const removeToken = () => {
    return AsyncStorage.removeItem("auth_token");
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
      <StatusBar style="auto" />
    </View>
  );
}

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
    paddingBottom: 10,
  },
  inputContainer: {
    flex: 1,
    width: "80%",
    alignSelf: "center",
  },
  textWrapper: {
    width: "85%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
  },
});
