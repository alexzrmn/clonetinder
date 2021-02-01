import 'react-native-gesture-handler';
import * as firebase from "firebase";
import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from "./screens/Login";
import Home from "./screens/Home";


const firebaseConfig = {
  apiKey: "AIzaSyDEx5R8bmogfuNEfDx3XbqEY5wRoAqCZZs",
  databaseURL: "https://tinderclone-513b2-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const AppStack = createStackNavigator();

function MyStack(props) {
    return (
      <AppStack.Navigator
        headerMode='none'
      >
        <AppStack.Screen 
            name="Login" 
            component={Login}
        />
        <AppStack.Screen 
            name="Home" 
            component={Home}
            options={{uid: props.route}}
        />
      </AppStack.Navigator>
    );
}


export default function Index() {
    return (
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    );
}