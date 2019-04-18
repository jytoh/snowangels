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
    const { title, visible, setModalVisibility } = props;

    console.log("visible", visible);

    if (!visible) {
        return null;
    }

    return(
        <View style={styles.overlayContainer}>
            <View style={styles.intersectionTextContainer}>
                <Text style={styles.intersectionText}>{title}</Text>
                <Button title="Report Shovel"
                 onPress= {async () => {
                                    try {
                                        var details = {
                                        'uid': 1,
                                        'cid': 1,
                                        'before_pic': "a",
                                      };

                                    var formBody = [];
                                    for (var property in details) {
                                        var encodedKey = encodeURIComponent(property);
                                        var encodedValue = encodeURIComponent(details[property]);
                                        formBody.push(encodedKey + "=" + encodedValue);
                                    }
                                    formBody = formBody.join("&");
                                    let response2 = await fetch('http://127.0.0.1:5000/new_request', {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                          },
                                          body: formBody,
                                        });
                                    let responseJson2 = await response2.json();

                                    console.log(responseJson2);
                                    console.log(responseJson2.user);
                                    console.log(responseJson2.corner);
                                    console.log(responseJson2.username);
                                    console.log("Report Shovel");
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                                    }
                />
                <Button
                    title="Start Shovel"
                    onPress= {async () => {
                    //{async () => {
                    try {
                        var details = {
                        'uid': 1,
                        'cid': 1,
                        'before_pic': "a",
                        'after_pic': "a",
                      };

                    var formBody = [];
                    for (var property in details) {
                        var encodedKey = encodeURIComponent(property);
                        var encodedValue = encodeURIComponent(details[property]);
                        formBody.push(encodedKey + "=" + encodedValue);
                    }
                    formBody = formBody.join("&");
                    let response2 = await fetch('http://127.0.0.1:5000/new_shovel', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                          },
                          body: formBody,
                        });
                    let responseJson2 = await response2.json();

                    console.log(responseJson2);
                    console.log(responseJson2.user);
                    console.log(responseJson2.corner);
                    console.log(responseJson2.username);
                    console.log("Start Shovel");


                                // let response = await fetch(
                                //     'http://127.0.0.1:5000/corner_street_names?cid=3'
                                // );
                                // let responseJson = await response.json();
                                // console.log(responseJson.street1);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }


                />
                <Button title="Hide" onPress={() => setModalVisibility(false)}/>
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
