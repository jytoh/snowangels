import React from 'react';
import { View, StyleSheet, Button, Modal, Text, AsyncStorage } from 'react-native';
import MapView from 'react-native-maps';
import { AppLoading } from 'expo';
import MarkerOverlay from '../components/MarkerOverlay';
import LocationMarkerPicture from '../assets/LocationMarkerPicture.png'
import { withNavigation } from "react-navigation";
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
      corner_states: [],
      joined_list: [],

      // The marker for the user's location
      userLocationMarker: null,

      // circle around user location marker
      userLocationCircle: null,

      loading: false
    }
    // this.getAllCorners()
    // this.getAllStates()
    // this.getUserLocationHandler()

    // below: FOR LATER JUST IN CASE
/*    if (this.state.userLocation) {
      this.userLocationMarker = <MapView.Marker coordinate={ userLocation } pinColor="blue" title="My Location"/>
      this.setState({region: this.state.userLocation})
    }*/
  }

  async componentDidMount() {
    await this.getAllCorners()
    await this.getAllStates()
    this.getUserLocationHandler()
    await this.innerJoin(this.state.markers, this.state.corner_states)
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      console.log('focused users map!')
      this.refreshScreen()
		});
  }

  async refreshScreen(){
    await this.setState({loading: true})
    console.log('refreshing users map screen')
    await this.getAllCorners()
    await this.getAllStates()
    this.getUserLocationHandler()
    await this.innerJoin(this.state.markers, this.state.corner_states)
    this.displayMarkers()
    await this.setState({loading: false})
    console.log('refreshed users map screen')

  }

  getFakeCornerDataIfNoCornersAreRetrieved() {
    return [
        {
          'coordinate': {
            'latitude': 42.4476,
            'longtitude': -76.4827
          },
          'title': "East Ave & Tower Rd",
          'description': "Single Corner"
        },
        {
          'coordinate': {
            'latitude': 42.4475,
            'longtitude': -76.4843
          },
          'title': 'Ho Plz & Cornell University St',
          'description': 'Single Corner'
        }
    ]
  }

  /**
   * Fetches the json for the corners in the database
   * The database returns an array with elements of the format {id, lat, lon, street1, street2}
   * Saves an array with elements of the format {key, coordinate, title, description}
   * with help of formatGetAllCorners() to state.markers
   */
  async getAllCorners() {
    AsyncStorage.setItem('pulledFromMarkersOnce', "true")
    if (await AsyncStorage.getItem('pulledFromMarkersOnce') == "true") {
      var corner_data = await fetch('https://snowangels-api.herokuapp.com/get_all_corners')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson
      })
      .catch((error) => {
        console.error(error);
      })

      // make fake data if the databse is down
      if (corner_data == []) {
        corner_data = getFakeCornerDataIfNoCornersAreRetrieved();
      }

      await this.setState({
        markers: corner_data
      })

      //console.log(this.state.markers)
    }
  }

  async getAllStates() {
    AsyncStorage.setItem('pulledFromMarkersOnce', "true")
    if (await AsyncStorage.getItem('pulledFromMarkersOnce') == "true") {
      var corner_states = await fetch('https://snowangels-api.herokuapp.com/states')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson
      })
      .catch((error) => {
        console.error(error);
      })
      await this.setState({
        corner_states: corner_states
      })
    }
  }

  async innerJoin(x,y) {
    joined_list = [];
    x.map((marker,idx) => {
      y.map((m2,idx2) => {
        if (marker.key == m2.cid) {
          joined_list.push({...marker, ...m2})
        }
      })
    })
    this.setState({
      joined_list: joined_list
    });
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
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221
        }
      })
      this.setState({
        userLocationMarker: <MapView.Marker
        coordinate= {
          {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221
        }
        }
        image={LocationMarkerPicture}
        title="My Location"
      />
      })
      this.setState({
        userLocationCircle: <MapView.Circle
          center={
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }
          radius={400}
          strokeColor={'rgba(203, 217, 238, 0.7)'}
          fillColor={'rgba(203, 217, 238, 0.4)'}
        />
      })
    }), err => console.error(err);
  }

  /**
   * Checks to see if the marker is shoveled or not
   * @param  marker
   * @return [integer] {the marker's state}
   */
  async getMarkerState(marker) {
    var corner_state = await fetch('https://snowangels-api.herokuapp.com/state?cid=' + marker.key)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson
    })
    .catch((error) => {
      console.error(error);
    })
    return corner_state
  }

  displayMarkers() {
    if (this.state.markers){
      if (this.state.markers.length == 0) {
        return null
      } else {
        return marker_list = this.state.joined_list.map((marker, index) => {
          // this.getMarkerState(marker)
          return (
            <MapView.Marker
              key={index}
              coordinate={{
                // TODO: have to change longtitude to longitude in backend
                "latitude": marker.coordinate.latitude,
                "longitude": marker.coordinate.longtitude
              }}
              onPress = {() => {this.markerOnPress(marker)}
              }
              pinColor = {(marker.state == 1) ? 'red' : 'black'}
            />
          );
        })
      }
    }
  }

  render() {
    if (this.state.loading == true){
      console.log('loading users map!!')
      return (
        <AppLoading />
      )
    }
    else {
      return (
        <View style={styles.mapContainer}>
          <MapView
            initialRegion={{
              latitude: 42.4451,
              longitude: -76.4837,
              latitudeDelta: 0.0081,
              longitudeDelta: 0.0081
            }}
            region={this.state.region}
            onRegionChange={() => this.onRegionChange()}
            style={styles.map}
          >
            {this.displayMarkers()}
            {this.state.userLocationMarker}
            {this.state.userLocationCircle}
          </MapView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
    mapContainer: {
    width: '100%',
    height: '100%',
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