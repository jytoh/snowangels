import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton'

export default class RequestScreen extends React.Component {

    async sendRequest() {
        try {                
            let formdata = new FormData();
            formdata.append('lat',34)
            formdata.append('long',34)
            formdata.append('street1','yay')
            formdata.append('street2','itworks!')
            //let response = await 
            await fetch(
                'http://127.0.0.1:5000/create_corner',{
                    method: 'POST',
                    headers: {
                         Accept: 'multipart/form-data',
                         'Content-Type': 'multipart/form-data',
                     },
                    body: formdata
                        // JSON.stringify({
                        // lat: '34',
                        // long: '40',
                        // street1: 'yay',
                        // street2: 'it works!',
                    //}),
                });
            //let responseJson = await response;
			//console.log(responseJson);
		} catch (error) {
			console.log("error!");
		}
	}
    render() {
        return (
        <View style={styles.container}>
            <Text style = {styles.text}>Request Screen</Text>
            <MenuButton navigation={this.props.navigation} />
            <View style={styles.button}>
                <Button title= "Send Request"
                onPress={() => this.sendRequest()}/> 
            </View>
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