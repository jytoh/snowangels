import React from 'react';
import { View, StyleSheet, Button, Modal, Text } from 'react-native';
import MapView from 'react-native-maps';
import MarkerOverlay from '../components/MarkerOverlay';
//var RNFS = require('react-native-fs');

export default class UsersMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userLocation: props.userLocation,

      // Function that toggles the visibility of the modal
      // see: HomeScreen.js
      setModalVisibility: props.setModalVisibility,

      // Function that sets the userLocation
      // see: Homescreen.js
      setUserLocation: props.setUserLocation,

      // Function that sets the modal meta data
      // see: HomeScreen.js
      setModalMetaData: props.setModalMetaData,

      region: props.userLocation,
      markers: [],

      // The marker for the user's location
      userLocationMarker: null
    }
    this.getAllCorners()
    this.getUserLocationHandler()

    // below: FOR LATER JUST IN CASE
/*    if (this.state.userLocation) {
      this.userLocationMarker = <MapView.Marker coordinate={ userLocation } pinColor="blue" title="My Location"/>
      this.setState({region: this.state.userLocation})
    }*/
  }

  comopnentDidMount() {
    this.getAllCorners()
    this.getUserLocationHandler()
  }

  /**
   * Fetches the json for the corners in the database
   * The database returns an array with elements of the format {id, lat, lon, street1, street2}
   * Saves an array with elements of the format {key, coordinate, title, description}
   * with help of formatGetAllCorners() to state.markers
   */
  async getAllCorners() {
    var corner_data = await fetch('https://snowangels-api.herokuapp.com/get_all_corners')
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson
    })
    .catch((error) => {
      console.error(error);
    })

    this.setState({
      markers: corner_data
    })
  }

  /**
   * changes the region for this components state and the state of HomeScreen
   * @param  {region} region (object with latitude, longitude, latitudeDelta, and longitudeDelta)
   */
  onRegionChange(region) {
    this.setState({
      region: region
    })
  }

  markerOnPress(marker) {
    this.state.setModalMetaData(marker)
    this.state.setModalVisibility(true)
  }

  getUserLocationHandler() {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        userLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0421
        }
      })
      this.setState({
        userLocationMarker: <MapView.Marker
        coordinate= {
          {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0421
        }
        }
        pinColor="black"
        title="My Location"
      />
      })
    }), err => console.error(err);
  }

  displayMarkers() {
    if (this.state.markers.length == 0) {
      return <Text> </Text>
    } else {
      return marker_list = this.state.markers.map((marker, index) => {
        return (
          <MapView.Marker
            key={index}
            coordinate={{
              "latitude": marker.coordinate.latitude,
              "longitude": marker.coordinate.longtitude
            }}
            onPress = {() => {this.markerOnPress(marker)}
            }
          />
        );
      })
    }
  }

  render() {
    return (
      <View style={styles.mapContainer}>
        <MapView
          initialRegion={{
            latitude: 42.4451,
            longitude: -76.4837,
            latitudeDelta: 0.0622,
            longitudeDelta: 0.0421
          }}
          region={this.state.region}
          onRegionChange={() => this.onRegionChange()}
          style={styles.map}
        >
          {this.displayMarkers()}
          {this.state.userLocationMarker}
        </MapView>
        {/*<View style={styles.getCornersContainer}>
          <Button
            title="Get Corners"
            onPress={() => this.getAllCorners()}
          />
        </View>*/}
      </View>
    );
  }
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
  },
  getCornersContainer: {
    zIndex: 100,
    position: "absolute",
    bottom: 40,
    alignItems: "center",
    justifyContent: 'center',
    flex: 1,
    marginLeft: '29%'
  }
});