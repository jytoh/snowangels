import React from 'react';
import { View, StyleSheet, Button, Modal } from 'react-native';
import MapView from 'react-native-maps';
import MarkerOverlay from '../components/MarkerOverlay';


let state = {
    markers: []
  };
/**
 * Format from responseJson formatting {id, lat, lon, street1, street2} to MapView.Marker formatting {key, coordinate, title, description}
 * @param  {json} reponseJson This is the json from the get_all_corners GET request
 * @return {json}             in MapView.Marker formatting
 */
function formatGetAllCorners(responseJson) {
  console.log("response json from get all corners", responseJson);
  responseJson.map(x => {
    x.key = x.id
    delete x.id

    x.coordinate = {
      latitude: x.lat,
      longitude: x.lon
    }
    delete x.lat
    delete x.lon

    x.title = x.street1 + " & " + x.street2
    delete x.street1
    delete x.street2
  })
  return responseJson
}

function getAllCorners() {
  return fetch('http://127.0.0.1:5000/get_all_corners')
    .then((response) => response.json())
    .then((responseJson) => {
      state.markers = formatGetAllCorners(responseJson);
    })
    .catch((error) => {
      console.error(error);
    });
}


const usersMap = props => {
    const {userLocation, setModalVisible, setUserLocation, setModalTitle} = props;
    let usersMapState = {
      region: userLocation
    }
    let userLocationMarker = null;
    if (userLocation) {
        userLocationMarker = <MapView.Marker coordinate={ userLocation } pinColor="blue" title="My Location"/>
        usersMapState = {region: userLocation}
    }
    /**
     * changes the region for this components state and the state of HomeScreen
     * @param  {region} region (object with latitude, longitude, latitudeDelta, and longitudeDelta)
     */
    function onRegionChange(region) {
      usersMapState = {region: region}
      setUserLocation();
    }

    function cornerOnPress(title) {
      setModalTitle(title)
      setModalVisible()
    }

    return (
        <View style={styles.mapContainer}>
          <Button
            title="Get Corners"
            onPress={getAllCorners}
            style={styles.getCorners}
          />
          <MapView
              initialRegion={{
              latitude: 42.4451,
              longitude: -76.4837,
              latitudeDelta: 0.0622,
              longitudeDelta: 0.0421,
            }}
            region={usersMapState.region}
            onRegionChange={onRegionChange}
            style={styles.map}>
              {
              /*userLocationMarker*/
                  state.markers.map((marker, index) => {
                      return (
                          <MapView.Marker
                            key={index}
                            coordinate={marker.coordinate}
                            onPress = {() => {cornerOnPress(marker.title)}}
                            />
                      );
                  })
              }
              { userLocationMarker }
          </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: 800,
        marginTop: 0,
        zIndex: -1
    },
    map: {
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    button: {
        zIndex: 100,
        position: "absolute",
        top: 40,
        alignItems: "center"
    },
    getCorners: {
      position: "absolute",
      top: 200
    }
});

export default usersMap;
