import React, { Component } from "react";
import { View } from "react-native";
import Card from "../components/Card";
import * as firebase from 'firebase';
import * as Location from 'expo-location';

export default class Home extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      profileIndex: 0,
      profiles: []
    };

    this.updateUserLocation();
    
    firebase.database().ref().child('users').once('value', (snap) => {
      let profiles = []
      snap.forEach((profile) => {
        const {name, bio, birthday, id} = profile.val()
        profiles.push({name, bio, birthday, id})
      })
      this.setState({profiles})
    })
  }

  updateUserLocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if(status === 'granted') {
      const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: false});
      console.log('granted !!', location);
    } else {
      console.log('Permission denied');
    }
  }

  nextCard = () => {
    this.setState({ profileIndex: this.state.profileIndex + 1 });
  };

  render() {

    const { profiles } = this.state;
    const { profileIndex } = this.state;
      
    return (
      <View style={{ flex: 1 }}>
        {profiles
          .slice(profileIndex, profileIndex + profiles.length)
          .reverse()
          .map((profile) => {
            return (
              <Card
                key={profile.id}
                profile={profile}
                onSwipeOff={this.nextCard}
              />
            );
          })}
      </View>
    );
  }
}