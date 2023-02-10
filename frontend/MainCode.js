import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { MainContext, Stack } from './context/MainContext';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/Home';

export default function MainCode() {
  return (
    <NavigationContainer>
      <Home />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
