import React, { useState, useContext } from "react";
import { MainContext } from "../../context/MainContext";
import { StyleSheet, View } from "react-native";
import TabButton from "./TabButton";

const CustomTabBar = ({ state, navigation }) => {
  const context = useContext(MainContext);

  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const theme = context.theme !== "dark" ? capitalize(context.theme) : "Dark";
  const containerClass = "container" + theme;

  const handleSelectedTab = (currentTab) =>
    currentTab === context.selectedPage ? context.primaryColour : "#bdbdbd";

  const handlePress = (currentTab, index) => {
    if (state.index !== index) {
      context.setSelectedPage(currentTab);
      navigation.navigate(currentTab);
    }
  };

  const { routes } = state;

  return (
    <View style={[styles.container, styles[containerClass]]}>
      {routes.map((route, index) => (
        <TabButton
          tab={route}
          icon={route.params.icon}
          onPress={() => handlePress(route.name, index)}
          color={handleSelectedTab(route.name)}
          key={route.key}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    elevation: 10,
    borderTopWidth: 0,
  },
  containerDark: {
    backgroundColor: "#212121",
  },
  containerLight: {
    backgroundColor: "#ffffff",
  },
});

export default CustomTabBar;
