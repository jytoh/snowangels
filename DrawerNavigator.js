import React from 'react';
import { Dimensions } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestScreen from '../screens/RequestScreen';
import ShovelCameraScreen from '../screens/ShovelCameraScreen';
import MenuDrawer from '../components/MenuDrawer'
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AdministratorScreen from '../screens/AdministratorScreen';


const WIDTH = Dimensions.get('window').width;

const DrawerConfig = {
    drawerLockMode: 'locked-closed',
    contentOptions: {
        activeBackgroundColor: '#e91e63',
        itemsContainerStyle: {
            marginTop: 50,
        },
        itemStyle: {fontFamily: 'Cabin-Regular'}
    },
    drawerWidth: WIDTH * 0.83,
    contentComponent: ({ navigation }) => {
        return (<MenuDrawer navigation={navigation} />)
    },
}
const DrawerNavigator = createDrawerNavigator(
    {
        Profile: {
            screen: ProfileScreen
        },
        Home: {
            screen: HomeScreen
        },
        History: {
            screen: HistoryScreen
        },
        Camera: {
            screen: CameraScreen
        }, 
        ShovelCamera: {
            screen: ShovelCameraScreen
        }, 
        Leaderboard: { 
            screen: LeaderboardScreen
        },
        Requests:{
            screen: RequestScreen
        },
        Administrator:{
            screen: AdministratorScreen
        }
    },
    DrawerConfig
);


export default createAppContainer(DrawerNavigator);