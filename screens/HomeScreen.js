import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import MenuButton from '../components/MenuButton';
import MarkerOverlay from '../components/MarkerOverlay';
// import FetchLocation from '../components/FetchLocation';
import UsersMap from '../components/UsersMap';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props)
		this.setModalVisible = this.setModalVisible.bind(this);
		this.setUserLocation = this.setUserLocation.bind(this);
		this.state = {
			userLocation: null,
			markerOverlayIsVisible: false
		}
	}

	/**
	 * test to get olin library fake corner
	 * @return {[type]} [description]
	 */
	async getOlinLibrary() {
		try {
			let response = await fetch(
				'http://127.0.0.1:5000/corner_street_names?cid=1'
			);
			let responseJson = await response;
			console.log(responseJson);
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
	setModalVisible() {
		this.setState({
			markerOverlayIsVisible: !this.state.markerOverlayIsVisible
		});
	}

	getUserLocationHandler = () => {
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
		return (
			<View style={styles.container}>
				<MenuButton navigation={this.props.navigation} />
				<View style={styles.mapContainer}>
				<MarkerOverlay title="College Ave & Bool St" visible={this.state.markerOverlayIsVisible}/>
				<UsersMap userLocation={this.state.userLocation} setModalVisible={this.setModalVisible} setUserLocation={this.setUserLocation}/>
				</View>
				<View style={styles.container2}>
					<Button title="Get Location"
					onPress={() => this.getOlinLibrary()} />
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
				height: 800,
				marginTop: 0,
				zIndex: -1
		}
});