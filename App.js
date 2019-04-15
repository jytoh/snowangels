import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DrawerNavigator from './navigation/DrawerNavigator';
import { AppLoading, Font } from 'expo';

export default class App extends React.Component {
  state = {
    fontLoaded: false
  }

  async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
		});
		console.log('font loaded app!');
		this.setState({fontLoaded : true});
	}

  render() {
    if( !this.state.fontLoaded ) {
      return (<AppLoading/>);
    }
    return (
      <View style={styles.container}>
        <DrawerNavigator />
      </View>
    );
  }

  async loadFont() {
    await Font.loadAsync({
      'Cabin-Regular': require('../snowangels-cs5150/assets/fonts/Cabin-Regular.ttf'),
      'Cabin-Bold': require('../snowangels-cs5150/assets/fonts/Cabin-Bold.ttf')
    });
    console.log('font loaded app!');
    this.setState({fontLoaded: true});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
