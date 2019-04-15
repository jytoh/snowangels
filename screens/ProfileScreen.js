import React from 'react';
import { Image, Button, StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { SecureStore } from 'expo';
import {AsyncStorage} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
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
  
  async refresh() {
    let response_request = await fetch(
      'http://127.0.0.1:5000/num_requests?uid=1'
    );
    let response_shovel = await fetch(
      'http://127.0.0.1:5000/num_shovels?uid=1'
    );
    let response1Json = await response_request.json();
    let response2Json = await response_shovel.json();
    this.setState({
      num_requests: response1Json.num_requests,
      num_shovels: response2Json.num_shovels
    });
    await this.store_state(this.state);
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
          this.setState({
            signedIn: true,
            name: result.user.name,
            photoUrl: result.user.photoUrl,
            google_id: result.user.id,
            token: result.accessToken,
            loaded: true,
          })
          await this.refresh();
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
          console.log('82')
          var details_for_uid = {
                'google_id': this.state.google_id,
              };
          var formBody_for_uid = [];
          for (var property_for_uid in details_for_uid) {
            var encodedKey_for_uid = encodeURIComponent(property_for_uid);
            var encodedValue_for_uid = encodeURIComponent(details_for_uid[property_for_uid]);
            formBody_for_uid.push(encodedKey_for_uid + "=" + encodedValue_for_uid);
          }
          formBody_for_uid = formBody_for_uid.join("&");
          let response_for_uid = await fetch('http://127.0.0.1:5000/googleid_to_uid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody_for_uid,
          });
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
          console.log(responseJson_for_requests);

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
          console.log("1");
          console.log(responseJson_for_requests)
          console.log(responseJson_for_requests.num_requests);
          console.log("1");
          this.setState({
            num_requests: responseJson_for_requests.num_requests,
            num_shovels: responseJson_for_shovels.num_shovels,
          })
          await this.store_state(this.state);
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
    console.log(json_state)
    try {
      await AsyncStorage.setItem('lastState', json_state)
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
        num_requests: lastState.num_requests,
        num_shovels: lastState.num_shovels
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
        num_requests: 0,
        num_shovels: 0
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
      num_requests: 0,
      num_shovels: 0
    });
    await this.store_state(this.state);
  };

  render() {
    if (this.state.loaded = true){
      return (
        <View style={styles.container}>
          {this.state.signedIn ? (
            <LoggedInPage name={this.state.name} photoUrl={this.state.photoUrl} 
            num_requests={this.state.num_requests} num_shovels={this.state.num_shovels} 
            logout={this.logout.bind(this)} refresh={this.refresh.bind(this)} />
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
    <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} > 
    <View style={styles.container}>
      <View style ={styles.imgView}>
        <Image style = {styles.loginpic} source={require('../assets/snowflake.jpg')}/>
      </View>
      <View style={styles.loginButton}>
        <TouchableOpacity
          onPress={props.signInWithGoogleAsync}>
          <Text 
            style={styles.signintext}>
            {' '}Sign In With Google{' '}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </ImageBackground>
  )
}

const LoggedInPage = props => {
  return (
    <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} > 
    <View style={styles.container}>
      <Ionicons name = "md-refresh" color = "#000000" size = {32} style = {styles.refreshicon}
            onPress={() => props.refresh()}/>
      <View style={styles.containertop}>
        <Image style={styles.image} source={{ uri: props.photoUrl }} />
        <Text style={styles.name}>{props.name}</Text>
      </View>
      <View style={styles.containerbottom}>
        <Text style={styles.header}> {"Summary"}</Text>
        <Text style= {styles.text}> {"Total Shovels:" + props.num_shovels}</Text>
        <Text style= {styles.text}> {"Total Reports:" + props.num_requests}</Text>
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
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    height: '100%'
  },
  containertop:{
    flex: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  name: {
    fontSize: 40,
    fontFamily: 'Cabin-Bold'
  },
  text: {
    fontSize: 20,
    paddingTop: 20,
    fontFamily: 'Cabin-Regular'
  },
  header: {
    paddingTop: 20,
    fontSize: 30,
    fontFamily: 'Cabin-Bold'
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
    justifyContent: 'center',
    fontFamily: 'Cabin-Regular'
  },
  refreshicon: {
    zIndex: 9,
    position: "absolute",
    top: 40,
    right: 20,
  },
  loginButton: {
    borderRadius: 28,
    borderWidth: 0.5,
    width: "90%", 
    margin: 10, 
    backgroundColor: "#76A1EF"
  },
  loginpic: {
    height: 120,
    width: 120,
    borderRadius: 40,
    marginBottom: 40,
    backgroundColor: '#D1E1F8',
  },
  signintext: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    paddingTop: 24,
    fontFamily: 'Cabin-Regular'
  }
});

