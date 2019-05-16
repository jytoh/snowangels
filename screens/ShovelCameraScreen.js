import React from 'react';
import {
    Image,
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Alert
} from 'react-native';
import {SecureStore} from 'expo';
import {Camera, Permissions} from 'expo';
import MenuButton from '../components/MenuButton'
import {ImagePicker} from 'expo';
import {Feather} from '@expo/vector-icons';
import shorthash from 'shorthash';
import {FileSystem} from 'expo';
import Environment from "../config/environment";
import firebase from "../utils/firebase.js";
import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'
import Loader from '../components/Loader';


export default class ShovelCameraScreen extends React.Component {

    /*
    * State stores mainly user and camera information
    * bool hasPermission: whether or not the app has permission to 
    *   access the camera
    * string imageUri: uri of the captured image
    * string type: front camera vs back camera
    * string b64: base64 encoding of image. no longer needed to be
    *   stored in state if using a shorthash
    * bool loading: whether or not a component is loading
    */
    state = {
        hasPermission: null,
        imageUri: null,
        type: Camera.Constants.Type.back,
        b64: null,
        loading: false

    };

    /**
    * Invoked immedately after CameraScreen is mounted
    * and checks whether or not permission has been granted
    * for camera access. (Only needs granted once)
    */
    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasPermission: status === 'granted'});
    };

    /**
    * Capture photo through camera component
    * 
    * Stores the imageUri and the hash of the picture's
    * base64 encoding in the state 
    */
    async capturePicture() {
        if (this.camera) {
            this.setState({loading: true})
            let pic = await this.camera.takePictureAsync({base64: true})
                .then(pic => this.setState({
                        imageUri: pic.uri,
                        bytea: pic.base64.toByteArray,
                        hash: shorthash.unique(pic.base64)
                    }),
                )
                .catch(err => {
                    throw err;
                });
            this.setState({loading: false})
        } else {
        }
    };

    /**
    * Upload photo to the Firebase cloud storage
    * @param  {Number} cid Corner id at which user is taking a photo at 
    * @param  {Number} user_id User id of the user taking the photo
    */
    async uploadPicture(cid, user_id) {
        //Add the photo to the Firebase cloud as a binary lorge object
        try {
            this.setState({loading: true})
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
            const ref = firebase
                .storage()
                .ref()
                .child('images/' + this.state.hash + '.jpg');
            const snapshot = await ref.put(blob);
            const remoteUri = await snapshot.ref.getDownloadURL();
            // We're done with the blob, close and release it
            blob.close();
            var user_id = await SecureStore.getItemAsync('id')//user_id instead of google_id
            var user_id = await SecureStore.getItemAsync('id')

            var details = {
                'uid': user_id,
                'cid': cid, 
                'after_pic': remoteUri,
            };
            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }

        } catch (error) {
        }

        formBody = formBody.join("&");
        //POST call for new shovel  
        let response = await fetch('https://snowangels-api.herokuapp.com/new_shovel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody,
        }).catch(error => {
            console.log(error);
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
        });
        await this.setState({loading: false})
        this.props.navigation.navigate('Home');
    }

   /**
   * Retrieves the state from AsyncStorage
   * 
   * Initially used to retrieve the user_id for pic but now the
   * user_id is passed through screen props. This fuction is no
   * longer used but is kept here in case it is needed
   */
    async fetch_state() {
        try {
            const lastStateJSON = await AsyncStorage.getItem('lastState');
            const lastState = JSON.parse(lastStateJSON);
            this.setState({
                user_id: lastState.user_id,
            });
        } catch (error) {
            this.setState({
                user_id: null,
            })
        }
    };

    /*
    * Renders the camera
    * 
    * If permission is granted, the user is able to 
    * take a picture, upload or retake it, or return
    * to the home screen. If a photo is captured, it is
    * displayed on the screen. 
    */
    render() {
        const {navigation} = this.props;
        const cornerId = navigation.getParam('cornerId', 0);
        const uid = this.props.screenProps.uid;
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
                        <Loader loading={this.state.loading} />
                        <Image style={styles.image}
                               source={{uri: this.state.imageUri}}/>
                        <View style={styles.bottombar}>
                            <TouchableOpacity
                                style={styles.uploadphototouchable}
                                onPress={() => {
                                    this.uploadPicture(cornerId, uid);
                                    this.setState({imageUri: null});
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
                        <Loader loading={this.state.loading} />
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
                                <Text>Take a photo of the shoveled street corner.</Text>
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
        fontSize: txt.button,
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