import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../../screens/Home';
import MySessions from '../../screens/MySessions';
import CreateSession from '../../screens/CreateSession';
import Profile from '../../screens/Profile';
import CustomTabBar from './CustomTabBar';
import Maps from '../../screens/Maps';

const Tab = createBottomTabNavigator();

const Navbar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen
        options={{ headerShown: false }}
        name='Home'
        component={Home}
        initialParams={{ icon: 'home' }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name='Trips'
        component={MySessions}
        initialParams={{ icon: 'format-list-bulleted' }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name='Create'
        component={CreateSession}
        initialParams={{ icon: 'plus-box' }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name='Maps'
        component={Maps}
        initialParams={{ icon: 'map-marker' }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name='Profile'
        component={Profile}
        initialParams={{ icon: 'account' }}
      />
    </Tab.Navigator>
  );
};

export default Navbar;
