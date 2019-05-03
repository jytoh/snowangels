import React from 'react'
import {
    Dimensions,
    StyleSheet,
    View,
    Text,
    Button,
    Modal,
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
        title, visible, setModalVisibility,
        userLocation, markerPosition, navigation, signedIn, uid, cornerId
    } = props;

    var isNearCorner = null;

    // maximum meters you are allowed to be from corner to report or start shovel
    const maxMetersAwayFromCorner = 400;

    if (!visible) {
        return null;
    }
    ;

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
         * @param  {navigator.geolocation obj}  pos            the user's location
         * @param  {latitude: number, longtitude: number}  markerPosition the position
         *                                                                of the marker
         *                                                                in question
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

    function any_recs_not_compl(reqs){

        return reqs.some(req => (req.state > 0))    }

    function alreadyReq() {
        Alert.alert(
            'Corner Already Requested',
            "You can't make a request for a shoveling of this corner, likely" +
            " because" +
            " a request has already been made by someone else.",
            [

                {
                    text: 'OK', onPress: () => {
                    }
                },
            ],
            {cancelable: false},
        );
    }

    function outsideRadius() {
        Alert.alert(
            'Out of Range',
            "You can't make a request for a shoveling of this corner, likely" +
            " because" +
            " you are outside the geofence of this corner.",
            [

                {
                    text: 'OK', onPress: () => {
                    }
                },
            ],
            {cancelable: false},
        );
    }

    async function sendRequest() {
        const userIsNearCorner = await userIsNearCorner();

        var user_id = await SecureStore.getItemAsync('id');
        var re = await fetch('https://snowangels-api.herokuapp.com/get_corners_requests?cid=%d1'.replace("%d1", cornerId),
            {
                method: 'GET'
            }).then(response => response.json())
            .then((jsonData) => {
                return jsonData;

            }).catch((error) => {
                // handle your errors here
                console.error(error)
            });
        console.log(re);
        console.log(any_recs_not_compl(re).toString());
        if( userIsNearCorner == false ){
            outsideRadius();
        }
        else if(re.length > 0 &&any_recs_not_compl(re)){
            alreadyReq();
        }
        else {
            if (await signedIn && userIsNearCorner) { //userIsNearCorner() &&
                navigation.navigate('Camera', {
                    uid: uid,
                    cornerId: cornerId
                });
            }
        }
    }

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

    async function sendShovel() {
        if (await signedIn) { //userIsNearCorner() &&
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
                        console.error(error)
                    });
                console.log(re);
                if (re.length == 0){
                    al();
                    return;
                }
                if (await signedIn) { //userIsNearCorner() && 
                    navigation.navigate('ShovelCamera', {
                        uid: uid,
                        cornerId: cornerId
                    });
                    //navigation.navigate('Camera')
                }
            } catch {
                al();
            }
            //   var user_id = await SecureStore.getItemAsync('id')//user_id instead of google_id
            //   var params = {
            //       uid: user_id,
            //       cid: cornerId, //hardcoding for now
            //       after_pic: "d",
            //   };

            //   var formBody = [];
            // for (var property in params) {
            //   var encodedKey = encodeURIComponent(property);
            //   var encodedValue = encodeURIComponent(params[property]);
            //   formBody.push(encodedKey + "=" + encodedValue);
            // }
            // formBody = formBody.join("&");
            //   var sh = await fetch("https://snowangels-api.herokuapp.com/new_shovel", {
            //       method: 'POST',
            //       headers: {
            //           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            //       },
            //       body: formBody

            //   }).then(response => response.json()).then(responseJson => {
            //           return responseJson;
            //       }
            //   ).catch((error) => {
            //       // handle your errors here
            //       al();
            //   });
        }
    }

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
            <TouchableOpacity onPress={sendRequest} style={styles.buttonStyle}>
                <View style={styles.request}>
                    <Text style={styles.buttonText}>Request a Snow Angel</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendShovel} style={styles.buttonStyle}>
                <View style={styles.request}>
                    <Text style={styles.buttonText}>Record a Shoveling
                        Job</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
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
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width * 0.5,
        opacity: 1,
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