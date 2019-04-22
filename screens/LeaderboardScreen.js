import React from 'react';
import Leaderboard from 'react-native-leaderboard';
import {ButtonGroup} from 'react-native-elements';
import MenuButton from '../components/MenuButton';
import {Text, View, Image} from 'react-native';
import {SecureStore} from "expo";

//SOURCES:https://github.com/JoeRoddy/react-native-leaderboard/blob/master/examples/AvatarAndClickable.js
//https://github.com/JoeRoddy/react-native-leaderboard/blob/master/examples/CustomExample.js

export default class LeaderboardScreen extends React.Component {

    constructor(props) {
        super(props);
//get all users from DB; should adjust references to states 
        this.state = {
            profs: [],
            user: {},
            rank: 0

        };
        this.refreshData();
    }

    compare(a, b) {
        if (a.szn_points < b.szn_points) {
            return -1;
        } else if (a.szn_points == b.szn_points) {
            return 0;
        } else {
            return 1;
        }
    }

    sortedProfs() {
        return 1 + this.state.profs.sort(this.compare).findIndex(item => item.name == this.state.user.name);
    }

//try to return whole thing with user info. Potentially make backend function that gets 5 before and 5 after 

    renderHeader() {
        this.refreshData();
        return (
            <View colors={[, '#DDE8FC', '#76A1EF']}
                  style={{
                      backgroundColor: '#76A1EF',
                      padding: 15,
                      paddingTop: 35,
                      alignItems: 'center'
                  }}>
                <Text style={{
                    fontSize: 25,
                    fontFamily: 'Cabin-Bold',
                    color: 'white',
                    paddingTop: 20
                }}>Leaderboard</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 15,
                    marginTop: 20
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: 25,
                        fontFamily: 'Cabin-Bold',
                        flex: 1,
                        textAlign: 'right',
                        marginRight: 40
                    }}>
                        {ordinal_suffix_of(this.state.rank)}
                    </Text>
                    <Image style={{
                        flex: .66,
                        height: 60,
                        width: 60,
                        borderRadius: 60 / 2
                    }}
                           source={{uri: this.state.user.photourl}}/>
                    <Text style={{
                        color: 'white',
                        fontSize: 25,
                        fontFamily: 'Cabin-Bold',
                        flex: 1,
                        marginLeft: 40
                    }}>
                        {this.state.user.szn_points} pts
                    </Text>
                </View>
            </View>
        )
    }

    async refreshData() {
        var data = await fetch('https://snowangels-api.herokuapp.com/get_all_users', {
            method: 'GET'
        }).then(response => response.json()).then((jsonData) => {
            return jsonData;
        }).catch((error) => {
            console.error(error);
        });
        var user_id = await SecureStore.getItemAsync('id');
        var usrdata = await fetch('https://snowangels-api.herokuapp.com/get_user?id=%d'.replace('%d', user_id), {
            method: 'GET'
        }).then(response => response.json()).then((jsonData) => {
            return jsonData;
        }).catch((error) => {
            console.error(error);
        });
        this.setState({
            profs: data.users,
            user: usrdata
        });

        this.setState({
            rank: this.sortedProfs()
        });
        // console.log(this.state);
    }

    render() {


        const props = {
            labelBy: "name",
            sortBy: "szn_pts",
            data: this.state.profs,
            icon: "photourl",
            evenRowColor: '#F5F6FE',
            labelStyle: {fontFamily: 'Cabin-Regular'},
            scoreStyle: {fontFamily: 'Cabin-Bold'}
            //labelStyle: this.state.user.rank % 2 > 0 ? {color: 'white'} : {color: 'red'}
        }

        return (
            <View style={{flex: 1, backgroundColor: 'white',}}>
                {this.renderHeader()}
                <Leaderboard {...props} />
                <MenuButton navigation={this.props.navigation}/>
            </View>
        )
    }

}
const ordinal_suffix_of = (i) => {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

