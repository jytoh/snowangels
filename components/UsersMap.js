import React from 'react';
import { View, StyleSheet, Button, TouchableHighlight, TouchableOpacity, Text, ScrollView } from 'react-native';
import MapView, { MarkerAnimated } from 'react-native-maps';

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
                  <MapView.Marker 
                  key={index} 
                  coordinate={marker.coordinate}
                  title = {marker.title}
                  description = {marker.description}>
                  <MapView.Callout tooltip style={styles.customView}>
                  <TouchableHighlight onPress= {()=>marker.onpress()} underlayColor='#ffffff'>
                   <View style = {styles.container}>
           <TouchableOpacity 
              style={styles3.button} 
              onPress={() => { Alert.alert('You tapped the button!')}}>
             <Text style={styles3.buttonText}>
              Button
             </Text>
           </TouchableOpacity>
        </View>
                  </TouchableHighlight>
                  </MapView.Callout>         
                  </MapView.Marker>
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

const styles2 = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  activeTitle: {
    color: 'red',
  },
});

const styles3 = StyleSheet.create({
  main: {
    backgroundColor: 'blue'
  },
  container: {
   flex : 1,
   alignItems: 'center',
  },
   buttonText: {
       borderWidth: 1,
       padding: 25,      
       borderColor: 'black',
       backgroundColor: '#C4D7ED',
       borderRadius: 15,
       bottom: 0,
       left: 0,
       width: 100,
       height: 100,
       position: 'absolute'
    }
 });
export default usersMap;