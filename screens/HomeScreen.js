import React from 'react';
import { Button, StyleSheet, Text, View, AsyncStorage } from 'react-native';
import MenuButton from '../components/MenuButton';
import MarkerOverlay from '../components/MarkerOverlay';
import UsersMap from '../components/UsersMap';
import {AppLoading, Font} from 'expo';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props)
		this.setModalVisibility = this.setModalVisibility.bind(this);
		this.setUserLocation = this.setUserLocation.bind(this);
		this.setModalMetaData = this.setModalMetaData.bind(this);
		this.state = {
			userLocation: null,
			markerOverlayIsVisible: false,
			markerOverlayTitle: null,
			markerPosition: null,
			fontLoaded: false,
			signedIn: false,
			uid: 0,
		}
	}

	async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../assets/fonts/Cabin-Bold.ttf')
		});
		this.setState({fontLoaded : true});
		await this.fetch_state();
		console.log('home screen state',this.state.signedIn)
		console.log('home screen uid',this.state.uid)

	}

	/**
	 * sets the user's current location in the HomeScreen's state
	 * @param {userLocation} userLocation (object with latitude, longitude, latitudeDelta, and longitudeDelta)
	 */
	setUserLocation(userLocation) {
		this.setState({
			userLocation: userLocation
		});
	}

	/**
	 * toggles the visibility of modal visible
	 */
	setModalVisibility(isVisible) {
		// this.setState isn't working
		this.setState({
			markerOverlayIsVisible: isVisible
		});
		// but this is working, for some reason
		this.state.markerOverlayIsVisible = isVisible
	}

	/**
	 * Sets the state for all the appropriate marker overlay information
	 * @param {[type]} marker [description]
	 */
	setModalMetaData(marker) {
		console.log("setModalMetaData", marker)
		this.setState({
			markerOverlayTitle: marker.title,
			markerPosition: marker.coordinate
		});
		this.state.markerOverlayTitle = marker.title
		this.state.markerPosition = marker.coordinate
	}

	getUserLocationHandler() {
		navigator.geolocation.getCurrentPosition(position => {
			this.setState({
				userLocation: {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					latitudeDelta: 0.0622,
					longitudeDelta: 0.0421,
				}
			})
		}, err => console.log(err));
	}

	async fetch_state() {
        try {
          const lastStateJSON = await AsyncStorage.getItem('lastState');
		  const lastState = await JSON.parse(lastStateJSON);
          this.setState({
			signedIn: lastState.signedIn,
			uid: lastState.user_id,
		  });
        }
        catch (error) {
          userState = {
            signedIn: false,
          }
        }
      };

	render() {
		if( !this.state.fontLoaded ) {
			return (<AppLoading/>
			);
		}
		return (
			<View style={styles.container}>
				<MenuButton navigation={this.props.navigation} />
				<View style={styles.mapContainer}>
				<MarkerOverlay
					title={this.state.markerOverlayTitle}
					markerPosition={this.state.markerPosition}
					visible={this.state.markerOverlayIsVisible}
					setModalVisibility={this.setModalVisibility}
					userLocation={this.state.userLocation}
					navigation={this.props.navigation}
					signedIn={this.state.signedIn}
					uid={this.state.uid}/>
				<UsersMap
					userLocation={this.state.userLocation}
					setModalVisibility={this.setModalVisibility}
					setUserLocation={this.setUserLocation}
					setModalMetaData={this.setModalMetaData}/>
				</View>
				<View style={styles.container2}>
					{/*<Button title="Get Location"
					onPress={() => this.getUserLocationHandler()} />*/}
					<Button title="Go to Camera"
					onPress={() => this.props.navigation.navigate('Camera')} />
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		zIndex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%'
	},
	container2: {
		flex: 1,
		zIndex: 2,
		top: 40,
		alignItems: 'center',
		justifyContent: 'center',
		position: "absolute",
	},
	text: {
		fontSize: 20,
		zIndex: 20,
		position: "absolute",
		top: 80,
		alignItems: 'center'
	},
	mapContainer: {
		width: '100%',
		height: '100%',
		marginTop: 0,
		zIndex: -1
	}
});
