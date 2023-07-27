import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/Home";
import MySessions from "../../screens/MySessions";
import CreateSession from "../../screens/CreateSession";
import Profile from "../../screens/Profile";
import CustomTabBar from "./CustomTabBar";
import SessionDetails from '../../screens/SessionDetails';

const Tab = createBottomTabNavigator();

const Navbar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen
        options={{ headerShown: false }}
        name="Home"
        component={Home}
        initialParams={{ icon: "home" }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Trips"
        component={MySessions}
        initialParams={{ icon: "format-list-bulleted" }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Create"
        component={CreateSession}
        initialParams={{ icon: "add-circle" }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Settings"
        component={Profile}
        initialParams={{ icon: "settings" }}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name='Single Trip'
        component={SessionDetails}
        initialParams={{ icon: 'account' }}
      />
    </Tab.Navigator>
  );
};

export default Navbar;
