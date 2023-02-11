import React from 'react';
import { Stack } from './context/MainContext';
import { NavigationContainer } from '@react-navigation/native';
import Navbar from './components/Navbar/Navbar';

export default function MainCode() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Navbar"
          component={Navbar}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
