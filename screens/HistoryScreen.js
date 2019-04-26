import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton';

import ListOfShovels from '../components/ListOfShovels';

export default class HistoryScreen extends React.Component {

  renderHeader() {
    return (
      <View colors={[, '#DDE8FC', '#76A1EF']}
        style={styles.header}>
        <Text style={{ fontSize: 25, fontFamily: 'Cabin-Bold', color: 'white', paddingTop: 20 }}>My Shovels</Text>
        <View style={{
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
          marginBottom: 15, marginTop: 20
        }}>
        </View>
      </View>
    )
  }
  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "80%",
          backgroundColor: "#CED0CE",
          marginLeft: "20%"
        }}
      />
    );
  };
  render() {
    const allShoves = false;
    const favShoves = true;
    let curr = allShoves;
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
    paddingTop: 20,
    flexDirection: 'row',
  },
  text: {
    fontSize: 30,
    paddingTop: 20
  },
  header: {
    backgroundColor: '#76A1EF',
    padding: 15,
    paddingTop: 35,
    alignItems: 'center',
    width: '100%',
    height: '18%'
  },
  h1: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Cabin-Bold',
  }

});
