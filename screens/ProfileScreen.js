import React from 'react';
import { Image, Button, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { SecureStore } from 'expo';
import {AsyncStorage} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import MenuButton from '../components/MenuButton'
import { MailComposer, Updates } from 'expo';
import { scale } from '../UI_logistics/ScaleRatios'
import txt from '../UI_logistics/TextStyles'
import Loader from '../components/Loader';

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;
export default class ProfileScreen extends React.Component {

  /*
  * The state maintains user information. Updated mainly with fetch_state()
  * bool signedIn: whether or not the user was signed in 
  *   when they last had the app open. Determines whether
  *   the login screen or the profile screen is displayed
  * int uid: user ID. Used to pull from backend
  * string name: Name
  * string photoUrl: Profile picture
  * string token: login/access token
  * bool loaded: Whether or not the sign-in was successful
  * int num_requests, num_shovels, points: Score/history data
  * bool loading: whether or not a component is loading
  */
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
        loading: false
    };


  /**
  * Invoked immedately after ProfileScreen is mounted
  * and calls fetch_state() to retrieve profile information 
  */
  async componentDidMount() {
    await this.fetch_state();
  };
  
  /**

   * Function linked to press of refresh button
   * 
   * When refresh button is pressed, this function pulls the 
   * number of user's requests, shovels, and points from the backend. 
   * It stores this information in the state for fast retrieval
   * in the future. 
   */

  async refresh() {
    await this.setState({loading: true})
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
    await this.setState({loading: false})
  };

  /**
   * Function linked to press of Give Feedback button
   * 
   * Directs the user to an email draft prompting the user to 
   * write their feedback. Currently, the address the email is 
   * being sent to is hard-coded here under 'recipients' and 
   * is intended to be the email of a designated administrator. 


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

   * Prompts the user to sign in with Google account
   *
   * If the user signs in successfully, this function 
   * stores their name, Google profile photo, Google ID,
   * and access token in state. It also stores 'signedIn' and
   * 'loaded' as true, which is used in other functions
   * to determine whether or not the screen can be rendered and 
   * whether to render the default sign-in screen or attempt
   * to render the user's profile. 
   * Adds a new user entry in the database if this is the user's first time logging in 
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
          Updates.reload();
          return result.accessToken;
        } else {
          return {cancelled: true};
        }
      } catch(e) {
        return {error: true};
      }
  };
  
  /**
   * Stores the state in AsyncStorage
   * 
   * The current state, including all the user's
   * information (default values is the user is not signed in) and
   * whether or not the user is signed in and the information
   * is properly loaded is stored via AsyncStorage
   * @param {state} state 
  */

  async store_state(state) {
    const json_state = JSON.stringify(state);
    try {
      await AsyncStorage.setItem('lastState', json_state)
    }
    catch (error){
    }
  };

  /**
   * Retrieves the state from AsyncStorage
   * 
   * This is called when profile screen is loaded to see whether
   * the user was already logged in and, if so, what that user's
   * information is. AsyncStorage is used to maintain a persistent
   * user state. If there is no last state, it sets the state 
   * to be default values, which will be overwritten once the
   * user logs in. 
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
   * Function linked to press of logout button
   * 
   * Logs the user out by resetting all values to default
   * values and setting signedIn to false.
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
    Updates.reload();
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

  /*
  * Renders the page. Returns a blank screen if not all components
  * are completely loaded or mounted. Otherwise, renders the profile
  * screen. If a user was not previously logged, renders the screen
  * prompting the user to sign in with google. 
  */
  render() {
    if (this.state.loaded == true) {
      if (this.state.signedIn == true) {
        return (
        <View style={styles.container}>
            <Loader loading={this.state.loading} />
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

/*
* This screen is rendered when fetch_state() returns that
* the user was not logged in last time they used the 
* app (or logged themselves out). This screen has the
* SnowAngels logo and a button for the user to sign in with
* their Google account
*/
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

/*
* This screen is rendered when fetch_state() returns that
* the user was logged in last time they used the app. The 
* screen contains the user's profile picture and name, 
* data about number of points, shovels, and reports,
* and options to give feedback to the administrators 
* or to log out.
*/
const LoggedInPage = props => {
  return ( 
    <ImageBackground style={styles.img} source={require('../assets/b-w-gradient.png')} > 
    <View style={styles.container2}>
      <View style={styles.containerbottom}>
        <Text style={styles.textHeader}> {"Summary"}</Text>
        <Text style= {styles.text}> {"Total Points: " + props.points}</Text>
        <Text style= {styles.text}> {"Total Shovels: " + props.num_shovels}</Text>
        <Text style= {styles.text}> {"Total Reports: " + props.num_requests}</Text>
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

