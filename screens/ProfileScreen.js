import React from 'react';
import { Image, Button, StyleSheet, Text, View } from 'react-native';
import { SecureStore } from 'expo';

import MenuButton from '../components/MenuButton'

export default class ProfileScreen extends React.Component {

	state = {
		signedIn: false,
        name: "",
        photoUrl: "",
        google_id: "",
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
        console.log(result)
	    	this.setState({
	    		signedIn: true,
	    		name: result.user.name,
	    		photoUrl: result.user.photoUrl,
	    		google_id: result.user.id,
          token: result.accessToken,

	    	})


        var details = {
              'name': this.state.name,
              'google_id': this.state.google_id,
              'photourl': this.state.photoUrl,
              'token': this.state.token,
            };

        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let response = await fetch('http://127.0.0.1:5000/register_user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody,
          });
        let responseJson = await response.json();
        console.log(responseJson);

        console.log("1");
        var details_for_uid = {
              'google_id': this.state.google_id,
            };
        console.log("2");
        var formBody_for_uid = [];
        for (var property_for_uid in details_for_uid) {
          var encodedKey_for_uid = encodeURIComponent(property_for_uid);
          var encodedValue_for_uid = encodeURIComponent(details_for_uid[property_for_uid]);
          formBody_for_uid.push(encodedKey_for_uid + "=" + encodedValue_for_uid);
        }

        console.log("3");
        formBody_for_uid = formBody_for_uid.join("&");
        let response_for_uid = await fetch('http://127.0.0.1:5000/googleid_to_uid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody_for_uid,
          });

        console.log("4");
        let responseJson_for_uid = await response_for_uid.json();
        console.log(responseJson_for_uid);
        console.log(responseJson_for_uid.uid);
        SecureStore.setItemAsync('token', result.accessToken)
        SecureStore.setItemAsync('id', responseJson_for_uid.uid.toString()) //user_id instead of google_id
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