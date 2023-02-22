import React from 'react';
import Signin from './SignIn';
import Signup from './Signup';
import WelcomePage from './WelcomePage';
import CreateProfile from './CreateProfile';
import { Stack } from '../../context/MainContext';

function AuthenticationScreens() {
  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Signin"
        component={Signin}
      />
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerBackTitle: 'Login',
          headerTintColor: '#ffffff',
          title: '',
        }}
        name="Signup"
        component={Signup}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CreateProfile"
        component={CreateProfile}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="WelcomePage"
        component={WelcomePage}
      />
    </>
  );
}

export default AuthenticationScreens;
