import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../../screens/Home';
import MySessions from '../../screens/MySessions';
import CreateSession from '../../screens/CreateSession';
import Profile from '../../screens/Profile';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

const Navbar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen
        options={{ headerShown: false }}
        name="Home"
        component={Home}
        initialParams={{ icon: 'home' }}
      />
      <Tab.Screen
        name="Trips"
        component={MySessions}
        initialParams={{ icon: 'format-list-bulleted' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateSession}
        initialParams={{ icon: 'plus-box' }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        initialParams={{ icon: 'account' }}
      />
    </Tab.Navigator>
  );
};

export default Navbar;
