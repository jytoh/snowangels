import React from 'react';
import {Button, StyleSheet, Text, View, FlatList} from 'react-native';
import {List, ListItem} from 'react-native-elements';
import MenuButton from '../components/MenuButton'
import {SecureStore} from "expo";


export default class RequestScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reqs: []};
        this.sendRequest()

    }


    async sendRequest() {
        var user_id = await SecureStore.getItemAsync('id');
        var re = await fetch('https://snowangels-api.herokuapp.com/get_requests?uid=%d'.replace("%d", user_id),
            {
                method: 'GET'
            }).then(response => response.json())
            .then((jsonData) => {
            console.log(jsonData);
            return jsonData;

        }).catch((error) => {
            // handle your errors here
            console.error(error)
        })
        this.setState({
            reqs: re
        });
        console.log(this.state.reqs)
    }

    render() {
        console.log(this.state.reqs);
        return (
            <View style={{flex: 1, paddingTop: 50}}>
                <FlatList
                    data={this.state.reqs}
                    renderItem={({item}) =>
                        <Text>{item.corner_id}, {item.street2}, {item.street1}, {item.time}</Text>}
                    keyExtractor={item => item.request_id.toString()}
                />
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