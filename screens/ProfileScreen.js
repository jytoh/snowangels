import React from 'react';
import { Image, Button, StyleSheet, Text, View } from 'react-native';
import { SecureStore } from 'expo';

import MenuButton from '../components/MenuButton'

export default class ProfileScreen extends React.Component {

	state = {
		signedIn: false,
        name: "",
        photoUrl: "",
        id: "",
        token: ""
    };

   async signInWithGoogleAsync() {
	  try {
	    const result = await Expo.Google.logInAsync({
	      androidClientId: '144414055124-h8ahrjbhjf2j9icso7qkb7i1s3ceie7k.apps.googleusercontent.com',
	      iosClientId: '144414055124-7l2s1hcmt21i37g09s31i62o3nstqn1l.apps.googleusercontent.com',
	      scopes: ['profile', 'email'],
	    });

	    if (result.type === 'success') {
	    	this.setState({
	    		signedIn: true,
	    		name: result.user.name,
	    		photoUrl: result.user.photoUrl,
	    		id: result.user.id

	    	})
	    	SecureStore.setItemAsync('token', result.accessToken)
	    	SecureStore.setItemAsync('id', result.user.id)
	    	console.log(this.state.name);
	    	console.log(this.state.photoUrl);
	      return result.accessToken;
	    } else {
	      return {cancelled: true};
	    }
	  } catch(e) {
	    return {error: true};
	  }
	}

  render() {
    return (
      <View style={styles.container}>
      	{this.state.signedIn ? (
          <LoggedInPage name={this.state.name} photoUrl={this.state.photoUrl} />
        ) : (
          <LoginPage signInWithGoogleAsync={this.signInWithGoogleAsync()} />
        )}
        <MenuButton navigation={this.props.navigation} />

      </View>
    );
  }
}

const LoginPage = props => {
  return (
    <View>
      <Button title="Sign in with Google" onPress={() => props.signInWithGoogleAsync} />
    </View>
  )
}

const LoggedInPage = props => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{props.name}</Text>
      <Image style={styles.image} source={{ uri: props.photoUrl }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
  },
  image: {
  	width: 100, 
  	height: 100
  }
});