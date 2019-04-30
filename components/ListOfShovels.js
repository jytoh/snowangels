import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from "react-native-elements";
import TouchableScale from 'react-native-touchable-scale';
import { SecureStore } from 'expo';

export default class ListOfShovels extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  keyExtractor(item, index) {
    return index.toString()
  }

  componentDidMount() {
    this.fetchData();
  }

 getSpecificUserShovels(arr, user_id) {

    user_shovels = [];
    for (let userObject of arr) {
      if (userObject.uid == user_id) {
        user_shovels.push(userObject);
      }
    }
    return user_shovels;
  }

  fetchData = async () => {
    const response = await fetch("https://snowangels-api.herokuapp.com/get_user_history");
    const json = await response.json();
    var user_id = await SecureStore.getItemAsync('id');
    var userShovels = this.getSpecificUserShovels(json, 2);
    this.setState({ data: userShovels });
  }

  getFormattedDate(itemTime) {
    var dateString = (new Date(itemTime)).toDateString()
    return dateString.substring(0, 3) + ", " + dateString.substring(4, dateString.length)
  }

  getFormattedTime(itemTime) {
    return (new Date(itemTime)).toLocaleTimeString('en-US')
  }

  renderItem = ({ item }) => (
    <ListItem
      title={this.getFormattedDate(item.time)}
      titleStyle={{ fontFamily: 'Cabin-Bold', }}
      subtitle={this.getFormattedTime(item.time) + '\n' + item.address}
      subtitleStyle={{ fontFamily: 'Cabin-Regular', }}
      Component={TouchableScale}
      friction={90} //
      tension={100} // These props are passed to the parent component (TouchableScale)
      activeScale={0.95} //
      // chevronColor="black"
      linearGradientProps = {{
        colors: ['#76A1EF', '#FFFFFF'],
        start: [1, 0],
        end: [0.2, 0],
      }}
      leftIcon={{
        reverse: true,
        color: '#d1e1f8',
        name: 'snowflake-o',
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
        data={this.state.data}
        renderItem={this.renderItem}
        style={{ width: '100%' }}
        ItemSeparatorComponent={this.renderSeparator}
      />

    )
  }
}
