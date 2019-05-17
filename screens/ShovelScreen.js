import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton';

import ListOfShovels from '../components/ListOfShovels';

import txt from '../UI_logistics/TextStyles'
import { scale } from '../UI_logistics/ScaleRatios'


export default class ShovelScreen extends React.Component {
  /**
   * This renders the header which has the title of this page
   *
   * @return a view with a title
   */
  renderHeader() {
    return (
      <View colors={[, '#DDE8FC', '#76A1EF']}
        style={styles.header}>
        <Text style={{ fontSize: txt.header, fontFamily: txt.bold, color: 'white' }}>My Shovel History</Text>
      </View>
    )
  }


  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <MenuButton navigation={this.props.navigation} />
        <ListOfShovels />
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    width: '100%'
  },
  categories: {
    paddingTop: scale(20),
    flexDirection: 'row',
  },
  text: {
    fontSize: txt.header,
    paddingTop: scale(20)
  },
  header: {
    backgroundColor: '#76A1EF',
    padding: scale(15),
    paddingTop: scale(35),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '18%'
  },

});
