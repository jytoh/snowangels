import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppLoading, Font } from 'expo';
import DrawerNavigator from './navigation/DrawerNavigator';
import DrawerNavigatorHome from './navigation/DrawerNavigatorHome';
import DrawerNavigatorAdmin from './navigation/DrawerNavigatorAdmin';
import {AsyncStorage} from 'react-native';


export default class App extends React.Component {

  /*
  * The state maintains key information for this app to 
  * be operational.
  * 
  * bool fontLoaded: whether or not the fonts are done loading. 
  *   Only rendering screens when fonts are done loading
  *   prevents the app from crashing 
  * bool signedIn: whether or not the user was signed in 
  *   when they last had the app open. Determines whether
  *   the navigator allows the user to access the rest of the app.
  * int uid: the user ID. Used for backend purposes. 
  * string name: Name. Displayed at the top of the navigator. 
  * string photoUrl: Photo. Displayed at the top of the navigator. 
  */
  state = {
      fontLoaded: false,
      signedIn: null,
      uid: null,
      name: "",
      photoUrl:""
  }

  /**
  * Invoked immedately after the app is mounted
  * Loads the font packagegs and, when done,
  * calls fetch_state() to retrieve profile information 
  */
  async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
		});
    await this.setState({fontLoaded : true});
    await this.fetch_state();
  }

  /**
  * Retrieves the state from AsyncStorage
  * 
  * This is called when the app is loaded to see whether
  * the user was already logged in and, if so, what that user's
  * information is. AsyncStorage is used to maintain a persistent
  * user state. If there is no last state, it sets the state 
  * of signedIn to be false. 
  */
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

  /**
   * Renders the main navigator of the app
   * 
   * If the fonts are not done loading, a loading screen
   * is displayed. Otherwise, it renders a navigator based on 
   * whether or not the user is signed in and whether or not 
   * the user is an administrator. This is necessary in order
   * to allow the administrator special access and to ensure that
   * a signed-out user can't access the app. 
   */
  render() {
    if ( !this.state.fontLoaded ) {
      return (
      <View>
        <AppLoading/>
      </View>);
    } 
    if (this.state.signedIn && (this.state.uid == 1)) {
      return (
        <DrawerNavigatorAdmin screenProps={{name: this.state.name, photoUrl: this.state.photoUrl, uid:this.state.uid}}/>
      )
    }
    else {
      if (this.state.signedIn) {
        return (
          <DrawerNavigatorHome screenProps={{name: this.state.name, photoUrl: this.state.photoUrl, uid:this.state.uid}}/>
        );
      }
      else {
        return <DrawerNavigator />
      }
    }
  }

  /**
   * Manually load the font. Used for testing purposes. 
   * 
   * @deprecated
   */
  async loadFont() {
    await Font.loadAsync({
      'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
      'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
    });
    this.setState({fontLoaded: true});
  }
}