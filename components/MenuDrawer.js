import React from 'react';
import { View, Text, Image, ScrollView, Platform, Dimensions, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'

import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'
import {SecureStore} from "expo";

const WIDTH = Dimensions.get('window').width
const HEIGHT = Dimensions.get('window').height

export default class MenuDrawer extends React.Component {
    navLink(nav, text) {
        return(
            <TouchableOpacity style = {{height: scale(60)}} onPress = {() => this.props.navigation.navigate(nav)}>
                <Text style={styles.link}>{text}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return(
            <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} >
            <View style = {styles.container}>
                <View style = {styles.topLinks}>
                    <View style={styles.profile}>
                        <View style ={styles.imgView}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile')}>
                            <Image style = {styles.profpic} source={{ uri: this.props.photoUrl }}/>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.profileText}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile')}>
                            <Text style = {styles.name}> {this.props.name} </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView style={styles.scroller}>
                {(this.props.uid == 1) ? (
                    <View style = {styles.bottomLinks}>
                        {this.navLink('Home', 'Map')}
                        {this.navLink('Profile', 'Profile')}
                        {this.navLink('Leaderboard', 'Leaderboard')}
                        {this.navLink('Shovel', 'History')}
                        {this.navLink('Requests','Requests')}
                        {this.navLink('Administrator','Administrator')}
                    </View>) : 
                    (
                    <View style = {styles.bottomLinks}>
                        {this.navLink('Home', 'Map')}
                        {this.navLink('Profile', 'Profile')}
                        {this.navLink('Leaderboard', 'Leaderboard')}
                        {this.navLink('Shovel', 'History')}
                        {this.navLink('Requests','Requests')}
                    </View>
                    )
                }
                </ScrollView>
                <View style={styles.footer}>
                    <Text style={styles.description}>Snow Angels</Text>
                    <Text style={styles.version}>v1.0</Text>
                </View>
            </View>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    img: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%'
    },
    scroller: {
        flex: 1
    },
    profile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: scale(25),
        borderBottomWidth: 1,
        borderBottomColor: '#777777',
    },
    profpic: {
        height: scale(90),
        width: scale(90),
        borderRadius: scale(40),
    },
    imgView:{
        flex: 2,
        paddingLeft: scale(20),
    },
    profileText:{
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    name:{
        fontFamily: txt.bold,
        fontSize: txt.header,
        paddingBottom: scale(5),
        color: 'white',
        textAlign: 'left',
    },
    topLinks:{
        height: scale(160),
        backgroundColor: '#76A1EF',
    },
    bottomLinks:{
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: scale(10),
        paddingBottom: scale(450),
    },
    link: {
        flex: 1,
        fontSize: txt.button,
        fontFamily: txt.reg,
        padding: scale(6),
        paddingLeft: scale(14),
        margin: scale(5),
        textAlign: 'left',
    },
    footer:{
        height: scale(50),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
    },
    version: {
        flex: 1,
        textAlign: 'right',
        marginRight: scale(20),
        color: 'gray'
    },
    description: {
        flex: 1,
        marginLeft: scale(20),
        fontSize: (txt.small - scale(4))
    }
})
