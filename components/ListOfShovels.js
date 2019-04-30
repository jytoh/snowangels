import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from "react-native-elements";
import TouchableScale from 'react-native-touchable-scale';
import { SecureStore } from 'expo';

const list2 = [
  {
    "address": "Willow Ave & Pier Rd",
    "name": "name1",
    "time": "2019-04-18 23:48:24.846858",
    "uid": 1,
  },
  {
    "address": "Wyckoff St & Dearborn Pl",
    "name": "name1",
    "time": "2019-04-18 23:48:24.846771",
    "uid": 1,
  },
  {
    "address": "Willet Pl & E Buffalo St",
    "name": "name2",
    "time": "2019-04-18 23:48:24.846810",
    "uid": 2,
  },
  {
    "address": "Woodcrest Terrace & Woodcrest Ave",
    "name": "name3",
    "time": "2019-04-18 23:48:24.846835",
    "uid": 3,
  },
]

// Array [
//   Object {
//     "address": "Wyckoff St & Heights Court",
//     "name": "Avinash Thangali",
//     "time": "2019-04-19 14:38:59.868978",
//     "uid": 2,
//   },
// ]

export default class ListOfShovels extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  // state = {
  //   data: [],
  //   loading: false,
  // }

  keyExtractor = (item, index) => index.toString()
  componentDidMount() {
    this.fetchData();
  }
 
  fetchData = async () => {
    const response = await fetch("https://snowangels-api.herokuapp.com/get_user_history");
    const json = await response.json();
    console.log(json);
    console.log("/////");
    var user_id = await SecureStore.getItemAsync('id');
    console.log("USER ID");
    console.log(user_id);
    var userShovels = this.getSpecificUserShovels(json, 2);
    this.setState({ data: userShovels });
    //console.log(this.setState);
  }

  renderItem = ({ item }) => (
    < ListItem
      title={item.time}
      titleStyle={{ fontFamily: 'Cabin-Bold', }}
      subtitle={item.address}
      subtitleStyle={{ fontFamily: 'Cabin-Regular', }}
      Component={TouchableScale}
      friction={90} //
      tension={100} // These props are passed to the parent component (TouchableScale)
      activeScale={0.95} //
      // chevronColor="black"
      linearGradientProps={{
        colors: ['#76A1EF', '#FFFFFF'],
        start: [1, 0],
        end: [0.2, 0],
      }}
      chevron
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
        style={{ width: 375 }}
        ItemSeparatorComponent={this.renderSeparator}
      />

    )
  }
}
