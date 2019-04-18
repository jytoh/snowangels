import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppLoading, Font } from 'expo';
import DrawerNavigator from './navigation/DrawerNavigator';
import DrawerNavigatorHome from './navigation/DrawerNavigatorHome';
import {AsyncStorage} from 'react-native';


export default class App extends React.Component {
  state = {
      fontLoaded: false,
      signedIn: false
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

  // toggleSignIn() {
  //   this.setState({
  //     signedIn: !this.state.signedIn
  //   });
  // }

  render() {
    console.log("app.js signedIn =", this.state.signedIn)
    if ( !this.state.fontLoaded ) {
      return (
      <View>
        <AppLoading/>
      </View>);
    } 
    if (!this.state.signedIn) {
      console.log("app.js", this.props.navigation)
      return (
        <DrawerNavigator />
      );
    }
    else {
      return <DrawerNavigatorHome />
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
