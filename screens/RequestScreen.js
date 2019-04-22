import React from 'react';
import {
    Button,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import {List, ListItem} from 'react-native-elements';
import MenuButton from '../components/MenuButton'
import {SecureStore} from "expo";


export default class RequestScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reqs: []};
        this.sendRequest()

    }

    al(rid) {
        Alert.alert(
            'Sure?',
            'Do you want to remove this Request?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: 'OK', onPress: () => this.removeRequest(rid)},
            ],
            {cancelable: true},
        );
    }


    async sendRequest() {
        // var user_id = 2;
        var user_id = await SecureStore.getItemAsync('id');
        var re = await fetch('https://snowangels-api.herokuapp.com/get_requests?uid=%d'.replace("%d", user_id),
            {
                method: 'GET'
            }).then(response => response.json())
            .then((jsonData) => {
                return jsonData;

            }).catch((error) => {
                // handle your errors here
                console.error(error)
            })
        this.setState({
            reqs: re
        });
    }

    async removeRequest(rid) {
        // var rid = this.state.reqs[0].request_id;
        var re = await fetch('https://snowangels-api.herokuapp.com/remove_request?id=%d'.replace("%d", rid),
            {
                method: 'DELETE'
            }).then(response => response.json())
            .then((jsonData) => {
                return jsonData;

            }).catch((error) => {
                // handle your errors here
                console.error(error)
            })


        this.sendRequest();
    }

    render() {
        this.sendRequest();
        return (
            <View style={{flex: 1, backgroundColor: 'white',}}>
            <FlatList
                style={styles.container}
                data={this.state.reqs}
                renderItem={({item}) =>
                    (<TouchableWithoutFeedback
                        onPress={() => this.al(item.request_id)}>
                        <View style={styles.row}>
                            <Text style={{ fontSize: 15, fontFamily: 'Cabin-Bold', color: 'white', paddingTop: 20}}>
                                {"Corner id: " + item.corner_id} {"\nStreet" +
                            " 1: " + item.street2}{"\nStreet 2: " + item.street1}
                                {"\n" + item.time}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>)}
                keyExtractor={item => item.request_id.toString()}
            />
                <MenuButton navigation={this.props.navigation} />

            </View>
            // <View style={styles.buttonContainer}>
            //     <Button
            //         onPress={() => {
            //             this.removeRequest();
            //         }}
            //         title="Remove Most Recent Request"
            //     />
            // </View>

        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
    },
    button: {
        zIndex: 9,
        alignItems: 'center',
        top: 80,
    },
    container: {
        marginTop: 50,
        flex: 1,
    },
    row: {
        padding: 15,
        marginBottom: 5,
        backgroundColor: 'skyblue',
    },
    buttonContainer: {
        margin: 20
    }
});