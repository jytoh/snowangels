import React from 'react'
import { StyleSheet, View, Text, Button, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

/**
 * The popup that appears when you click on a marker
 */
const MarkerOverlay = (props) => {
    /**
     * title: title of the point
     * visible: visibility of the marker
     */
    const { title, visible } = props;

    console.log("visible", visible);

    if (!visible) {
        return null;
    }

    return(
        <View style={styles.overlayContainer}>
            <View style={styles.intersectionTextContainer}>
                <Text style={styles.intersectionText}>{title}</Text>
                <Button title="Report Shovel"
                    onPress={() => {
                        console.log("Report Shovel")
                    }}
                />
                <Button title="Start Shovel"
                    onPress={() => {
                        console.log("Start Shovel")
                    }}
                />
                <Button title="Hide"/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topContainer: {
        height: '33.333%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    overlayContainer: {
        height: '33.33%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'powderblue',
        flex: 1
    },
    intersectionText: {
        textAlign: 'center',
        fontSize: 30,
    },
    intersectionTextContainer: {
        marginTop: '10%'
    }
})

export default MarkerOverlay;