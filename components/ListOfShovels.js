import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { ListItem } from "react-native-elements";


const list = [
  {
    name: 'Dan Cogan',
    avatar_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoSpfrlvOdQTxWRPgpOmqgSTNknAUy2NwZQRcQGpygtDv9LbA8',
    subtitle: 'Chief of Staff'
  },
  {
    name: 'Ducson Nguyen',
    avatar_url: 'data:image/jpeg;base64,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',
    subtitle: 'Software Engineer'
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