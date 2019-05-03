import React from 'react';
import {
    Button,
    Image,
    StyleSheet,
    Text,
    View,
    Dimensions
} from 'react-native';
import {List, ListItem} from 'react-native-elements';
import MenuButton from '../components/MenuButton'
import TouchableScale from 'react-native-touchable-scale';
import {SecureStore} from "expo";

import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'

export default class ConfirmScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {before_pic: "", after_pic: ""};
        const {navigation} = this.props;
        var rid = navigation.getParam('rid',0);
        this.sendRequest();
        this.showPictures(rid)
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

    async componentDidMount() {
        console.log('at confirm screen rn')
    }

    async showPictures(rid) {
        let response = await fetch(
      'https://snowangels-api.herokuapp.com/corner_pictures?request_id=' + rid
    );
        var pics = await response.json();
        this.setState({before_pic: pics.before_pic, after_pic: pics.after_pic, showImage: true})
    }
    
    render() {
    console.log('at confirm screen rn')
    // const {navigation} = this.props;
    // rid = navigation.getParam('rid',0)
    return (
        <View style={styles.container}>
            <View style={styles.topPic}>
            <Text style={styles.text}>Before Shovel</Text>
            <Image
                style={styles.img}
                source={{uri: this.state.before_pic}}
            />
            </View>
            <View style={styles.topPic}>
            <Text style={styles.text}>After Shovel</Text>
            <Image
                style={styles.img}
                source={{uri: this.state.after_pic}}
            />
            </View>
            <View style={styles.buttonContainer}>
                <Button 
                    title="Return to Requests" 
                    style={styles.button} color="#FF0000" 
                    onPress= {() => this.props.navigation.navigate('Requests')}
                />
            </View>
        </View> 
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#76A1EF',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    topPic:{
        flex: 9,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: txt.header,
        fontFamily: txt.bold,
        justifyContent: 'center',
        textAlign: 'center',
        color: 'black',
        paddingTop: scale(40)
    },
    img:{
        height: scale(300),
        width: scale(300),
    },
    buttonContainer:{
        borderRadius: 4,
        borderWidth: 0.5,
        flex: 2,
        width: '100%',
        justifyContent: 'center',
    },
});