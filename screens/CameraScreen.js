import React from 'react';
import { Image, TouchableOpacity, SafeAreaView, Button, StyleSheet, Text, View } from 'react-native';
import MenuButton from '../components/MenuButton'
// import Camera from 'react-native-camera';
import {Camera, Permissions, ImagePicker} from 'expo';
import {Feather} from '@expo/vector-icons';

export default class CameraScreen extends React.Component {
    state = {
        hasPermission: null,
        imageUri: null,
        type: Camera.Constants.Type.back,
    };
    async componentDidMount() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({ hasPermission: status === 'granted' });
    };
    async capturePicture() {
      console.log('made it to capture!')
      if (this.camera){
        let pic = await this.camera.takePictureAsync({base64 : true})
        .then(pic => this.setState({imageUri : pic.uri}))
        .catch(err => {throw err;});
        console.log('took a picture!')

      }
      else {console.log('doesnt enter')}
    }
    render() {
        const { hasPermission } = this.state;
        const { imageUri }  = this.state;
        if (hasPermission === null) {
        return <View />;
        } else if (hasPermission === false) {
            return (<SafeAreaVew><Text>No access to camera</Text></SafeAreaVew>);
        } else {
            if (this.state.imageUri) {
              console.log('ah yes!!');
              console.log(this.state.imageUri);
              return (
              <View style={styles.container}>
                <Image style={styles.image} 
                source={{uri: this.state.imageUri}}/>
                <Button title="Back to Camera" style={styles.camerabutton}
                onPress={() => {this.setState({imageUri : null})}} />
              </View> )}
            else {
            return (
        <View style={styles.container}>
          <MenuButton navigation={this.props.navigation} />
          <Camera ref={ref => {
            this.camera = ref;
          }} 
          style={styles.camera} type={this.state.type}>
            <View
              style={styles.bottombar}>
              <TouchableOpacity style={styles.fliptouchable}
                onPress={() => {this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={styles.flip}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>

              {/* nicer-looking button for later!
                <Feather 
                name = "camera"
                color = "#000000"
                size = {40}
                style = {styles.camerabutton}
                onPress={() => this.capturePicture.bind(this)}/> */}

              <TouchableOpacity style={styles.camerabutton}
                onPress={() => this.capturePicture()}>
                <Text style={styles.buttontext}> {' '}Take Picture{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )};
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottombar: {
    backgroundColor: 'transparent',
  },
  fliptouchable: {
    zIndex: 12,
    position: 'absolute',
    right: 10,
    bottom: 10
  },
  flip: {
    zIndex: 10,
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
    position: 'absolute',
    right: 10,
    bottom: 10
  },
  camera: {
    zIndex: -1,
    width: '100%',
    height: '100%',
    alignItems:'flex-end',
    justifyContent: 'flex-end',
  },
  camerabutton: {
    zIndex: 1000,
    position: 'absolute',
    right: 120,
    bottom: 10
  },
  buttontext: {    
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  image: {
    zIndex: 100,
    flex: 1,
    height: '50%'
  }
});