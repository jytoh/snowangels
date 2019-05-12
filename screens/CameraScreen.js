import React from 'react';
import {
    Image,
    TouchableOpacity,
    SafeAreaView,
    Button,
    StyleSheet,
    Text,
    View,
    Dimensions
} from 'react-native';
import MenuButton from '../components/MenuButton'
// import Camera from 'react-native-camera';
import {SecureStore} from 'expo';

import {Camera, Permissions} from 'expo';
// import {decode as atob, encode as btoa} from 'base-64';
import shorthash from 'shorthash';

import firebase from "../utils/firebase.js";

import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'

export default class CameraScreen extends React.Component {

    state = {
        hasPermission: null,
        imageUri: null,
        type: Camera.Constants.Type.back,
        b64: null,
    }

    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasPermission: status === 'granted'});
        //await this.fetch_state();
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

    async uploadPicture(cid, user_id) {
        console.log('from upload picture', user_id);

        try {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', this.state.imageUri, true);
                xhr.send(null);
            });
            // console.log("b");
            const ref = firebase
                .storage()
                .ref()
                .child('images/' + this.state.hash + '.jpg');
            const snapshot = await ref.put(blob);
            //var user_id = await SecureStore.getItemAsync('id');
            const remoteUri = await snapshot.ref.getDownloadURL();
            var details = {
                'uid': user_id,
                'cid': cid, //hardcoding for now
                'before_pic': remoteUri,
            };
            // console.log("c");
            // We're done with the blob, close and release it
            blob.close();
               } catch (error) {
        }

            // console.log(remoteUri)

            // console.log("hi3 " + decode(this.state.b64, 'escape' ));

            // let filename = this.state.imageUri.split('/').pop();
            // let match = /\.(\w+)$/.exec(filename);
            // let type = match ? `image/${match[1]}` : `image`;

            // console.log(this.state.hash);
            //user_id instead of google_id
            // console.log(user_id)
            // console.log(cid)

            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }

            formBody = formBody.join("&");
            await fetch('https://snowangels-api.herokuapp.com/new_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
            }).catch((error) => {
                console.error(error);
            });
            this.props.navigation.navigate('Home')
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
        const uid = this.props.screenProps.uid;
        console.log('camera state, cid =', cornerId);
        console.log('camera state, uid =', uid);
        const {hasPermission} = this.state;
        const {imageUri} = this.state;
        if (hasPermission === null) {
            return <View/>;
        } else if (hasPermission === false) {
            return (
                <SafeAreaVew><Text>No access to camera</Text></SafeAreaVew>);
        } else {
            if (this.state.imageUri) {
                return (
                    <View style={styles.container}>
                        <Image style={styles.image}
                               source={{uri: this.state.imageUri}}/>
                        <View style={styles.bottombar}>
                            <TouchableOpacity
                                style={styles.uploadphototouchable}
                                onPress={() => {
                                    this.uploadPicture(cornerId, uid);
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
                         <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => {
                                    this.setState({imageUri: null})
                                    this.props.navigation.navigate('Home')
                                }}>
                                <Text
                                    style={styles.backText}>
                                    {' '}Back to Map{' '}
                                </Text>
                        </TouchableOpacity>
                        <Camera
                            ref={ref => {
                                this.camera = ref;
                            }}
                            style={styles.camera}
                            type={this.state.type}>
                        </Camera>
                        <View style={styles.bottombar}>
                            <View
                                style={styles.helpText}
                                >
                                <Text>Take a photo of the snow covered street corner.</Text>
                            </View>
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
    helpText: {
        flex: 1,
    },
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    camera: {
        flex: 6,
        width: '100%',
        height: '100%',
    },
    backButton: {
        zIndex: 9,
        position: "absolute",
        top: scale(40),
        left: scale(20),
        backgroundColor: '#E1EAFB'
    },
    backText:{
        fontSize: txt.button,
        fontFamily: txt.bold,
        color: '#76A1EF'
    },
    bottombar: {
        flex: 1,
        backgroundColor: '#E1EAFB',
        flexDirection: 'column',
        alignItems: 'center',
        height: scale(150)
    },
    takephototouchable: {
        flex: 3,
        width: Dimensions.get('window').width * 0.4,
        backgroundColor: '#E1EAFB'
    },
    takephoto: {
        fontSize: txt.button + 2,
        marginBottom: scale(20),
        color: '#76A1EF',
        textAlign: 'center',
        alignItems: 'center',
        paddingTop: scale(12),
        fontFamily: txt.bold
    },
    fliptouchable: {
        flex: 2,
    },
    flip: {
        fontSize: txt.small,
        color: '#76A1EF',
        textAlign: 'center',
        paddingBottom: scale(24),
        marginTop: scale(10),
        fontFamily: txt.bold
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