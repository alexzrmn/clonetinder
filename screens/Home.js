import React, { Component } from "react";
import { View } from "react-native";
import Card from "../components/Card";
import * as firebase from 'firebase';

export default class Home extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      profileIndex: 0,
      profiles: []
    };
    
    firebase.database().ref().child('users').once('value', (snap) => {
      let profiles = []
      snap.forEach((profile) => {
        const {name, bio, birthday, id} = profile.val()
        profiles.push({name, bio, birthday, id})
      })
      this.setState({profiles})
    })
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