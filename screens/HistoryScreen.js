import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton';

import ListOfShovels from '../components/ListOfShovels';

export default class HistoryScreen extends React.Component {

  render() {
    const allShoves = false;
    const favShoves = true;
    let curr = allShoves;
    return (
      <View style={styles.container}>

        <MenuButton navigation={this.props.navigation} />

        <Text style={styles.text}>My Shovels</Text>

        <View style={styles.categories}>
          {/* Hard coded for now */}
          <Text style={styles.h1}>All</Text>
          <Text style={styles.h1}>  |  </Text>
          <Text style={styles.h1}>My Favorites</Text>
        </View>
        <ListOfShovels />

      </View >




    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // justifyContent: 'center',
    paddingTop: 30,
    alignItems: 'center'
  },
  categories: {
    paddingTop: 20,
    flexDirection: 'row',

  },
  text: {
    fontSize: 30
  },
  // shovels: {
  //   height: 100
  // },
  h1: {
    fontSize: 23
  }

});