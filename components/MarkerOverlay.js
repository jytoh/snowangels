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
    const maxMetersAwayFromCorner = 500;

    if (!visible) {
        return null;
    }

    /**
     * Returns a boolean whether the user is less than or equal to distanceBetween
     * meters away
     * Uses the geolib library
     * @return {boolean}
     */
    function checkIfUserIsNearCorner() {
        // await for geolocation
        function isNearThreshold(pos, markerPosition) {
            var distanceBetween = geolib.getDistance(
                {latitude: pos.coords.latitude, longitude: pos.coords.longitude},
                {latitude: markerPosition.latitude, longitude: markerPosition.longtitude}
            )
            return distanceBetween <= maxMetersAwayFromCorner
        }

        return isNearThreshold({coords: {longitude: markerPosition.longtitude, latitude: markerPosition.latitude}}, markerPosition)
    }

    async function fetch_state() {
        try {
          console.log('got here');
          const lastStateJSON = await AsyncStorage.getItem('lastState');
          console.log(lastStateJSON)
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
          console.log('Got last state');
        }
        catch (error) {
          console.log('No last state to fetch');
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
        // chenge to userState.signedin later
        return !userState.signedIn
    }

    async function reportShovel()
    {
        if (checkIfUserIsNearCorner() && await checkIfUserIsLoggedIn()) {
            navigation.navigate('Camera')
        }
    }

    function startShovel()
    {
        if(checkIfUserIsNearCorner() && checkIfUserIsLoggedIn()) {
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

// report shovel
/*async () => {
        try {
            var details = {
            'uid': 1,
            'cid': 1,
            'before_pic': "a",
          };

        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let response2 = await fetch('http://127.0.0.1:5000/new_request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody,
            });
        let responseJson2 = await response2.json();

        console.log(responseJson2);
        console.log(responseJson2.user);
        console.log(responseJson2.corner);
        console.log(responseJson2.username);
        console.log("Report Shovel");



        } catch (error) {
            console.error(error);
        }
    }
    */

   // start shovel
   /*{async () => {
        try {
        var details = {
        'uid': 1,
        'cid': 1,
        'before_pic': "a",
        'after_pic': "a",
        };

        var formBody = [];
        for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let response2 = await fetch('http://127.0.0.1:5000/new_shovel', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
        });
        let responseJson2 = await response2.json();

        console.log(responseJson2);
        console.log(responseJson2.user);
        console.log(responseJson2.corner);
        console.log(responseJson2.username);
        console.log("Start Shovel");


            // let response = await fetch(
            //     'http://127.0.0.1:5000/corner_street_names?cid=3'
            // );
            // let responseJson = await response.json();
            // console.log(responseJson.street1);
        } catch (error) {
            console.error(error);
        }
    }*/