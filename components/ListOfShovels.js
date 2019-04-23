import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from "react-native-elements";
import TouchableScale from 'react-native-touchable-scale';

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
    this.setState({ data: json });
    //console.log(this.setState);
  }



  // getSpecificUser(arr, uid) {
  //   user_shovels = [];
  //   for (let userObject of arr) {
  //     if (userObject.uid == uid) {

  //     }
  //   }
  // }

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