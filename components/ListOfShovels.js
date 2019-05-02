import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from "react-native-elements";
import TouchableScale from 'react-native-touchable-scale';
import { SecureStore } from 'expo';

import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'

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

    var user_shovels = [];
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
    var userShovels = this.getSpecificUserShovels(json, user_id);
    this.setState({ data: userShovels });
  }

  /**
   * @return {string}      ex: Tue, Apr 30 2019
   */
  getHumanReadableDate(item) {
    var onlyDate = item.time.substring(0, 10)
    var dateString = (new Date(onlyDate)).toDateString()
    return dateString.substring(0, 3) + ", " + dateString.substring(4, dateString.length)
  }

  /**
   * item.time : ex: 2019-04-14 14:02:55.955310
   * wantTime: ex: 2019/04/14, 14:02:55
   * @return {string}      ex: 4:02:32 PM
   */
  getHumanReadableTime(item) {
    var itemTime = item.time
    var year = itemTime.substring(0, 4)
    var month = itemTime.substring(5, 7)
    var day = itemTime.substring(8, 10)
    var time = itemTime.substring(11, 19)
    var wantTime = year + "/" + month + "/" + day + ", " + time
    var jsDateTime = new Date(wantTime + "UTC")
    return jsDateTime.toLocaleTimeString('en-US')
  }

  renderItem = ({ item }) => (
    <ListItem
      title={this.getHumanReadableDate(item)}
      titleStyle={{ fontFamily: txt.bold, fontSize: txt.small }}
      subtitle={this.getHumanReadableTime(item) + '\n' + item.address}
      subtitleStyle={{ fontFamily: txt.reg, fontSize: (txt.small - scale(2))}}
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
    this.fetchData();
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
