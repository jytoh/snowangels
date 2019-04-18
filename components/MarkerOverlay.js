import React from 'react'
import { StyleSheet, View, Text, Button, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import geolib from 'geolib'

/**
 * The popup that appears when you click on a marker
 */


const MarkerOverlay = (props) => {
    /**
     * title: title of the point
     * visible: visibility of the marker
     */
    const { title, visible, setModalVisibility,
        userLocation, markerPosition, navigation } = props;

    var userState = null

    var isNearCorner = null;

    // maximum meters you are allowed to be from corner to report or start shovel
    const maxMetersAwayFromCorner = 10;

    if (!visible) {
        return null;
    }

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
                {latitude: pos.coords.latitude, longitude: pos.coords.longitude},
                {latitude: markerPosition.latitude, longitude: markerPosition.longtitude}
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

    async function fetch_state() {
        try {
          const lastStateJSON = await AsyncStorage.getItem('lastState');
          const lastState = JSON.parse(lastStateJSON);
          userState = {
            signedIn: lastState.signedIn,
            name: lastState.name,
            photoUrl: lastState.photoUrl,
            google_id: lastState.google_id,
            token: lastState.token,
            loaded: true,
            num_requests: lastState.num_requests,
            num_shovels: lastState.num_shovels,
            points: lastState.points
          }
        }
        catch (error) {
          userState = {
            signedIn: false,
            name: '',
            photoUrl: '',
            google_id: '',
            token: '',
            loaded: true,
            num_requests: 0,
            num_shovels: 0,
            points:0,
          }
        }
      };

    /**
     * Returns whether the user is logged in
     * UNIMPLEMENTED
     * @return {boolean}
     */
    async function checkIfUserIsLoggedIn() {
        await fetch_state()
        // change to userState.signedin later
        return !userState.signedIn
    }

    async function reportShovel()
    {
        if (await userIsNearCorner() && await checkIfUserIsLoggedIn()) {
            navigation.navigate('Camera')
        }
    }

    async function startShovel()
    {
        if(await userIsNearCorner() && await checkIfUserIsLoggedIn()) {
            navigation.navigate('Camera')
        }
    }

    return(
        <View style={styles.overlayContainer}>
            <View style={styles.intersectionTextContainer}>
                <Text style={styles.intersectionText}>{title}</Text>
                <Button title="Report Shovel"
                 onPress= {reportShovel}
                />
                <Button
                    title="Start Shovel"
                    onPress= {startShovel}
                />
                <Button title="Hide" onPress={() => setModalVisibility(false)}/>
            </View>
        </View>
        )
}



const styles = StyleSheet.create({
    topContainer: {
        height: '33.333%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    overlayContainer: {
        height: '33.33%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'powderblue',
        flex: 1
    },
    intersectionText: {
        textAlign: 'center',
        fontSize: 30,
    },
    intersectionTextContainer: {
        marginTop: '10%'
    }
})

export default MarkerOverlay;