import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from "@expo/vector-icons";

const TabButton = ({ color, tab, onPress, icon }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {icon && <MaterialIcons name={icon} size={28} color={color} />}
      <Text style={{ color }}>{tab.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
});

export default TabButton;
