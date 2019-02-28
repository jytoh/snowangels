import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton'

export default class SettingsScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style = {styles.text}>Settings</Text>
        <MenuButton navigation={this.props.navigation} />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
  }
});