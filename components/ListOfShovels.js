import React from 'react';
import { AppRegistry, FlatList, StyleSheet, Text, View } from 'react-native';
import { List, ListItem } from "react-native-elements";

export default class ListOfShovels extends React.Component {
  render() {
    return (
      // <View style={styles.container}>
      //   <FlatList
      //     data={[
      //       { key: 'Shovel 1' },
      //       { key: 'Shovel 2' },
      //       { key: 'Shovel 3' },
      //       { key: 'Shovel 4' },
      //       { key: 'Shovel 5' },
      //       { key: 'Shovel 6' },
      //       { key: 'Shovel 7' },
      //       { key: 'Shovel 8' },
      //     ]}
      //     renderItem={({ item }) => <Text style={styles.item}>{item.key}</Text>}
      //   />

      // </View>

      // <View style={styles.container}>
      //   <ListItem title="Shovel 1" />
      //   <ListItem title="Shovel 2" />
      //   <ListItem title="Shovel 3" />
      //   <ListItem title="Shovel 4" />
      //   <ListItem title="Shovel 5" />
      //   <ListItem title="Shovel 6" />
      //   <ListItem title="Shovel 7" />

      // </View>
      <List containerStyle={{ marginBottom: 20 }}>
        {
          list.map((l) => (
            <ListItem
              roundAvatar
              avatar={{ uri: l.avatar_url }}
              key={l.name}
              title={l.name}
            />
          ))
        }
      </List>

    );
  }
}

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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})
