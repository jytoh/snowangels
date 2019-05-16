import React from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import SplashScreen from '../screens/SplashScreen';
import App from '../App';

/*
 * NOT USED
 */
const SplashNavigator = createSwitchNavigator({
    Splash: SplashScreen,
    App: App
  });
  
  export default createAppContainer(SplashNavigator);