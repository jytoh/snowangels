import React from 'react';
import { View, StyleSheet, Button, Modal, Text, AsyncStorage } from 'react-native';
import MapView from 'react-native-maps';
import { AppLoading } from 'expo';
import LocationMarkerPicture from '../assets/LocationMarkerPicture.png'


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

      loading: false,
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

  /**
   * Invoked immedately after UsersMap is mounted
   * 
   * Sets up the map by pulling all corners and adding 
   * the focusListener, which refreshes the screen every time
   * the screen is loaded
   */
  async componentDidMount() {
    await this.getAllCorners()
    await this.getAllStates()
    this.getUserLocationHandler()
    await this.innerJoin(this.state.markers, this.state.corner_states)
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.refreshScreen()
		});
  }

  /**
   * Reloads all markers on the screen 
   * 
   * This function is called in componentDidMount every time the screen comes 
   * into focus. It pulls data from the server and reloads all markers onto
   * the map, which updates any changes to state. 
   */
  async refreshScreen() {
    await this.setState({loading: true})
    await this.getAllCorners()
    await this.getAllStates()
    this.getUserLocationHandler()
    await this.innerJoin(this.state.markers, this.state.corner_states)
    this.displayMarkers()
    await this.setState({loading: false})
    this.state.setModalVisibility(false)
  }

  /**
   * @deprecated 
   */
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
   * 
   * The database returns an array with elements of the format {id, lat, lon, street1, street2}
   * Saves an array with elements of the format {key, coordinate, title, description}
   * to state.markers
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
    }
  }

  /**
   * Fetches the json for the corners and their respective states in the database
   * 
   * The database returns an array with elements of the format {cid, state}
   * Saves an array with elements of the format {key, state} to state.markers
   */
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

  /**
   * Inner join arrays of corners and states
   * 
   * Stores the results, a list of corners with their
   * respective states added, to state.joined_list
   * @param {JSON[]} corners
   * @param {JSON[]} states
   */
  async innerJoin(corners,states) {
    joined_list = [];
    corners.map((marker) => {
      states.map((m2) => {
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
   * Changes the region for this components state and the state of HomeScreen
   * @param  {region} region (object with latitude, longitude, latitudeDelta, and longitudeDelta)
   */
  onRegionChange(region) {
    this.setState({
      region: region
    })
  }

  /**
   * Opens the pop-up for that particular marker
   * @param  {marker} marker
   */
  markerOnPress(marker) {
    this.state.setModalMetaData(marker)
    this.state.setModalVisibility(true)
  }

  /**
   * Initializes the user's current location and sets the blue radius circle
   * The sensitivity radius is hard-coded in this function, under radius={}
   */
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

  /**
   * Renders all markers onto the map 
   * 
   * Displays all markers at their GPS coordinates. 
   * Marker colors are as follows:
   * Black: Default. Either no request exists or it has been shoveled
   * Red: Pending request
   */
  displayMarkers() {
    if (this.state.markers){
      if (this.state.markers.length == 0) {
        return <Text> </Text>
      } else {
        return marker_list = this.state.joined_list.map((marker, index) => {
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
              pinColor = {(marker.state == 1) ? 'red' : ((marker.state == 2) ? 'gold' : 'black')}
            />
          );
        })
      }
    }
  }

  /*
  * Renders the page. Returns a loading screen if not all components
  * are completely loaded or mounted. Otherwise, renders the map centered
  * on Ithaca and displays the markers, current user location, and radius graphic
  */
  render() {
    if (this.state.loading == true){
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