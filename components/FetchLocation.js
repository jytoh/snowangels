import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


export default class FetchLocation extends React.Component {
    render(){
        return (
            /*<MaterialIcons 
            name = "my-location"
            color = "#000000"
            size = {32}
            style = {styles.button}
            onPress={() => this.props.onGetLocation()} /> */
        <Button title="Get Location" 
        style = {styles.button} 
        onPress={() => this.props.onGetLocation()} />
        )
    }
};

const styles = StyleSheet.create({
    button: {
        zIndex: 100,
        position: "absolute",
        top: 40,
        alignItems: "center"
    }
});
