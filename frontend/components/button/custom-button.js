import React, { useContext } from "react";
import { MainContext } from "../../context/MainContext";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CustomButton = (props) => {
  const {
    type,
    text,
    onPress,
    additionalStyling,
    backgroundColor,
    outlineColor,
    textColor,
  } = props;

  const context = useContext(MainContext);

  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const buttonClass =
    "button" +
    capitalize(type) +
    (type !== "emphasized" ? capitalize(context.theme) : "");

  const textClass =
    "text" +
    (type === "regular" ? capitalize(type) : "") +
    (type !== "emphasized" ? capitalize(context.theme) : "Dark");

  return buttonClass === "buttonEmphasized" ? (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.buttonMain,
          { backgroundColor: context.secondaryColour },
          additionalStyling,
        ]}
      >
        <Text style={[styles.text, styles[textClass]]}>{text}</Text>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={[
        styles.buttonMain,
        styles[buttonClass],
        additionalStyling,
        backgroundColor ? { backgroundColor } : null,
        outlineColor ? { borderColor: outlineColor } : null,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          styles[textClass],
          textColor ? { color: textColor } : null,
          backgroundColor && !textColor ? { color: "white" } : null,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: "Oxygen-Bold",
    fontSize: 18,
  },
  textDark: {
    color: "#ffffff",
  },
  textLight: {
    color: "#212121",
  },
  textRegularDark: {
    color: "#d1d1d1",
  },
  textRegularLight: {
    color: "#404040",
  },
  buttonMain: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  buttonClearLight: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonClearDark: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonOutlinedDark: {
    borderWidth: 0.5,
    borderColor: "#ffffff",
    backgroundColor: "transparent",
  },
  buttonOutlinedLight: {
    borderWidth: 0.5,
    borderColor: "#212121",
    backgroundColor: "transparent",
  },
  buttonRegularDark: { backgroundColor: "#404040" },
  buttonRegularLight: { backgroundColor: "#D1D1D1" },
  linearGradient: {
    borderRadius: 12,
  },
});
export default CustomButton;
