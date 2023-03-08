import React, { createContext, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
export const Stack = createStackNavigator();
export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const gradient = ['#7751cd', '#9d4ac6'];
  const fetchPath = 'http://10.0.2.2:5000/';
  const primaryColour = '#9d4ac6';
  const screenBackground = '#FAFAFA';

  return (
    <MainContext.Provider
      value={{
        theme,
        setTheme,
        gradient,
        fetchPath,
        primaryColour,
        screenBackground,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
