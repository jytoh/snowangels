import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { ListItem } from "react-native-elements";


const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'Vice President'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'Vice Chairman'
  },
]


  export default class ListOfShovels extends React.Component {
    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
      <ListItem
        title={item.name}
        subtitle={item.subtitle}
        leftAvatar={{
          source: item.avatar_url && { uri: item.avatar_url },
          title: item.name[0]
        }}
      />
    )
    
    render () {
      return (
        <FlatList
          keyExtractor={this.keyExtractor}
          data={list}
          renderItem={this.renderItem}
          style = {{width:420}}
        />
      )
    }
  }


