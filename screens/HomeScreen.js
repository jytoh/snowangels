import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton';
// import FetchLocation from '../components/FetchLocation';
import UsersMap from '../components/UsersMap';

export default class HomeScreen extends React.Component {
  state = {
    userLocation: null
  }
  getUserLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        userLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0421,
        }
      })
      console.log(position)
    }, err => console.log(err));
  }
  render() {
    return (
      <View style={styles.container}>
        <MenuButton navigation={this.props.navigation} />
        {/* <Text style={styles.text}>Current Location</Text> */}
        {/* <FetchLocation () ={this.getUserLocationHandler} /> */}
        <UsersMap userLocation={this.state.userLocation} />
        <View style={styles.container2}>
          <Button title="Get Location" 
          onPress={() => this.getUserLocationHandler()} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    container2: {
    flex: 1,
    zIndex: 2,
    top: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: "absolute",

  },
  text: {
    fontSize: 20,
    zIndex: 20,
    position: "absolute",
    top: 80,
    alignItems: 'center'
  },
});