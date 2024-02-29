import React, { createContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
export const Stack = createStackNavigator();
export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [selectedPage, setSelectedPage] = useState("Home");
  const fetchPath = "https://driveguardfydp.pythonanywhere.com/";
  const primaryColour = "#1f527b";
  const secondaryColour = "#17435E";
  const tertiaryColour = "#2c79b3";
  const screenBackground = "#F4F8FB";
  const routeCoordinatesLimit = 20;
  const locationPollDistanceMetres = 10;

  return (
    <MainContext.Provider
      value={{
        theme,
        setTheme,
        selectedPage,
        setSelectedPage,
        fetchPath,
        primaryColour,
        secondaryColour,
        tertiaryColour,
        screenBackground,
        routeCoordinatesLimit,
        locationPollDistanceMetres,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
