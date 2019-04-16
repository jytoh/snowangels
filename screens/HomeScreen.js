import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
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
			title: null,
			fontLoaded: false
		}
	}

	async componentDidMount() {
		await Font.loadAsync({
		  'Cabin-Regular': require('../assets/fonts/Cabin-Regular.ttf'),
		  'Cabin-Bold': require('../assets/fonts/Cabin-Bold.ttf')
		});
		console.log('font loaded home!');
		this.setState({fontLoaded : true});
	}

	/**
	 * test to get olin library fake corner
	 * @return {[type]} [description]
	 */
	async getOlinLibrary() {
		try {

	        var details = {
					    'lat': 1,
					    'long': 2,
					    'street1': 'c',
					    'street2': 'd',
					  };

			var formBody = [];
			for (var property in details) {
				var encodedKey = encodeURIComponent(property);
				var encodedValue = encodeURIComponent(details[property]);
				formBody.push(encodedKey + "=" + encodedValue);
			}
			formBody = formBody.join("&");
			let response2 = await fetch('https://snowangels-api.herokuapp.com/create_corner', {
				  method: 'POST',
				  headers: {
				    'Content-Type': 'application/x-www-form-urlencoded',
				  },
				  body: formBody,
				});
			let responseJson2 = await response2.json();

			console.log(responseJson2);
			console.log(responseJson2.street1);
			console.log(responseJson2.street2);

// moved this down so get follows a post to avoid nonetype error
			let response = await fetch(
				'https://snowangels-api.herokuapp.com/corner_street_names?cid=1'
			);
			let responseJson = await response.json();
			console.log(responseJson.street1);
			console.log(responseJson.street2);
		} catch (error) {
			console.error(error);
		}

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
		this.setState({
			markerOverlayIsVisible: isVisible
		});
	}

	setModalMetaData(marker) {
		this.setState({
			title: marker.title
		});
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

	render() {
		if( !this.state.fontLoaded ) {
			return (<AppLoading/>
			);
		}
		return (
			<View style={styles.container}>
				<MenuButton navigation={this.props.navigation} />
				<View style={styles.mapContainer}>
				<MarkerOverlay title={this.state.title} visible={this.state.markerOverlayIsVisible} setModalVisibility={this.setModalVisibility}/>
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
