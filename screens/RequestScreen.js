import React from 'react';
import {
    Button,
    Image,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import {List, ListItem} from 'react-native-elements';
import MenuButton from '../components/MenuButton'
import TouchableScale from 'react-native-touchable-scale';
import {SecureStore} from "expo";

import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'


export default class RequestScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reqs: [], tab: 0};
        this.sendRequest();
    }

    change_tab(tab) {
        this.setState({tab: tab});
        try {
            this.sendRequest();
        } catch (error) {

        }
    }

    keyExtractor = (item) => item.request_id.toString();

    getHumanReadableState(item) {
        if (item.state == 0) {
            return 'Request Fulfilled'
        } else if (item.state == 1) {
            return 'Corner Requested'
        } else if (item.state == 2) {
            return 'Corner Shoveled'
        }
    }

    /**
     * @return {string}      ex: Tue, Apr 30 2019
     */
    getHumanReadableDate(item) {
        var dateString = (new Date(item.time + ' UTC')).toDateString()
        return dateString.substring(0, 3) + ", " + dateString.substring(4, dateString.length)
    }

    getHumanReadableSubtitle(item) {
        return this.getHumanReadableTime(item) +
            '\n' +
            item.street2 + ' & ' + item.street1 +
            '\n' +
            this.getHumanReadableState(item);
    }

    /**
     * @return {string}      ex: 4:02:32 PM
     */
    getHumanReadableTime(item) {
        var jsDateTime = new Date(item.time + ' UTC')
        return jsDateTime.toLocaleTimeString('en-US')
    }

    renderItem = ({item}) => (
        <ListItem
            title={this.getHumanReadableDate(item)}
            titleStyle={{fontFamily: txt.bold, fontSize: txt.small}}
            subtitle={this.getHumanReadableSubtitle(item)}
            subtitleStyle={{fontFamily: txt.reg, fontSize: (txt.small - scale(2))}}
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
            onPress={() => this.al(item.request_id, item.state)}
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
        this.sendRequest();
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                <MenuButton navigation={this.props.navigation}/>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.reqs}
                    renderItem={this.renderItem}
                    style={{width: '100%'}}
                    ItemSeparatorComponent={this.renderSeparator}
                />
            </View>
        )
    }

    al(rid, st) {
        if (this.state.tab == 0 || this.state.tab == 1) {
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
        } else if (this.state.tab == 2) {
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
                        text: 'See before and after pictures of corner',
                        onPress: () => this.props.navigation.navigate('Confirm',{rid})
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

        // if(this.state.showImage){

        //     return (
        //     <View>
        //     <Text style={{
        //         fontSize: 25,
        //         fontFamily: 'Cabin-Bold',
        //         justifyContent: 'center',
        //         color: 'black',
        //         paddingTop: 40
        //     }}>Before Shovel</Text>
        //     <Image
        //     style={{width: 300, height: 300}}
        //     source={{uri: this.state.before_pic}}
        //     />
        //     <Text style={{
        //         fontSize: 25,
        //         fontFamily: 'Cabin-Bold',
        //         justifyContent: 'center',
        //         color: 'black',
        //         paddingTop: 20
        //     }}>After Shovel</Text>
        //     <Image
        //     style={{width: 300, height: 300}}
        //     source={{uri: this.state.after_pic}}
        //     />
        //     <Button title="Go back to request screen" size='30' onPress= {this.returnToRequest}/>
        //     </View> 
        //     )
        //     }

        return (
            <View colors={[, '#DDE8FC', '#76A1EF']}
                  style={styles.header}>
                <Text style={{
                    fontSize: txt.header,
                    fontFamily: txt.bold,
                    color: 'white',
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

    returnToRequest = async () => {
        this.setState({showImage: false})
    }

    async showPictures(rid) {
        let response = await fetch(
      'https://snowangels-api.herokuapp.com/corner_pictures?request_id=' + rid
    );
        pics = await response.json()
        this.setState({before_pic: pics.before_pic, after_pic: pics.after_pic, showImage: true})
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
            });
        this.sendRequest();
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
}

const styles = StyleSheet.create({
    text: {
        fontSize: txt.header,
        fontFamily: txt.reg
    },
    header: {
        backgroundColor: '#76A1EF',
        padding: scale(15),
        paddingTop: scale(35),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '18%'
    },
    h1: {
        fontSize: txt.small,
        fontFamily: txt.reg,
        color: 'white'
    },
    button: {
        zIndex: 9,
        alignItems: 'center',
        top: scale(80),
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        width: '100%'
    },
    row: {
        padding: scale(15),
        marginBottom: scale(5),
        backgroundColor: '#D1E1F8',
    },
    buttonContainer: {
        margin: scale(20)
    }
});