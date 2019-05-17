import React from 'react'
import { StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { scale } from '../UI_logistics/ScaleRatios'

export default class MenuButton extends React.Component {

    /**
      * This renders the menu icon and allows user to click on the menu to show side
      * navigation bar
      *
      * @return navigation bar
      */
    render() {
        return (
            <Ionicons
                name="md-menu"
                color="#000000"
                size={32}
                style={styles.menuIcon}
                onPress={() => this.props.navigation.toggleDrawer()}
            />
        )
    }
}
const styles = StyleSheet.create({
    menuIcon: {
        zIndex: 9,
        position: "absolute",
        top: scale(40),
        left: scale(25),
    }
})