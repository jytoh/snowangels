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
import {SecureStore} from "expo";

export default class AdministratorScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reqs: [], tab: 0, showImage: false, before_pic: "", after_pic: ""};
    }

    /**
    * Updates state of tab in component and updates requests that show up based on tab clicked
    */
    change_tab(tab) {
        this.setState({tab: tab});
        try {
            this.sendRequest();
        } catch (error) {

        }
    }

 

    keyExtractor = (item) => item.request_id.toString();

    /**
     * Returns header title of tab
     * @return {string}      ex: Request Fulfilled
     */
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

    /**
     * Returns street names 
     * @return {string}      ex: University Ave & Stewart Ave 
     */
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
            titleStyle={{fontFamily: 'Cabin-Bold',}}
            subtitle={this.getHumanReadableSubtitle(item)}
            subtitleStyle={{fontFamily: 'Cabin-Regular',}}
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
            )
            
    }

    /**
    * Display pop-up when administrator clicks a request on the request screen
    * @param  {Number} rid ID of the request
    * @param  {Number} st reflects the tab that the administrator is on
    */
    al(rid, st) {
        //Requests that no user has shoveled yet (tab state = 0 request has been validated)
        if (this.state.tab == 0) {
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
        //requests that have already been validated (tab state = 1 request made on corner but it hasn't been shoveled yet or has been shoveled but not validated yet)
        else if (this.state.tab == 1) {
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
                        onPress: () => this.showPictures(rid)
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


    /**
    * Updates state to reflect requests that fall under the tab that was clicked
    */
    async sendRequest() {
        var user_id = await SecureStore.getItemAsync('id');
        var st = this.state.tab;
        if (st==0){
            var re = await fetch('https://snowangels-api.herokuapp.com/get_all_requests_not_shoveled',
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
        } else {
            var re = await fetch('https://snowangels-api.herokuapp.com/get_requests_shoveled',
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


    }

    /**
    * Validate a user's shovel
    * @param  {Number} rid ID of the request 
    * @param  {Number} vb Valid bit: 0 if corner was not shoveled properly, 1 if it was
    */
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

        //Fetch call to validate shovel
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

    /**
    * Remove a request from the database
    * @param  {Number} rid ID of the request
    */
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
    
    /**
    * Sets state to stop showing before and after images and return back to the requests list
    */
    returnToRequest = async () => {
        this.setState({showImage: false})
    }

    /**
    * Show pictures of a corner before and after it was shoveled
    * @param  {Number} rid ID of the request 
    */
    async showPictures(rid) {
        let response = await fetch(
      'https://snowangels-api.herokuapp.com/corner_pictures?request_id=' + rid
    );
        var pics = await response.json();
        this.setState({before_pic: pics.before_pic, after_pic: pics.after_pic, showImage: true})
    }


    /**
    * Display header of Requests component
    * @return  {Object} view of header
    */
    renderHeader() {
        if(this.state.showImage){

            return (
            <View>
            <Text style={{
                fontSize: 25,
                fontFamily: 'Cabin-Bold',
                justifyContent: 'center',
                color: 'black',
                paddingTop: 40
            }}>Before Shovel</Text>
            <Image
            style={{width: 300, height: 300}}
            source={{uri: this.state.before_pic}}
            />
            <Text style={{
                fontSize: 25,
                fontFamily: 'Cabin-Bold',
                justifyContent: 'center',
                color: 'black',
                paddingTop: 20
            }}>After Shovel</Text>
            <Image
            style={{width: 300, height: 300}}
            source={{uri: this.state.after_pic}}
            />
            <Button title="Go back to request screen" size='30' onPress= {this.returnToRequest}/>
            </View> 
            )
            }

       return (
            <View colors={[, '#DDE8FC', '#76A1EF']}
                  style={styles.header}>
                <Text style={{
                    fontSize: 25,
                    fontFamily: 'Cabin-Bold',
                    color: 'white',
                    paddingTop: 20
                }}>All Requests</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 15,
                    marginTop: 20
                }}>

                <Text onPress={() => this.change_tab(0)}
                          style={styles.h1}>Remove Pending Requests</Text>
                    <Text style={styles.h1}> | </Text>
                    <Text onPress={() => this.change_tab(1)}
                          style={styles.h1}>Validate Shovels</Text>
                </View>
            </View>
        )
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
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        width: '100%'
    },
    h1: {
        fontSize: 18,
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