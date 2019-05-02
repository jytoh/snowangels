import React from 'react';
import { Dimensions } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import ShovelScreen from '../screens/ShovelScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestScreen from '../screens/RequestScreen';
import ShovelCameraScreen from '../screens/ShovelCameraScreen';
import MenuDrawer from '../components/MenuDrawer'
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ConfirmScreen from '../screens/ConfirmScreen';


import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'
import AdministratorScreen from '../screens/AdministratorScreen';



    
/*
* This loads the drawer navigator when the user starts the
* app logged-out. It renders profile first so the user can log in 
* and locks the drawer so the user can't navigate to other screens. 
*/

const WIDTH = Dimensions.get('window').width;

const DrawerConfig = {
    drawerLockMode: 'locked-closed',
    contentOptions: {
        activeBackgroundColor: '#e91e63',
        itemsContainerStyle: {
            marginTop: scale(50),
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
        Shovel: {
            screen: ShovelScreen
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
        Confirm: {
            screen: ConfirmScreen
        },
        Administrator:{
            screen: AdministratorScreen
        }

    },
    DrawerConfig
);


export default createAppContainer(DrawerNavigator);