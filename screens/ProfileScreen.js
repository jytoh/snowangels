import React from 'react';
import { Image, Button, StyleSheet, Text, View, ImageBackground } from 'react-native';
import { SecureStore } from 'expo';
import {AsyncStorage} from 'react-native';


import MenuButton from '../components/MenuButton'

export default class ProfileScreen extends React.Component {
	state = {
        signedIn: false,
        name: "",
        photoUrl: "",
        token: "",
        loaded: false,
        num_requests: 0,
        num_shovels: 0,
    };

  async componentDidMount() {
    await this.fetch_state();
  };
  
  async signInWithGoogleAsync() {
    console.log('pressed');
      try {
        const result = await Expo.Google.logInAsync({
          androidClientId: '144414055124-h8ahrjbhjf2j9icso7qkb7i1s3ceie7k.apps.googleusercontent.com',
          iosClientId: '144414055124-7l2s1hcmt21i37g09s31i62o3nstqn1l.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });

        if (result.type === 'success') {
          //console.log(result)
          this.setState({
            signedIn: true,
            name: result.user.name,
            photoUrl: result.user.photoUrl,
            google_id: result.user.id,
            token: result.accessToken,
          })
          await this.store_state(this.state);
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
          //console.log(responseJson);

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

          var details_for_requests = {
                'uid': 1, //hardcoded for now
              };

          var formBody_for_requests = [];
          for (var property in details_for_requests) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details_for_requests[property]);
            formBody_for_requests.push(encodedKey + "=" + encodedValue);
          }
          formBody_for_requests = formBody_for_requests.join("&");
          let response_for_requests = await fetch('http://127.0.0.1:5000/num_requests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody_for_requests,
            });
          let responseJson_for_requests = await response_for_requests.json();

          var details_for_shovels = {
                'uid': 1, //hardcoded for now
              };

          var formBody_for_shovels = [];
          for (var property in details_for_shovels) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details_for_shovels[property]);
            formBody_for_shovels.push(encodedKey + "=" + encodedValue);
          }
          formBody_for_shovels = formBody_for_shovels.join("&");
          let response_for_shovels = await fetch('http://127.0.0.1:5000/num_shovels', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody_for_shovels,
            });
          let responseJson_for_shovels = await response_for_shovels.json();
          this.setState({
            num_requests: responseJson_for_requests.num_requests,
            num_shovels: responseJson_for_shovels.num_shovels,
          })

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
  };
  
  async store_state(state) {
    const json_state = JSON.stringify(state);
    console.log('called store state')
    console.log(json_state)
    try {
      await AsyncStorage.setItem('lastState', json_state)
      console.log('state stored')
    }
    catch (error){
      console.log('State could not be stored.')
    }
  };

  async fetch_state() {
    try {
      console.log('got here');
      const lastStateJSON = await AsyncStorage.getItem('lastState');
      console.log(lastStateJSON)
      const lastState = JSON.parse(lastStateJSON);
      this.setState({
        signedIn: lastState.signedIn,
        name: lastState.name,
        photoUrl: lastState.photoUrl,
        google_id: lastState.google_id,
        token: lastState.token,
        loaded: true,
      });
      console.log('Got last state');
    }
    catch (error) {
      console.log('No last state to fetch');
      this.setState({
        signedIn: false,
        name: '',
        photoUrl: '',
        google_id: '',
        token: '',
        loaded: true,
      })
    }
  };

  async logout() {
    this.setState({
      signedIn: false,
      name: "",
      photoUrl: "",
      token: "",
      loaded: true,
    });
    await this.store_state(this.state);
  };

  render() {
    if (this.state.loaded = true){
      console.log('loaded');
      return (
        <View style={styles.container}>
          {this.state.signedIn ? (
            <LoggedInPage name={this.state.name} photoUrl={this.state.photoUrl} num_requests={this.state.num_requests} num_shovels={this.state.num_shovels} logout={this.logout.bind(this)} />
          ) : (
            <LoginPage signInWithGoogleAsync={this.signInWithGoogleAsync.bind(this)} />
          )}
          <MenuButton navigation={this.props.navigation} />
        </View>
      );
    }
    else {
      return (null)
    }
  }
};

const LoginPage = props => {
  return (
    <View>
      <Button title="Sign in with Google" onPress={() => props.signInWithGoogleAsync()} />
    </View>
  )
}

const LoggedInPage = props => {
  return (
    <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} >
    <View style={styles.container}>
      <View style={styles.containertop}>
        <Image style={styles.image} source={{ uri: props.photoUrl }} />
        <Text style={styles.name}>{props.name}</Text>
      </View>
      <View style={styles.containerbottom}>
        <Text style={styles.header}> {"Summary"}</Text>
        <Text style= {styles.text}> {"Total Shovels:" + props.num_requests}</Text>
        <Text style= {styles.text}> {"Total Reports:" + props.num_shovels}</Text>
        <Text style={styles.text}> {"Rank: 3/120"}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Give Feedback" size='30' onPress={() => null}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Logout" size='30' color="#FF0000" onPress={() => props.logout()}/>
      </View>
    </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  img: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24
  },
  containertop:{
    flex: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  name: {
    fontSize: 40,
  },
  text: {
    fontSize: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  image: {
  	width: 100, 
    height: 100,
    marginBottom: 20,
    borderRadius: 40,
  },
  containerbottom:{
    flex: 16,
    width:'100%',
    textAlign: 'left',
    borderRadius: 4,
    borderWidth: 0.5,
    paddingLeft: '5%'
  },
  buttonContainer:{
    borderRadius: 4,
    borderWidth: 0.5,
    flex: 2,
    width: '100%',
    justifyContent: 'center'
  }
});
