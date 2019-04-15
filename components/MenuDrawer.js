import React from 'react';
import{ View, Text, Image, ScrollView, Platform, Dimensions, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'

const WIDTH = Dimensions.get('window').width
const HEIGHT = Dimensions.get('window').height

export default class MenuDrawer extends React.Component {
    navLink(nav, text) {
        return(
            <TouchableOpacity style = {{height: 50}} onPress = {() => this.props.navigation.navigate(nav)}>
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
                            <Image style = {styles.profpic} source={require('../assets/sarah.jpeg')}/>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.profileText}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile')}>
                            <Text style = {styles.name}> User </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView style={styles.scroller}>
                    <View style = {styles.bottomLinks}>
                        {this.navLink('Home', 'Home')}
                        {this.navLink('Profile', 'Profile')}
                        {this.navLink('Leaderboard', 'Leaderboard')}
                        {this.navLink('History', 'History')}
                        {this.navLink('Camera','Camera')}
                        {this.navLink('Requests','Requests')}
                    </View>
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
        paddingTop: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#777777',
    },
    profpic: {
        height: 90,
        width: 90,
        borderRadius: 40,
    },
    imgView:{
        flex: 3,
        paddingLeft: 20,
        paddingRight: 20,
    },
    profileText:{
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    name:{
        fontSize: 20,
        paddingBottom: 5,
        color: 'white',
        textAlign: 'left',
    },
    topLinks:{
        height: 160,
        backgroundColor: '#76A1EF',
    },
    bottomLinks:{
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: 10,
        paddingBottom: 450,
    },
    link: {
        flex: 1,
        fontSize: 20,
        padding: 6,
        paddingLeft: 14,
        margin: 5,
        textAlign: 'left',
    },
    footer:{
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
    },
    version: {
        flex: 1,
        textAlign: 'right',
        marginRight: 20,
        color: 'gray'
    },
    description: {
        flex: 1,
        marginLeft: 20,
        fontSize: 16
    }
})
