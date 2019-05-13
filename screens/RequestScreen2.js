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
    
    /**
    * Display pop-up when user clicks a request on the request screen
    * @param  {Number} rid ID of the request
    */
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

    /**
    * Display header of Requests component
    * @return  {Object} view of header
    */
    renderHeader() {
        return (
            <View colors={[, '#DDE8FC', '#76A1EF']}
               style={styles.header}>
                <Text style={{ fontSize: 25, fontFamily: 'Cabin-Bold', color: 'white', paddingTop: 20}}>My Requests</Text>
                <View style={{
                   flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                   marginBottom: 15, marginTop: 20
                 }}>
               <Text style={styles.h1}>All</Text>
               <Text style={styles.h1}>  |  </Text>
               <Text style={styles.h1}>Pending</Text>
               </View>
             </View>
          )
    }

    /**
    * Updates state to reflect requests that fall under the tab that was clicked
    */
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

    /**
    * Remove a request from the database
    * @param  {Number} rid ID of the request
    */
    async removeRequest(rid) {
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
            {this.renderHeader()}
            <FlatList
                style={styles.container}
                data={this.state.reqs}
                renderItem={({item}) =>
                    (<TouchableWithoutFeedback
                        onPress={() => this.al(item.request_id)}>
                        <View style={styles.row}>
                            <Text style={{ fontSize: 15, fontFamily: 'Cabin-Bold', color: 'black'}}>
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
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
        fontFamily: 'Cabin-Regular'
    },
    header: {
        backgroundColor: '#76A1EF',
        padding: 15,
        paddingTop: 35,
        alignItems: 'center',
        width: '100%',
        height: '18%'
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
    h1: {
        fontSize: 24,
        color: 'white',
        fontFamily: 'Cabin-Bold',
    },
    row: {
        padding: 15,
        marginBottom: 5,
        backgroundColor: '#D1E1F8',
    },
    buttonContainer: {
        margin: 20
    }
});