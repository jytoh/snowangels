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
      user_id: null,
  }

  async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
		});
    this.setState({fontLoaded : true});
    await this.fetch_state();
  }

  async fetch_state() {
    try {
      const lastStateJSON = await AsyncStorage.getItem('lastState');
      console.log(lastStateJSON)
      const lastState = JSON.parse(lastStateJSON);
      this.setState({
        signedIn: lastState.signedIn,
        user_id: lastState.user_id
      });
      console.log('Got last state');
    }
    catch (error) {
      console.log('No last state to fetch');
      this.setState({
        signedIn: false,
      })
    }
  };

  render() {
    console.log("app.js signedIn =", this.state.signedIn)
    console.log("app.js user id =", this.state.user_id)
    if ( !this.state.fontLoaded ) {
      return (
      <View>
        <AppLoading/>
      </View>);
    } 
    if (this.state.signedIn) {
      return (
        <DrawerNavigatorHome />
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
