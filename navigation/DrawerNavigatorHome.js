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


/*
* This loads the drawer navigator when the user starts the
* app logged-in. It renders home first. 
*/
import AdministratorScreen from '../screens/AdministratorScreen';

const WIDTH = Dimensions.get('window').width;

const DrawerNavigatorHome = createDrawerNavigator(
    {
        Home: {
            screen: HomeScreen
        },
        Profile: {
            screen: ProfileScreen
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
        Confirm:{
            screen: ConfirmScreen
        },
    },

    {
        contentOptions: {
            activeBackgroundColor: '#e91e63',
            itemsContainerStyle: {
                marginTop: scale(50),
            },
            labelStyle: {fontFamily: 'Cabin-Regular'}
        },
        drawerWidth: WIDTH * 0.83,
        contentComponent: ({ navigation, screenProps}) => {
            return (<MenuDrawer navigation={navigation} name={screenProps.name} photoUrl={screenProps.photoUrl} uid={screenProps.uid}/>)
        }
    }
);


export default createAppContainer(DrawerNavigatorHome);