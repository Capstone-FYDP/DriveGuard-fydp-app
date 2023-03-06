import React from "react";
import { StyleSheet, Text, View, SafeAreaView, Button } from "react-native";
import CustomButton from "../components/button/custom-button";
import CustomCard from "../components/card/custom-card";

const App = () => (
  <SafeAreaView style={styles.createContainer}>
    <View style={styles.upperContainer}>
      <View style={styles.textWrapper}>
        <Text style={styles.headerTitle}>Start Session</Text>
      </View>
    </View>

    <View style={styles.item}>
      <Text style={styles.title}>Message Prompt</Text>
    </View>

    <CustomCard
      outerStyle={styles.lowerOuterContainer}
      innerStyle={styles.lowerInnerContainer}
      noTouchOpacity
    >
      <View style={styles.buttonsContainer}>
        <CustomButton type="emphasized" text={"Start"} />
        <CustomButton type="emphasized" text={"Stop"} />
      </View>
    </CustomCard>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    backgroundColor: "#fffbf6",
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
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#3f2021",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#fff",
    justifyContent: "space-evenly",
    alignSelf: "center",
    width: "85%",
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
    backgroundColor: "blue",
  },
});

export default App;
