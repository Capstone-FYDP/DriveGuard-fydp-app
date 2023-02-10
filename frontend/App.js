import React from 'react';
import { MainProvider } from './context/MainContext';
import MainCode from './MainCode';
// import 'react-native-gesture-handler';

export default function App() {
  return (
    <MainProvider>
      <MainCode />
    </MainProvider>
  );
}
