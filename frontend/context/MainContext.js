import React, { createContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
export const Stack = createStackNavigator();
export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const fetchPath = "http://192.168.0.159:5000/";
  const primaryColour = "#1f527b";
  const secondaryColour = "#17435E";
  const tertiaryColour = "#2c79b3";
  const screenBackground = "#F4F8FB";

  return (
    <MainContext.Provider
      value={{
        theme,
        setTheme,
        fetchPath,
        primaryColour,
        secondaryColour,
        tertiaryColour,
        screenBackground,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
