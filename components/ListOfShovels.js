import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from "react-native-elements";


const list = [
  {
    name: 'March 20th, 2019 4:25 PM',
    subtitle: "N Aurora St & E Court Street",
    icon: 'snowflake-o'
  },
  {
    name: 'Febuary 4th, 2019 1:36 PM',

    subtitle: "N Aurora St & E Court Street",
    icon: 'snowflake-o'
  },
  {
    name: 'January 12th, 2019 9:25 AM',
    subtitle: "Stewart Ave & University Ave",
    icon: 'snowflake-o'
  },
  {
    name: 'December 19th, 2018 11:15 AM',
    subtitle: "Stewart Ave & University Ave",
    icon: 'snowflake-o'
  }
]


// const list = [
//   {
//     title: 'Appointments',
//     icon: 'av-timer'
//   },
//   {
//     title: 'Trips',
//     icon: 'flight-takeoff'
//   },
// ]


export default class ListOfShovels extends React.Component {
  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item }) => (
    <ListItem
      title={item.name}
      titleStyle={{fontFamily: 'Cabin-Bold',}}
      subtitle={item.subtitle}
      subtitleStyle={{fontFamily: 'Cabin-Regular',}}
      // leftAvatar={{ source: { uri: item.avatar_url } }}
      leftIcon={{
        reverse: true,
        color: '#d1e1f8',
        name: item.icon,
        type: 'font-awesome'
      }}
    />
  )
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
    return (
      <FlatList
        keyExtractor={this.keyExtractor}
        data={list}
        renderItem={this.renderItem}
        style={{ width: 400 }}
        ItemSeparatorComponent={this.renderSeparator}
      />

      // <View>
      //   {
      //     list.map((item, i) => (
      //       <ListItem
      //         key={i}
      //         title={item.title}
      //         leftIcon={{ name: item.icon }}
      //       />
      //     ))
      //   }
      // </View>
    )
  }
}
