import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    Alert,
    TouchableOpacity
} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import geolib from 'geolib'
import {SecureStore} from "expo";
import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'

/**
 * The popup that appears when you click on a marker
 */


const MarkerOverlay = (props) => {
    /**
     * title: title of the point
     * visible: visibility of the marker
     */
    const {
        title, visible, setModalVisibility, markerPosition, navigation, signedIn, uid, cornerId,
        cornerState
    } = props;

    state = {
        refreshValue: 1
    }

    // maximum meters you are allowed to be from corner to report or start shovel
    const maxMetersAwayFromCorner = 400;

    if (!visible) {
        return null;
    };

    /**
     * Returns a boolean whether the user is less than or equal to distanceBetween
     * meters away
     * Uses the geolib library
     * @return {boolean}
     */
    async function userIsNearCorner() {

        /**
         * Checks to see if the user position is near the maxMetersAwayFromCorner
         * threshold
         * @param  {navigator.geolocation obj}  pos    the user's location
         * @param  {latitude: number, longtitude: number}  markerPosition
         *                            theposition of the marker in question
         * @return {Boolean}                if near threshold
         */
        function isNearThreshold(pos, markerPosition) {
            var distanceBetween = geolib.getDistance(
                {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                },
                {
                    latitude: markerPosition.latitude,
                    longitude: markerPosition.longtitude
                }
            )
            return distanceBetween <= maxMetersAwayFromCorner
        }

        async function userPositionPromise() {
            return new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej)
            });
        }

        var userPosition = await userPositionPromise();
        return isNearThreshold(userPosition, markerPosition)
    }

    /**
     * Returns whether or not there is an unshoveled
     * request at the corner
     * 
     * @param {*} reqs The corner object
     */
    function any_recs_not_compl(reqs){

        return reqs.some(req => (req.state == 1))
    }

    /**
     * Displays popup if the corner is already requested.
     * @return {void}
     */
    function alreadyReq() {
        Alert.alert(
            'Corner Already Requested',
            "Already requested",
            [

                {
                    text: 'OK', onPress: () => {
                    }
                },
            ],
            {cancelable: false},
        );
    }

     /**
     * Displays popup if the user is outside the radius of the corner, which is 
     * set in const maxMetersAwayFromCorner. 
     * @return {void}
     */
    function outsideRadius() {
        Alert.alert(
            'Out of Range',
            "Get in range to request or shovel",
            [

                {
                    text: 'OK', onPress: () => {
                    }
                },
            ],
            {cancelable: false},
        );
    }

    
    /**
    * Checks if the user is signed in and close enough to the corner and requests the corner. 
    * Changes the state of the corner to be requested, and navigates to the camera screen 
    * so the user can take a picture of the corner.
    * @return {void}
    */
   async function sendRequest() {
        const a = await userIsNearCorner();
            var user_id = await SecureStore.getItemAsync('id');
            var re = await fetch('https://snowangels-api.herokuapp.com/get_corners_requests?cid=%d1'.replace("%d1", cornerId),
                {
                    method: 'GET'
                }).then(response => response.json())
                .then((jsonData) => {
                    return jsonData;
                }).catch((error) => {
                });
            if( a == false ){
                outsideRadius();
            }
            else if(re.length > 0 &&any_recs_not_compl(re)){
                alreadyReq();
            }
            else {
                if (await signedIn && a) { 
                    navigation.navigate('Camera', {
                        uid: uid,
                        cornerId: cornerId
                    });
                }
            }
    }

    /**
     * Displays popup that the user is trying to shovel a corner that has not been requested.
     * @return {void}
     */
    function al() {
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

    /**
    * Checks if the user is signed in and close enough to the corner and  shovels the corner. 
    * Changes the state of the corner to be shoveled, and navigates to the camera screen 
    * so the user can take a picture of the corner.
    * @return {void}
    */
    async function sendShovel() {
        if (await signedIn) { 
            try {
                var user_id = await SecureStore.getItemAsync('id');
                var re = await fetch('https://snowangels-api.herokuapp.com/get_requests_filter_state_cid?cid=%d1&state=1'.replace("%d1", cornerId),
                    {
                        method: 'GET'
                    }).then(response => response.json())
                    .then((jsonData) => {
                        return jsonData;

                    }).catch((error) => {
                        // handle your errors here
                    });
                if (re.length == 0){
                    al();
                    return;
                }
                if (await signedIn) {
                    navigation.navigate('ShovelCamera', {
                        uid: uid,
                        cornerId: cornerId
                    });
                }
            } catch {
                al();
            }
        }
    }

    /*
    * Renders diffent popup depending on whether or not there
    * is a request
    */
    if (cornerState != 1) {
        return (
            <View style={styles.overlayContainer}>
                <Ionicons
                    name="ios-close-circle-outline"
                    color="#000000"
                    size={25}
                    style={styles.xButton}
                    onPress={() => setModalVisibility(false)}
                />
                <Text style={styles.intersectionText}>{title}</Text>
                <TouchableOpacity
                    onPress={sendRequest}
                    style={styles.buttonStyle}
                    >
                    <View style={styles.request}>
                        <Text style={styles.buttonText}>Request a Snow Angel</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <View style={styles.overlayContainer}>
                <Ionicons
                    name="ios-close-circle-outline"
                    color="#000000"
                    size={25}
                    style={styles.xButton}
                    onPress={() => setModalVisibility(false)}
                />
                <Text style={styles.intersectionText}>{title}</Text>
                <TouchableOpacity onPress={sendShovel} style={styles.buttonStyle}>
                    <View style={styles.request}>
                        <Text style={styles.buttonText}>Record a Shoveling
                            Job</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    overlayContainer: {
        height: '30%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#D1E1F8B3',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: scale(20)
    },
    xButton: {
        position: 'absolute',
        top: scale(10),
        left: scale(10)
    },
    intersectionText: {
        textAlign: 'center',
        fontSize: txt.header,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: txt.bold,
        paddingTop: scale(15)
    },
    request: {
        flex: 1,
        backgroundColor: '#76A1EF',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(25),
        opacity: 1,
        width: scale(250),
        maxHeight: scale(105)
    },
    buttonStyle: {
        flex: 1,
        marginBottom: scale(7),
        marginTop: scale(7)
    },
    buttonText: {
        color: 'white',
        fontFamily: txt.bold,
        textAlign: 'center',
        fontSize: txt.button - 2
    }
})

export default MarkerOverlay;