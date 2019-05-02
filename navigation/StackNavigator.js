import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import RequestScreen from '../screens/RequestScreen';
import ConfirmScreen from '../screens/ConfirmScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Camera: {screen: CameraScreen},
  Request: {screen: RequestScreen},
  Confirm: {screen: ConfirmScreen},
});

export default createAppContainer(MainNavigator);