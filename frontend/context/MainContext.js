import React, { createContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
export const Stack = createStackNavigator();
export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
<<<<<<< HEAD
  const fetchPath = "http://10.0.2.2:5000/";
=======
  const fetchPath = "http://192.168.0.154:5000/";
>>>>>>> 0b16219 (Complete creaste sessoin)
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
