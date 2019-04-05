import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import LinkScreen from '../screens/LinkScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CameraScreen from '../screens/CameraScreen';
<<<<<<< HEAD
import ProfileScreen from '../screens/ProfileScreen';

=======
>>>>>>> e47709d2f25d426682d3f9c690eeb9603673b501
import MenuDrawer from '../components/MenuDrawer'
import LeaderboardScreen from '../screens/LeaderboardScreen';

const WIDTH = Dimensions.get('window').width;

const DrawerConfig = {
    drawerWidth: WIDTH * 0.83,
    contentComponent: ({ navigation }) => {
        return (<MenuDrawer navigation={navigation} />)
    }
}

const DrawerNavigator = createDrawerNavigator(
    {
        Home: {
            screen: HomeScreen
        },
        Profile: {
            screen: ProfileScreen
        },
        Links: {
            screen: LinkScreen
        },
        History: {
            screen: HistoryScreen
        },
        Settings: {
            screen: SettingsScreen
        },
        Camera: {
            screen: CameraScreen
        }, 
        Leaderboard: { 
            screen: LeaderboardScreen
        }
    },
    DrawerConfig
);

export default createAppContainer(DrawerNavigator);