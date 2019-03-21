import React from 'react';
import { View, StyleSheet, Button, Modal } from 'react-native';
import MapView from 'react-native-maps';
import MarkerOverlay from '../components/MarkerOverlay';

let state = {
    markers: [
      {
        coordinate: {
          latitude: 42.44272,
          longitude: -76.49587,
        },
        title: "N Aurora St & E Court Street",
        description: "NW Corner",
      },
      {
        coordinate: {
          latitude: 42.44272,
          longitude: -76.49575,
        },
        title: "N Aurora St & E Court Street",
        description: "NE Corner",
      },
      {
        coordinate: {
          latitude: 42.44264,
          longitude: -76.49587,
        },
        title: "N Aurora St & E Court Street",
        description: "SW Corner",
      },
      {
        coordinate: {
          latitude: 42.44264,
          longitude: -76.49575,
        },
        title: "N Aurora St & E Court Street",
        description: "SE Corner",
      },
    ]
  };


const usersMap = props => {
    const {userLocation, setModalVisible, setUserLocation} = props;
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

    return (
        <View style={styles.mapContainer}>
            <MapView
                initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
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
                              title={marker.title}
                              description={marker.description}
                              onPress = {setModalVisible}
                              />
                        );
                    })
                }
                { userLocationMarker }
            </MapView>
        </View>
    );
};

function shouldComponentUpdate(nextProps, nextState) {
  return false;
}

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
    }
});

export default usersMap;