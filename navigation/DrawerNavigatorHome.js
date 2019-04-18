import React from 'react';
import { Dimensions } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestScreen from '../screens/RequestScreen';

import MenuDrawer from '../components/MenuDrawer'
import LeaderboardScreen from '../screens/LeaderboardScreen';

const WIDTH = Dimensions.get('window').width;


const DrawerConfig = {
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
const DrawerNavigatorHome = createDrawerNavigator(
    {
        Home: {
            screen: HomeScreen
        },
        Profile: {
            screen: ProfileScreen
        },
        History: {
            screen: HistoryScreen
        },
        Camera: {
            screen: CameraScreen
        }, 
        Leaderboard: { 
            screen: LeaderboardScreen
        },
        Requests:{
            screen: RequestScreen
        }
    },
    DrawerConfig
);


export default createAppContainer(DrawerNavigatorHome);