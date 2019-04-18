import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton'
import {SecureStore} from "expo";

const JsonTable = require('ts-react-json-table');
export default class RequestScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {"cornerslist" :[]};
        this.getCorners();

    }
    async getCorners() {
            fetch('https://snowangels-api.herokuapp.com/get_all_corners')
  .then(response => response.json())
  .then((jsonData) => {
    // jsonData is parsed json object received from url
      this.setState({"cornerslist": jsonData});
    console.log(jsonData)
  })
  .catch((error) => {
      // handle your errors here
      console.error(error)
  })}

    async sendRequest() {
        var user_id = await SecureStore.getItemAsync('id');
          await fetch('https://snowangels-api.herokuapp.com/new_request' ,
            {
              method: 'POST',
              headers: {Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify({
                'uid': user_id,
                'cid': 1,
                'before_pic': 'sd'
              })
            }).then(response => response.text()).then((jsonData) => {console.log(jsonData)}).catch((error) => {
      // handle your errors here
      console.error(error)
  })
    }
    render() {
        return (
        <View style={styles.container}>
            <Button title= "Send Request"
                onPress={() => this.sendRequest()}/>
        </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
  },
  button: {
    zIndex: 9,
    alignItems: 'center',
    top: 80,
  }
});