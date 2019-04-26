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
        this.state = {reqs: [], tab: 1};
        this.sendRequest();
    }

    change_tab(tab) {
        this.setState({tab: tab});
        try {
            this.sendRequest();
            this.render()
        } catch (error) {

        }
    }


    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => (
        <ListItem
            title={item.time}
            titleStyle={{fontFamily: 'Cabin-Bold',}}
            subtitle={item.street2 + ' & ' + item.street1 + ', State: ' + item.state}
            subtitleStyle={{fontFamily: 'Cabin-Regular',}}
            // leftAvatar={{ source: { uri: item.avatar_url } }}
            leftIcon={{
                reverse: true,
                color: '#d1e1f8',
                name: 'snowflake-o',
                type: 'font-awesome'
            }}
            onPress={() => this.al(item.request_id)}
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
        // this.sendRequest();
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                <MenuButton navigation={this.props.navigation}/>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.reqs}
                    renderItem={this.renderItem}
                    style={{width: 400}}
                    ItemSeparatorComponent={this.renderSeparator}
                />
            </View>

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

    al(rid) {
        if (this.state.tab == 0 || this.state.tab == 2) {
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
        } else if (this.state.tab == 1) {
            Alert.alert(
                'Sure?',
                'Do you want to validate this Request?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: 'Invalid Shovel',
                        onPress: () => this.validateShovel(rid, 0)
                    },
                    {
                        text: 'Valid Shovel',
                        onPress: () => this.validateShovel(rid, 1)
                    },
                ],
                {cancelable: true},
            );
        }
    }

    renderHeader() {
        return (
            <View colors={[, '#DDE8FC', '#76A1EF']}
                  style={styles.header}>
                <Text style={{
                    fontSize: 25,
                    fontFamily: 'Cabin-Bold',
                    color: 'white',
                    paddingTop: 20
                }}>My Requests</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 15,
                    marginTop: 20
                }}>
                    <Text onPress={() => this.change_tab(0)}
                          style={styles.h1}>Pending</Text>
                    <Text style={styles.h1}> | </Text>
                    <Text onPress={() => this.change_tab(1)}
                          style={styles.h1}>Claimed</Text>
                    <Text style={styles.h1}> | </Text>
                    <Text onPress={() => this.change_tab(2)}
                          style={styles.h1}>Confirmed</Text>
                </View>
            </View>
        )
    }


    async sendRequest() {
        // var user_id = 2;
        var user_id = await SecureStore.getItemAsync('id');
        var st = this.state.tab;
        var re = await fetch('https://snowangels-api.herokuapp.com/get_requests_filter_state?uid=%d1&state=%d2'.replace("%d1", user_id).replace("%d2", st),
            {
                method: 'GET'
            }).then(response => response.json())
            .then((jsonData) => {

                this.setState({
                    reqs: jsonData
                });

            }).catch((error) => {
                // handle your errors here
            })

    }

    async validateShovel(rid, vb) {
        var details = {
            'request_id': rid,
            'vb': vb
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        var re = await fetch('https://snowangels-api.herokuapp.com/validate_shovel',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
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

    // render() {
    //     this.sendRequest();
    //     return (
    //         <View style={{flex: 1, backgroundColor: 'white',}}>
    //         {this.renderHeader()}
    //         <FlatList
    //             style={styles.container}
    //             data={this.state.reqs}
    //             renderItem={({item}) =>
    //                 (<TouchableWithoutFeedback
    //                     onPress={() => this.al(item.request_id)}>
    //                     <View style={styles.row}>
    //                         <Text style={{ fontSize: 15, fontFamily: 'Cabin-Bold', color: 'black'}}>
    //                             {"Corner id: " + item.corner_id} {"\nStreet" +
    //                         " 1: " + item.street2}{"\nStreet 2: " + item.street1}
    //                             {"\n" + item.time}
    //                         </Text>
    //                     </View>
    //                 </TouchableWithoutFeedback>)}
    //             keyExtractor={item => item.request_id.toString()}
    //         />
    //         <MenuButton navigation={this.props.navigation} />
    //         </View>
    //         // <View style={styles.buttonContainer}>
    //         //     <Button
    //         //         onPress={() => {
    //         //             this.removeRequest();
    //         //         }}
    //         //         title="Remove Most Recent Request"
    //         //     />
    //         // </View>

    //     );
    // }
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
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        width: '100%'
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