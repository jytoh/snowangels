import React from 'react';
import { Image, Button, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { SecureStore } from 'expo';
import {AsyncStorage} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import MenuButton from '../components/MenuButton'
import { MailComposer } from 'expo';

export default class ProfileScreen extends React.Component {
  state = {
        signedIn: false,
        uid: 0,
        name: "",
        photoUrl: "",
        token: "",
        loaded: false,
        num_requests: 0,
        num_shovels: 0,
        points: 0,
    };
  async componentDidMount() {
    await this.fetch_state();
  };
  
  async refresh() {
    //var user_id = await SecureStore.getItemAsync('id')//user_id instead of google_id
    //console.log(user_id)
    let response_request = await fetch(
      'https://snowangels-api.herokuapp.com/num_requests?uid=' + this.state.uid
    );
    let response_shovel = await fetch(
      'https://snowangels-api.herokuapp.com/num_shovels?uid=' + this.state.uid
    );
    let response_points = await fetch(
      'https://snowangels-api.herokuapp.com/num_points?uid=' + this.state.uid
    );
    let response1Json = await response_request.json();
    let response2Json = await response_shovel.json();
    let response3Json = await response_points.json();

    this.setState({
      num_requests: response1Json.num_requests,
      num_shovels: response2Json.num_shovels,
      points: response3Json.points,


    });
    await this.store_state(this.state);
  };

  async give_feedback(){
    MailComposer.composeAsync({
      recipients: ['mi243@cornell.edu'], 
      subject: "SnowAngels User Report", 
      body: "Please tell us your concern"
    })
  }

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
            google_id: result.user.id,
            token: result.accessToken,
            loaded: true,
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
          let response = await fetch('https://snowangels-api.herokuapp.com/register_user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody,
          });
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
          let response_for_uid = await fetch('https://snowangels-api.herokuapp.com/googleid_to_uid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody_for_uid,
          });
          let responseJson_for_uid = await response_for_uid.json();
          console.log(responseJson_for_uid);
          console.log(responseJson_for_uid.uid);


          let response_request = await fetch(
            'https://snowangels-api.herokuapp.com/num_requests?uid=' + responseJson_for_uid.uid.toString()
          );
          let response_shovel = await fetch(
            'https://snowangels-api.herokuapp.com/num_shovels?uid=' + responseJson_for_uid.uid.toString()
          );
          let response_points = await fetch(
            'https://snowangels-api.herokuapp.com/num_points?uid=' + responseJson_for_uid.uid.toString()
          );
          let response1Json = await response_request.json();
          let response2Json = await response_shovel.json();
          let response3Json = await response_points.json();

          this.setState({
            num_requests: response1Json.num_requests,
            num_shovels: response2Json.num_shovels,
            points: response3Json.points
          });

          await SecureStore.setItemAsync('token', result.accessToken)
          await this.setState({uid: responseJson_for_uid.uid.toString()});
          await this.store_state(this.state);
          this.refresh();
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
      console.log('state successfully stored, state is now', JSON.parse(json_state).signedIn)
      console.log('user ID successfully store, it is now ',JSON.parse(json_state).uid)
    }
    catch (error){
      console.log('State could not be stored.')
    }
  };

  async fetch_state() {
    try {
      const lastStateJSON = await AsyncStorage.getItem('lastState');
      console.log(lastStateJSON)
      const lastState = JSON.parse(lastStateJSON);
      this.setState({
        uid: lastState.uid,
        signedIn: lastState.signedIn,
        name: lastState.name,
        photoUrl: lastState.photoUrl,
        google_id: lastState.google_id,
        token: lastState.token,
        loaded: true,
        num_requests: lastState.num_requests,
        num_shovels: lastState.num_shovels,
        points: lastState.points
      });
      console.log('Got last state');
    }
    catch (error) {
      console.log('No last state to fetch');
      this.setState({
        signedIn: false,
        uid : 0,
        name: '',
        photoUrl: '',
        google_id: '',
        token: '',
        loaded: true,
        num_requests: 0,
        num_shovels: 0,
        points:0,
      })
    }
  };

  async logout() {
    await this.setState({
      signedIn: false,
      uid: 0,
      name: "",
      photoUrl: "",
      token: "",
      loaded: true,
      google_id: null,
      num_requests: 0,
      num_shovels: 0,
      points:0
    });
    await this.store_state(this.state);
    console.log(this.state)
    console.log('successfully logged out')
  };

  render() {
    if (this.state.loaded = true){
      return (
        <View style={styles.container}>
          {this.state.signedIn ? (
            <LoggedInPage name={this.state.name} photoUrl={this.state.photoUrl} 
            num_requests={this.state.num_requests} num_shovels={this.state.num_shovels} points = {this.state.points} 
            logout={this.logout.bind(this)} refresh={this.refresh.bind(this)} give_feedback= {this.give_feedback.bind(this)}
            navigation = {this.props.navigation} />
          ) : (
            <LoginPage signInWithGoogleAsync={this.signInWithGoogleAsync.bind(this)} />
          )}
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
      {/* <View style ={styles.imgView}>
        <Image style = {styles.loginpic} source={require('../assets/snowflake.jpg')}/>
      </View> */}
      <Image style={styles.logo} source={require('../assets/logo.png')} />
      <Ionicons
        name = "md-snow"
        color = "white"
        size = {100}
        style = {styles.loginPic}
      />
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
        <Text style= {styles.text}> {"Total Points: " + props.points}</Text>
        <Text style= {styles.text}> {"Total Shovels: " + props.num_shovels}</Text>
        <Text style= {styles.text}> {"Total Reports: " + props.num_requests}</Text>
        {/*<Text style={styles.text}> {"Rank: 3/120"}</Text>*/}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Send Report or Feedback" size='30' onPress={() => props.give_feedback()}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Logout" size='30' color="#FF0000" onPress={() => props.logout()}/>
      </View>
    </View>
    <MenuButton navigation={props.navigation} />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  img: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    marginTop: 0,
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
    justifyContent: 'center'
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
    backgroundColor: "#76A1EF",
    position: 'absolute',
    bottom: Dimensions.get('window').height*0.3
  },
  loginpic: {
    height: 120,
    width: 120,
    borderRadius: 40,
    marginBottom: 60,
    backgroundColor: '#D1E1F8',
  },
  signintext: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: 'Cabin-Bold',
    paddingTop: 24
  },
  logo: {
    position: 'absolute',
    top: Dimensions.get('window').height*0.2,
    height: "14%"
  }
});

