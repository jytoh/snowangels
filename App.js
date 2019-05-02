import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppLoading, Font } from 'expo';
import DrawerNavigator from './navigation/DrawerNavigator';
import DrawerNavigatorHome from './navigation/DrawerNavigatorHome';
import {AsyncStorage} from 'react-native';


export default class App extends React.Component {
  state = {
      fontLoaded: false,
      signedIn: null,
      uid: null,
      name: "",
      photoUrl:""
  }

  async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
		});
    await this.setState({fontLoaded : true});
    await this.fetch_state();
  }

  async fetch_state() {
    try {
      const lastStateJSON = await AsyncStorage.getItem('lastState');
      const lastState = JSON.parse(lastStateJSON);
      await this.setState({
        signedIn: lastState.signedIn,
        uid: lastState.uid,
        name: lastState.name,
        photoUrl: lastState.photoUrl
      });
    }
    catch (error) {
      this.setState({
        signedIn: false,
      })
    }
  };

  render() {
    if ( !this.state.fontLoaded ) {
      return (
      <View>
        <AppLoading/>
      </View>);
    } 
    if (this.state.signedIn) {
      return (
        <DrawerNavigatorHome screenProps={{name: this.state.name, photoUrl: this.state.photoUrl}}/>
      );
    }
    else {
      return <DrawerNavigator />
    }
  }

  async loadFont() {
    await Font.loadAsync({
      'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
      'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
    });
    this.setState({fontLoaded: true});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});