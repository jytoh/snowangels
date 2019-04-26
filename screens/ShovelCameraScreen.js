import React from 'react';
import {
    Image,
    TouchableOpacity,
    SafeAreaView,
    Button,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Alert
} from 'react-native';
import MenuButton from '../components/MenuButton'
// import Camera from 'react-native-camera';
import {SecureStore} from 'expo';

import {Camera, Permissions, ImagePicker} from 'expo';
import {Feather} from '@expo/vector-icons';
// import {decode as atob, encode as btoa} from 'base-64';
import shorthash from 'shorthash';
import {FileSystem} from 'expo';

import Environment from "../config/environment";
import firebase from "../utils/firebase.js";

export default class ShovelCameraScreen extends React.Component {

    state = {
        hasPermission: null,
        imageUri: null,
        type: Camera.Constants.Type.back,
        b64: null,
    };

    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasPermission: status === 'granted'});
        //await this.fetch_state();
    };

    static al() {
        Alert.alert(
            'Invalid Corner',
            "You can't validate a shoveling for this corner, likely because" +
            " a shoveling has not been requested yet.",
            [

                {
                    text: 'OK', onPress: () => {
                    }
                },
            ],
            {cancelable: false},
        );
    }

    async capturePicture() {
        if (this.camera) {
            let pic = await this.camera.takePictureAsync({base64: true})
                .then(pic => this.setState({
                        imageUri: pic.uri,
                        b64: pic.base64,
                        bytea: pic.base64.toByteArray,
                        hash: shorthash.unique(pic.base64)
                    }),
                    console.log("hi1 " + this.state.imageUri),
                    console.log("hi2 " + this.state.bytea),
                    console.log("hi3 " + this.state.b64),
                    console.log("hi4 " + this.state.hash),
                )
                .catch(err => {
                    throw err;
                });
            console.log('took a picture!');
            //let bytea = base64js.toByteArray(this.state.b64);
            //console.log(bytea);
        } else {
            console.log('doesnt enter')
        }
    };

    async uploadPicture(cid) {
        console.log('from upload picture', this.state.uid);
        console.log("hi1 " + this.state.imageUri);
        console.log("hi2 " + this.state.bytea);
        console.log("hi3 " + this.state.b64);
        console.log("hi4 " + this.state.hash);

        try {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', this.state.imageUri, true);
                xhr.send(null);
            });
            console.log("b");
            const ref = firebase
                .storage()
                .ref()
                .child('images/' + this.state.hash + '.jpg');
            const snapshot = await ref.put(blob);
            const remoteUri = await snapshot.ref.getDownloadURL();
            console.log("c");
            // We're done with the blob, close and release it
            blob.close();


            // console.log("hi3 " + decode(this.state.b64, 'escape' ));

            // let filename = this.state.imageUri.split('/').pop();
            // let match = /\.(\w+)$/.exec(filename);
            // let type = match ? `image/${match[1]}` : `image`;

            console.log(this.state.hash);
            var user_id = await SecureStore.getItemAsync('id')//user_id instead of google_id
            console.log(user_id)
            console.log(cid)
            console.log(remoteUri)

            console.log(remoteUri.toString())
            var details = {
                'uid': user_id,
                'cid': cid, //hardcoding for now
                'after_pic': remoteUri,
            };
            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            ;
            formBody = formBody.join("&");
            let response = await fetch('https://snowangels-api.herokuapp.com/new_shovel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
            }).catch(error => {
                console.log('error!');
                al();
            });
        } catch (error) {

        }
    }



    async fetch_state() {
        try {
            const lastStateJSON = await AsyncStorage.getItem('lastState');
            console.log(lastStateJSON)
            const lastState = JSON.parse(lastStateJSON);
            this.setState({
                user_id: lastState.user_id,
            });
            console.log('Got last state');
        } catch (error) {
            console.log('No last state to fetch');
            this.setState({
                user_id: null,
            })
        }
    };

    render() {
        const {navigation} = this.props;
        const cornerId = navigation.getParam('cornerId', 0);
        console.log('camera state, cid =', cornerId)
        const {hasPermission} = this.state;
        const {imageUri} = this.state;
        if (hasPermission === null) {
            return <View/>;
        } else if (hasPermission === false) {
            return (
                <SafeAreaVew><Text>No access to camera</Text></SafeAreaVew>);
        } else {
            if (this.state.imageUri) {
                console.log(this.state.imageUri);
                return (
                    <View style={styles.container}>
                        <Image style={styles.image}
                               source={{uri: this.state.imageUri}}/>
                        <View style={styles.bottombar}>
                            <TouchableOpacity
                                style={styles.uploadphototouchable}
                                onPress={() => {
                                    this.uploadPicture(cornerId);
                                    this.props.navigation.navigate('Home');
                                }}>
                                <Text
                                    style={styles.takephoto}>
                                    {' '}Upload Photo{' '}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.fliptouchable}
                                onPress={() => {
                                    this.setState({imageUri: null})
                                }}>
                                <Text
                                    style={styles.flip}>
                                    {' '}Retake Photo{' '}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>)
            } else {
                return (
                    <View style={styles.container}>
                        <MenuButton navigation={this.props.navigation}/>
                        <Camera
                            ref={ref => {
                                this.camera = ref;
                            }}
                            style={styles.camera}
                            type={this.state.type}>
                        </Camera>
                        <View style={styles.bottombar}>
                            <TouchableOpacity
                                style={styles.takephototouchable}
                                onPress={() => this.capturePicture()}>
                                <Text
                                    style={styles.takephoto}>
                                    {' '}Take a Photo{' '}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.fliptouchable}
                                onPress={() => {
                                    this.setState({
                                        type: this.state.type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back,
                                    });
                                }}>
                                <Text
                                    style={styles.flip}>
                                    {' '}Flip Camera{' '}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
            ;
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    camera: {
        flex: 6,
        width: '100%',
        height: '100%',
    },
    bottombar: {
        flex: 1,
        backgroundColor: '#E1EAFB',
        flexDirection: 'column',
        alignItems: 'center'
    },
    takephototouchable: {
        flex: 3,
        width: Dimensions.get('window').width * 0.4,
        backgroundColor: '#E1EAFB'
    },
    takephoto: {
        fontSize: 24,
        marginBottom: 20,
        color: '#76A1EF',
        textAlign: 'center',
        alignItems: 'center',
        paddingTop: 24,
        fontFamily: 'Cabin-Bold'
    },
    fliptouchable: {
        flex: 2,
    },
    flip: {
        fontSize: 16,
        color: '#76A1EF',
        textAlign: 'center',
        paddingBottom: 24,
        marginTop: 10,
        fontFamily: 'Cabin-Bold'
    },
    image: {
        zIndex: 100,
        flex: 6,
    },
    uploadphototouchable: {
        flex: 3,
        width: Dimensions.get('window').width * 0.4,
        backgroundColor: '#E1EAFB'
    }

});