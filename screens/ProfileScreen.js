import React from 'react';
import { Image, Button, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { SecureStore } from 'expo';
import {AsyncStorage} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import MenuButton from '../components/MenuButton'
import { MailComposer } from 'expo';
import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'

const HEIGHT = Dimensions.get('window').height;

const WIDTH = Dimensions.get('window').width;
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
  
  /**
  * Refreshes profile screen to update the number of requests, shovels, and points
  */
  async refresh() {
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

    //Update state with result of fetch calls
    this.setState({
      num_requests: response1Json.num_requests,
      num_shovels: response2Json.num_shovels,
      points: response3Json.points,
    });
    await this.store_state(this.state);
  };

  /**
  * Uses the Expo MailComposer to send email to app administrator
  */
  async give_feedback(){
    MailComposer.composeAsync({
      recipients: ['mi243@cornell.edu'], 
      subject: "SnowAngels User Report", 
      body: "Please tell us your concern"
    })
  }

  /**
  * Signs user in. Adds a new user entry in the database if this is the user's first time logging in 
  * @return {String} access token received from result of Fetch call
  */
  async signInWithGoogleAsync() {
      try {
        //Use Expo function to log in user on app
        const result = await Expo.Google.logInAsync({
          androidClientId: '144414055124-h8ahrjbhjf2j9icso7qkb7i1s3ceie7k.apps.googleusercontent.com',
          iosClientId: '144414055124-7l2s1hcmt21i37g09s31i62o3nstqn1l.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });

        //If user is logged in successfully, update the state to reflect this
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

          //Fetch call to register new user 
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

          //Fetch call to get user id from google id which user has when they log in 
          formBody_for_uid = formBody_for_uid.join("&");
          let response_for_uid = await fetch('https://snowangels-api.herokuapp.com/googleid_to_uid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formBody_for_uid,
          });
          let responseJson_for_uid = await response_for_uid.json();

          //Fetch calls to get the number of requests, shovels, and points, which all appear on the profile screen
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
          return result.accessToken;
        } else {
          return {cancelled: true};
        }
      } catch(e) {
        return {error: true};
      }
  };
  
  /**
  * Update state of the component
  * @param  {Number} state state of component
  */
  async store_state(state) {
    const json_state = JSON.stringify(state);
    try {
      await AsyncStorage.setItem('lastState', json_state)
    }
    catch (error){
      console.log('State could not be stored.')
    }
  };

  /**
  * Fetch current state of component
  */
  async fetch_state() {
    try {
      const lastStateJSON = await AsyncStorage.getItem('lastState');
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

  /**
  * Log user out of account 
  */
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
  };

  /**
  * Display name and header of user in their profile header
  * @param  {String} name User's name 
  * @param  {String} uri URI of user's photo icon on Google
  * @returns {Object} view of header
  */
  renderHeader(name, uri) {
    return (
        <View colors={[, '#6D9AED', '#6D9AED']}
              style={styles.header}>
          <View style={styles.containertop}>
            <Image style={styles.image} source={{ uri: uri }} />
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>
    )
  };

  render() {
    if (this.state.loaded == true) {
      if (this.state.signedIn == true) {
        return (
        <View style={styles.container}>
            {this.renderHeader(this.state.name, this.state.photoUrl)}
            <LoggedInPage name={this.state.name} photoUrl={this.state.photoUrl} 
            num_requests={this.state.num_requests} num_shovels={this.state.num_shovels} points = {this.state.points} 
            logout={this.logout.bind(this)} refresh={this.refresh.bind(this)} give_feedback= {this.give_feedback.bind(this)}
            navigation = {this.props.navigation} />
            <MenuButton navigation={this.props.navigation} />
            <Ionicons name = "md-refresh" color = "#000000" size = {32} style = {styles.refreshicon}
            onPress={() => this.refresh()}/>
        </View>
        )
      }
      else {
        return (
        <View style={styles.container}>
            <LoginPage signInWithGoogleAsync={this.signInWithGoogleAsync.bind(this)} />
        </View>
        )
      }
    }
    else {
      return (null)
    }
  }
};

const LoginPage = props => {
  return (
    <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} > 
    <View style={styles.container3}>
      <Image style={styles.logo} source={require('../assets/logo.png')} />
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
    <View style={styles.container2}>
      <View style={styles.containerbottom}>
        <Text style={styles.textHeader}> {"Summary"}</Text>
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
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    width: '100%'
  },
  container2: {
    //flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //paddingTop: 20,
    height: '72%',
    width: '100%'
  },
  container3: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%'
  },
  containertop:{
    //flex: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  name: {
    fontSize: scale(40),
    fontFamily: txt.bold
  },
  text: {
    fontSize: scale(20),
    paddingTop: 20,
    fontFamily: txt.reg
  },
  textHeader: {
    paddingTop: 20,
    fontSize: scale(30),
    fontFamily: txt.bold
  },
  // Actual Header
  header: {
    backgroundColor: '#6D9AED',
    padding: scale(15),
    paddingTop: scale(35),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '28%'
},
  image: {
    width: scale(100),
    height: scale(100),
    marginBottom: 20,
    borderRadius: scale(40),
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
    marginTop: scale(100)
    // position: 'absolute',
    // bottom: HEIGHT*0.4
  },
  signintext: {
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: txt.bold,
    fontSize: txt.small,
    paddingTop: 24
  },
  logo: {
    position: 'absolute',
    top: HEIGHT*0.25,
    minHeight: 121,
    height: "14%"
  }
});

