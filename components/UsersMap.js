import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView from 'react-native-maps';

let state = {
    markers: [
      {
        coordinate: {
          latitude: 42.4427,
          longitude: -76.4959,
        },
        title: "Best Place",
        description: "This is the best place in Portland",
      },
      {
        coordinate: {
          latitude: 42.4427,
          longitude: -76.4957,
        },
        title: "Second Best Place",
        description: "This is the second best place in Portland",
      },
      {
        coordinate: {
          latitude: 42.4426,
          longitude: -76.4959,
        },
        title: "Third Best Place",
        description: "This is the third best place in Portland",
      },
      {
        coordinate: {
          latitude: 42.4426,
          longitude: -76.4957,
        },
        title: "Fourth Best Place",
        description: "This is the fourth best place in Portland",
      },
    ],
    region: {
      latitude: 45.52220671242907,
      longitude: -122.6653281029795,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  };

const usersMap = props => {
    let userLocationMarker = null;
    if (props.userLocation) {
        userLocationMarker = <MapView.Marker coordinate={ props.userLocation }/>
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
              region={props.userLocation}
              style={styles.map}>
                {
                /*userLocationMarker*/
                    state.markers.map((marker, index) => {
                        return (
                            <MapView.Marker key={index} coordinate={marker.coordinate} />
                        );
                    })
                }

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
    }
});

export default usersMap;