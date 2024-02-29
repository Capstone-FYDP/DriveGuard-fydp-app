import React from "react";
import { Stack } from "./context/MainContext";
import { NavigationContainer } from "@react-navigation/native";
import Navbar from "./components/Navbar/Navbar";
import AuthenticationScreens from "./screens/authenticationScreens/exportAuthenticationScreens";
import CustomToastAlert from "./components/alerts/custom-toast-alert";
import { useFonts } from "expo-font";
import SessionDetails from "./screens/SessionDetails";
import StartNewSession from "./screens/CreateSession";

export default function MainCode() {
  const [loaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Oxygen-Regular": require("./assets/fonts/Oxygen-Regular.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "Oxygen-Bold": require("./assets/fonts/Oxygen-Bold.ttf"),
    "Inter-Light": require("./assets/fonts/Inter-Light.ttf"),
    "Oxygen-Light": require("./assets/fonts/Oxygen-Light.ttf"),
  });

  return (
    loaded && (
      <>
        <NavigationContainer>
          <Stack.Navigator>
            {AuthenticationScreens()}
            <Stack.Screen
              options={{ headerShown: false }}
              name="Navbar"
              component={Navbar}
            ></Stack.Screen>
            <Stack.Screen
              options={{ headerShown: false }}
              name="SessionDetails"
              component={SessionDetails}
            ></Stack.Screen>
            <Stack.Screen
              options={{ headerShown: false }}
              name="StartSession"
              component={StartNewSession}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <CustomToastAlert />
      </>
    )
  );
}
