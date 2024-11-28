import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/login/LoginScreen';

const Stack = createStackNavigator();

const LoginNavigator = ({ onLogin }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      options={{ headerShown: false }}
    >
      {props => <LoginScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default LoginNavigator;
